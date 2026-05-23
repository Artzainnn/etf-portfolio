// Note: this module is server-side only (uses db, FX cache, Yahoo).
// We don't import "server-only" here because the same code is invoked
// from CLI scripts (refresh-stats, seed). The Next.js bundler keeps
// this file off the client by default since it imports `db`.
import { db } from "@/lib/db/client";
import { priceCache, fxCache, etfs } from "@/lib/db/schema";
import { and, asc, eq, gte, sql } from "drizzle-orm";
import { fetchYahooHistory } from "./yahoo";

export type Period = "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y" | "Max";

export interface PricePoint {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Price in SGD (the user's base currency) */
  sgd: number;
}

export interface PriceStats {
  /** Total return over the displayed period (e.g. 0.053 = +5.3%). */
  totalReturn: number;
  /** Annualized return if the period covers ≥1 year; null otherwise. */
  annualizedReturn: number | null;
  /** Biggest peak-to-trough decline within the period (negative). */
  maxDrawdown: number;
  /** Annualized volatility from daily log returns (null if insufficient data). */
  volatility: number | null;
  /** Number of years the displayed period actually spans (for labels). */
  periodYears: number;
}

export interface PriceSeries {
  ticker: string;
  nativeCurrency: string;
  /** Normalized so the first point = 100 (makes percent change easy to read). */
  pointsNormalized: { date: string; value: number }[];
  /** Raw SGD price points (for stat computation and "real value" display). */
  pointsSgd: PricePoint[];
  stats: PriceStats;
}

function periodToDays(period: Period): number | null {
  switch (period) {
    case "1M":
      return 31;
    case "3M":
      return 92;
    case "6M":
      return 183;
    case "1Y":
      return 366;
    case "3Y":
      return 366 * 3;
    case "5Y":
      return 366 * 5;
    case "Max":
      return null; // no lower bound
  }
}

function isoDate(d: Date | string): string {
  if (typeof d === "string") return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86400_000);
}

/**
 * Get prices for a ticker, converted to SGD, over a given period.
 *
 * Strategy:
 *   1. Look up the ETF's native currency from the DB.
 *   2. Read cached daily closes from `price_cache`.
 *   3. If cache is empty or stale (last entry > 1 day old), fetch fresh
 *      data from Yahoo Finance for the requested range and upsert.
 *   4. Convert each price to SGD using FX rates from `fx_cache` (fetched
 *      on-demand from Yahoo if missing).
 *   5. Compute returns/drawdown/volatility.
 */
export async function getPriceSeries(
  ticker: string,
  period: Period,
): Promise<PriceSeries | null> {
  const etfRow = await db
    .select({ currency: etfs.currency })
    .from(etfs)
    .where(eq(etfs.ticker, ticker))
    .limit(1);

  if (etfRow.length === 0) return null;
  const nativeCurrency = etfRow[0].currency ?? "USD";

  // Ensure native prices are cached and fresh
  await ensureNativePricesFresh(ticker, period);

  // Read native prices in the requested window from cache
  const days = periodToDays(period);
  const fromDate = days ? daysAgo(days) : new Date("1990-01-01");
  const cached = await db
    .select({
      date: priceCache.date,
      close: priceCache.closePrice,
    })
    .from(priceCache)
    .where(
      and(
        eq(priceCache.ticker, ticker),
        gte(priceCache.date, isoDate(fromDate)),
      ),
    )
    .orderBy(asc(priceCache.date));

  if (cached.length === 0) return null;

  // Normalize GBp (pence) → GBP
  let effectiveCurrency = nativeCurrency;
  let nativeScale = 1;
  if (nativeCurrency === "GBp" || nativeCurrency === "GBX") {
    effectiveCurrency = "GBP";
    nativeScale = 0.01;
  }

  // Build the FX rate map (date -> SGD-per-unit)
  const fxMap = await getFxMap(effectiveCurrency, fromDate, new Date());

  const pointsSgd: PricePoint[] = [];
  let lastFx: number | null = null;

  for (const row of cached) {
    const closeNative = parseFloat(row.close ?? "0") * nativeScale;
    if (!isFinite(closeNative) || closeNative === 0) continue;

    let fx: number;
    if (effectiveCurrency === "SGD") {
      fx = 1;
    } else {
      fx = fxMap.get(row.date) ?? lastFx ?? NaN;
    }

    if (!isFinite(fx)) continue;
    lastFx = fx;

    pointsSgd.push({
      date: row.date,
      sgd: closeNative * fx,
    });
  }

  if (pointsSgd.length === 0) return null;

  // Normalize to 100 at first point (so charts read as % change)
  const first = pointsSgd[0].sgd;
  const pointsNormalized = pointsSgd.map((p) => ({
    date: p.date,
    value: (p.sgd / first) * 100,
  }));

  const stats = computeStats(pointsSgd);

  return {
    ticker,
    nativeCurrency,
    pointsNormalized,
    pointsSgd,
    stats,
  };
}

