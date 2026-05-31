/**
 * Add (or refresh) a SINGLE ETF without re-fetching the whole universe.
 *
 * Mirrors add-one-stock: the full refresh rewrites data/etfs.json from
 * scratch and drops any ticker Yahoo fails on that run, so it's risky to
 * run just to add one fund. This fetches one ticker (from the seed in
 * etf-data.ts), writes its SGD price file, and splices the computed
 * record into the existing data/etfs.json, leaving every other entry
 * untouched. New entries get a fresh unique id (max existing + 1).
 *
 * Usage: npx tsx scripts/add-one-etf.ts CACC.PA
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fetchYahooHistory } from "../lib/marketData/yahoo";
import { seedEtfs } from "./etf-data";

type Period = "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y" | "Max";
const PERIOD_DAYS: Record<Period, number | null> = {
  "1M": 31,
  "3M": 92,
  "6M": 183,
  "1Y": 366,
  "3Y": 366 * 3,
  "5Y": 366 * 5,
  Max: null,
};

interface PriceRow {
  date: string;
  sgd: number;
}

const fxCache = new Map<string, Map<string, number>>();
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

async function loadFxRates(fromCurrency: string, fromDate: Date) {
  if (fromCurrency === "SGD") return new Map<string, number>();
  const cached = fxCache.get(fromCurrency);
  if (cached) return cached;
  const fx = await fetchYahooHistory(`${fromCurrency}SGD=X`, fromDate, new Date());
  const map = new Map<string, number>();
  for (const p of fx.prices) map.set(isoDate(p.date), p.close);
  fxCache.set(fromCurrency, map);
  return map;
}

async function fetchEtfSgd(
  ticker: string,
): Promise<{ currency: string; rows: PriceRow[] } | null> {
  const fromDate = new Date(Date.now() - 366 * 15 * 86400_000);
  const result = await fetchYahooHistory(ticker, fromDate, new Date());
  if (result.prices.length === 0) return null;

  let currency = result.currency;
  let scale = 1;
  if (currency === "GBp" || currency === "GBX") {
    currency = "GBP";
    scale = 0.01;
  }
  const fx =
    currency === "SGD" ? new Map<string, number>() : await loadFxRates(currency, fromDate);

  const rows: PriceRow[] = [];
  let lastFx: number | null = null;
  for (const p of result.prices) {
    const dateStr = isoDate(p.date);
    const native = p.close * scale;
    if (!isFinite(native) || native <= 0) continue;
    let rate: number;
    if (currency === "SGD") rate = 1;
    else rate = fx.get(dateStr) ?? lastFx ?? NaN;
    if (!isFinite(rate)) continue;
    lastFx = rate;
    rows.push({ date: dateStr, sgd: native * rate });
  }
  return { currency: result.currency, rows };
}

function computePeriodStats(rows: PriceRow[]) {
  const out = {
    periodReturns: {} as Record<string, number>,
    periodSparklines: {} as Record<string, number[]>,
  };
  if (rows.length < 2) return out;
  const lastMs = new Date(rows[rows.length - 1].date).getTime();
  for (const [periodKey, days] of Object.entries(PERIOD_DAYS) as [Period, number | null][]) {
    const cutoff = days ? new Date(lastMs - days * 86400_000) : null;
    const sliced = cutoff ? rows.filter((p) => new Date(p.date) >= cutoff) : rows;
    if (sliced.length < 2) continue;
    const first = sliced[0].sgd;
    const last = sliced[sliced.length - 1].sgd;
    out.periodReturns[periodKey] = last / first - 1;
    const SAMPLES = 30;
    const step = Math.max(1, Math.floor(sliced.length / SAMPLES));
    const sampled: number[] = [];
    for (let i = 0; i < sliced.length; i += step) sampled.push((sliced[i].sgd / first) * 100);
    const lastPct = (sliced[sliced.length - 1].sgd / first) * 100;
    if (sampled[sampled.length - 1] !== lastPct) sampled.push(lastPct);
    out.periodSparklines[periodKey] = sampled;
  }
  return out;
}

function computeLegacyStats(rows: PriceRow[]) {
  const out = {
    return1Y: null as string | null,
    return3YAnnualized: null as string | null,
    return5YAnnualized: null as string | null,
    maxDrawdown5Y: null as string | null,
    sparkline1Y: null as string | null,
  };
  if (rows.length < 2) return out;
  const lastIdx = rows.length - 1;
  const lastDate = new Date(rows[lastIdx].date);
  const last = rows[lastIdx].sgd;

  const oneYearAgo = new Date(lastDate.getTime() - 365 * 86400_000);
  const start1Y = rows.find((p) => new Date(p.date) >= oneYearAgo);
  if (start1Y) {
    out.return1Y = (last / start1Y.sgd - 1).toFixed(4);
    const points1Y = rows.slice(rows.indexOf(start1Y));
    const step = Math.max(1, Math.floor(points1Y.length / 30));
    const spark: number[] = [];
    const base = points1Y[0].sgd;
    for (let i = 0; i < points1Y.length; i += step) spark.push((points1Y[i].sgd / base) * 100);
    const lastPct = (points1Y[points1Y.length - 1].sgd / base) * 100;
    if (spark[spark.length - 1] !== lastPct) spark.push(lastPct);
    out.sparkline1Y = JSON.stringify(spark);
  }

  const threeYearsAgo = new Date(lastDate.getTime() - 365 * 3 * 86400_000);
  const start3Y = rows.find((p) => new Date(p.date) >= threeYearsAgo);
  if (start3Y) {
    const years =
      (lastDate.getTime() - new Date(start3Y.date).getTime()) / (365.25 * 86400_000);
    if (years >= 2) out.return3YAnnualized = (Math.pow(last / start3Y.sgd, 1 / years) - 1).toFixed(4);
  }

  const fiveYearsAgo = new Date(lastDate.getTime() - 365 * 5 * 86400_000);
  const start5Y = rows.find((p) => new Date(p.date) >= fiveYearsAgo);
  if (start5Y) {
    const fiveYSlice = rows.slice(rows.indexOf(start5Y));
    const years =
      (lastDate.getTime() - new Date(start5Y.date).getTime()) / (365.25 * 86400_000);
    if (years >= 4) out.return5YAnnualized = (Math.pow(last / start5Y.sgd, 1 / years) - 1).toFixed(4);
    let peak = fiveYSlice[0].sgd;
    let maxDD = 0;
    for (const p of fiveYSlice) {
      if (p.sgd > peak) peak = p.sgd;
      const dd = p.sgd / peak - 1;
      if (dd < maxDD) maxDD = dd;
    }
    out.maxDrawdown5Y = maxDD.toFixed(4);
  }
  return out;
}

async function main() {
  const tickers = process.argv.slice(2);
  if (tickers.length === 0) {
    console.error("Usage: npx tsx scripts/add-one-etf.ts <TICKER> [<TICKER> …]");
    process.exit(1);
  }

  const dataPath = path.resolve(process.cwd(), "data", "etfs.json");
  const priceDir = path.resolve(process.cwd(), "public", "data", "prices");
  if (!existsSync(priceDir)) mkdirSync(priceDir, { recursive: true });

  const existing = JSON.parse(readFileSync(dataPath, "utf8")) as Record<string, unknown>[];
  let nextId = Math.max(0, ...existing.map((e) => Number(e.id) || 0)) + 1;
  let added = 0;
  let updated = 0;
  const failures: string[] = [];

  for (const ticker of tickers) {
    const etf = seedEtfs.find((e) => e.ticker === ticker);
    if (!etf) {
      console.error(`  ✗ ${ticker} — not in seedEtfs (add it to etf-data.ts first).`);
      failures.push(ticker);
      continue;
    }
    console.log(`Fetching ${ticker}…`);
    let res;
    try {
      res = await fetchEtfSgd(ticker);
    } catch (e) {
      console.error(`  ✗ ${ticker} — ${(e as Error).message}`);
      failures.push(ticker);
      continue;
    }
    if (!res || res.rows.length < 2) {
      console.error(`  ✗ ${ticker} — no usable series`);
      failures.push(ticker);
      continue;
    }
    const period = computePeriodStats(res.rows);
    const legacy = computeLegacyStats(res.rows);
    const ret1y = period.periodReturns["1Y"];
    console.log(
      `  ✓ ${ticker.padEnd(8)} ${res.rows.length} points, 1Y=${ret1y != null ? (ret1y * 100).toFixed(1) + "%" : "—"}`,
    );

    writeFileSync(
      path.join(priceDir, `${ticker}.json`),
      JSON.stringify({
        ticker,
        nativeCurrency: res.currency,
        baseCurrency: "SGD",
        points: res.rows.map((p) => [p.date, p.sgd] as [string, number]),
      }),
    );

    const idx = existing.findIndex((e) => e.ticker === ticker);
    const id = idx >= 0 ? existing[idx].id : nextId++;
    const now = new Date().toISOString();
    const record = {
      id,
      ticker: etf.ticker,
      isin: etf.isin ?? null,
      name: etf.name,
      friendlyName: etf.friendlyName ?? null,
      shortDescription: etf.shortDescription ?? null,
      longDescription: etf.longDescription ?? null,
      category: etf.category ?? null,
      subCategory: etf.subCategory ?? null,
      ter: etf.ter ?? null,
      domicile: etf.domicile ?? null,
      isUcits: etf.isUcits ?? true,
      isAccumulating: etf.isAccumulating ?? null,
      exchange: etf.exchange ?? null,
      currency: etf.currency ?? res.currency,
      riskScore: etf.riskScore ?? null,
      inceptionDate: etf.inceptionDate ?? null,
      ibkrAvailable: etf.ibkrAvailable ?? true,
      ibkrSymbol: etf.ibkrSymbol ?? null,
      factSheetUrl: etf.factSheetUrl ?? null,
      issuer: etf.issuer ?? null,
      benchmark: etf.benchmark ?? null,
      tags: etf.tags ?? null,
      pros: etf.pros ?? null,
      cons: etf.cons ?? null,
      return1Y: legacy.return1Y,
      return3YAnnualized: legacy.return3YAnnualized,
      return5YAnnualized: legacy.return5YAnnualized,
      maxDrawdown5Y: legacy.maxDrawdown5Y,
      sparkline1Y: legacy.sparkline1Y,
      statsUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
      periodReturns: period.periodReturns,
      periodSparklines: period.periodSparklines,
    };
    if (idx >= 0) {
      existing[idx] = record;
      updated++;
    } else {
      existing.push(record);
      added++;
    }
  }

  writeFileSync(dataPath, JSON.stringify(existing, null, 2));
  console.log(
    `\nDone. ${added} added, ${updated} updated, ${failures.length} failed${
      failures.length ? ` (${failures.join(", ")})` : ""
    }. data/etfs.json now has ${existing.length} ETFs.`,
  );
  process.exit(failures.length ? 1 : 0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