/**
 * Ensure native prices for `ticker` covering the requested period are present
 * and fresh in `price_cache`. Fetches from Yahoo only when needed.
 */
async function ensureNativePricesFresh(
  ticker: string,
  period: Period,
): Promise<void> {
  const days = periodToDays(period);
  // For "Max" we ask Yahoo for ~15 years; for other periods we add a small
  // buffer so the user can switch periods up without another fetch.
  const fetchFromDate = daysAgo(days ? Math.max(days, 366) + 30 : 366 * 15);

  // What do we already have?
  const latest = await db
    .select({ maxDate: sql<string>`MAX(${priceCache.date})` })
    .from(priceCache)
    .where(eq(priceCache.ticker, ticker));

  const lastCached = latest[0]?.maxDate;
  const today = isoDate(new Date());

  // Three independent reasons to fetch — backfill takes priority since it
  // covers the "refresh" case too (one fetch instead of two).
  let fetchStartDate: Date | null = null;

  if (!lastCached) {
    // Empty cache — fetch the full requested period
    fetchStartDate = fetchFromDate;
  } else {
    const earliest = await db
      .select({ minDate: sql<string>`MIN(${priceCache.date})` })
      .from(priceCache)
      .where(eq(priceCache.ticker, ticker));
    const earliestCached = earliest[0]?.minDate;

    const needsBackfill =
      earliestCached && earliestCached > isoDate(fetchFromDate);
    const needsRefresh = lastCached < today;

    if (needsBackfill) {
      // Fetch full period — overlapping rows are handled by the upsert
      fetchStartDate = fetchFromDate;
    } else if (needsRefresh) {
      // Only need recent updates; start a few days back to handle holidays
      fetchStartDate = new Date(new Date(lastCached).getTime() - 3 * 86400_000);
    }
  }

  if (!fetchStartDate) return;

  try {
    const yahoo = await fetchYahooHistory(
      ticker,
      fetchStartDate,
      new Date(),
    );
    if (yahoo.prices.length === 0) return;

    // Upsert each row
    for (const p of yahoo.prices) {
      await db
        .insert(priceCache)
        .values({
          ticker,
          date: isoDate(p.date),
          closePrice: p.close.toString(),
        })
        .onConflictDoUpdate({
          target: [priceCache.ticker, priceCache.date],
          set: {
            closePrice: p.close.toString(),
          },
        });
    }

    // Detect currency mismatch and update the ETF row if Yahoo reports
    // something different (e.g. some LSE lines flip between GBp and GBP).
    if (yahoo.currency) {
      await db
        .update(etfs)
        .set({ currency: yahoo.currency })
        .where(and(eq(etfs.ticker, ticker), sql`${etfs.currency} IS NULL`));
    }
  } catch (err) {
    console.error(`[prices] Yahoo fetch failed for ${ticker}:`, err);
    // Swallow — caller will use whatever's in cache (may be empty)
  }
}

/**
 * Return a map of date (YYYY-MM-DD) → SGD-per-1-unit-of-fromCurrency.
 * Fetches from Yahoo on cache miss.
 */
async function getFxMap(
  fromCurrency: string,
  fromDate: Date,
  toDate: Date,
): Promise<Map<string, number>> {
  if (fromCurrency === "SGD") return new Map();

  const pair = `${fromCurrency}SGD`;

  // Ensure fresh-enough FX data
  await ensureFxFresh(pair, fromDate, toDate);

  const rows = await db
    .select({
      date: fxCache.date,
      rate: fxCache.rate,
    })
    .from(fxCache)
    .where(and(eq(fxCache.pair, pair), gte(fxCache.date, isoDate(fromDate))))
    .orderBy(asc(fxCache.date));

  const map = new Map<string, number>();
  for (const r of rows) {
    const rate = parseFloat(r.rate);
    if (isFinite(rate)) map.set(r.date, rate);
  }
  return map;
}

async function ensureFxFresh(
  pair: string,
  fromDate: Date,
  _toDate: Date,
): Promise<void> {
  const latest = await db
    .select({ maxDate: sql<string>`MAX(${fxCache.date})` })
    .from(fxCache)
    .where(eq(fxCache.pair, pair));

  const lastCached = latest[0]?.maxDate;
  const today = isoDate(new Date());

  let needsFetch = false;
  let fetchStartDate = new Date(fromDate);

  if (!lastCached) {
    needsFetch = true;
    // Always fetch a generous window for FX (it's small data)
    fetchStartDate = new Date(Date.now() - 366 * 15 * 86400_000);
  } else if (lastCached < today) {
    needsFetch = true;
    fetchStartDate = new Date(new Date(lastCached).getTime() - 3 * 86400_000);
  } else if (lastCached && fromDate < new Date(lastCached)) {
    // Check if we need older data
    const earliest = await db
      .select({ minDate: sql<string>`MIN(${fxCache.date})` })
      .from(fxCache)
      .where(eq(fxCache.pair, pair));
    const earliestCached = earliest[0]?.minDate;
    if (earliestCached && earliestCached > isoDate(fromDate)) {
      needsFetch = true;
      fetchStartDate = new Date(Date.now() - 366 * 15 * 86400_000);
    }
  }

  if (!needsFetch) return;

  try {
    // Yahoo tickers for FX: e.g. "USDSGD=X", "EURSGD=X", "GBPSGD=X"
    const yahooTicker = `${pair}=X`;
    const yahoo = await fetchYahooHistory(yahooTicker, fetchStartDate, new Date());

    for (const p of yahoo.prices) {
      await db
        .insert(fxCache)
        .values({
          pair,
          date: isoDate(p.date),
          rate: p.close.toString(),
        })
        .onConflictDoUpdate({
          target: [fxCache.pair, fxCache.date],
          set: {
            rate: p.close.toString(),
          },
        });
    }
  } catch (err) {
    console.error(`[fx] Yahoo fetch failed for ${pair}:`, err);
  }
}

function computeStats(points: PricePoint[]): PriceStats {
  if (points.length < 2) {
    return {
      totalReturn: 0,
      annualizedReturn: null,
      maxDrawdown: 0,
      volatility: null,
      periodYears: 0,
    };
  }

  const first = points[0].sgd;
  const last = points[points.length - 1].sgd;
  const totalReturn = last / first - 1;

  const periodYears =
    (new Date(points[points.length - 1].date).getTime() -
      new Date(points[0].date).getTime()) /
    (365.25 * 86400_000);

  // Annualize only when the period covers a meaningful stretch (≥1 year).
  // For shorter periods, "per year" is misleading.
  const annualizedReturn =
    periodYears >= 1 ? Math.pow(1 + totalReturn, 1 / periodYears) - 1 : null;

  // Max drawdown across the whole displayed period
  let peak = first;
  let maxDD = 0;
  for (const p of points) {
    if (p.sgd > peak) peak = p.sgd;
    const dd = p.sgd / peak - 1;
    if (dd < maxDD) maxDD = dd;
  }

  // Annualized volatility from daily log returns
  const logReturns: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const r = Math.log(points[i].sgd / points[i - 1].sgd);
    if (isFinite(r)) logReturns.push(r);
  }
  let volatility: number | null = null;
  if (logReturns.length > 20) {
    const mean = logReturns.reduce((a, b) => a + b, 0) / logReturns.length;
    const variance =
      logReturns.reduce((s, r) => s + (r - mean) ** 2, 0) /
      (logReturns.length - 1);
    volatility = Math.sqrt(variance) * Math.sqrt(252); // 252 trading days
  }

  return {
    totalReturn,
    annualizedReturn,
    maxDrawdown: maxDD,
    volatility,
    periodYears,
  };
}
