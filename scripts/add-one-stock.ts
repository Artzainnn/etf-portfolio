/**
 * Add (or refresh) a SINGLE stock without re-fetching the whole universe.
 *
 * The full refresh (db:refresh-stocks) rewrites data/stocks.json from
 * scratch and silently drops any ticker Yahoo fails on that run — too
 * risky to run just to add one name. This fetches one ticker, writes its
 * price file, and splices the record into the existing data/stocks.json,
 * leaving every other entry byte-for-byte untouched.
 *
 * Usage: npx tsx scripts/add-one-stock.ts AIR.PA [SAF.PA HO.PA ...]
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fetchYahooHistory } from "../lib/marketData/yahoo";
import { SEED_STOCKS, type SeedStock } from "./stock-data";

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

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Cache FX series per currency so a batch of same-currency stocks
// (e.g. lots of EUR names) only hits Yahoo once.
const fxCache = new Map<string, Map<string, number>>();

async function loadFxRates(
  fromCurrency: string,
  fromDate: Date,
): Promise<Map<string, number>> {
  if (fromCurrency === "SGD") return new Map();
  const cached = fxCache.get(fromCurrency);
  if (cached) return cached;
  const yahooTicker = `${fromCurrency}SGD=X`;
  const fx = await fetchYahooHistory(yahooTicker, fromDate, new Date());
  const map = new Map<string, number>();
  for (const p of fx.prices) map.set(isoDate(p.date), p.close);
  fxCache.set(fromCurrency, map);
  return map;
}

async function fetchStockSgd(
  stock: SeedStock,
): Promise<{ currency: string; rows: PriceRow[] } | null> {
  const fromDate = new Date(Date.now() - 366 * 15 * 86400_000);
  const result = await fetchYahooHistory(stock.ticker, fromDate, new Date());
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

async function main() {
  const tickers = process.argv.slice(2);
  if (tickers.length === 0) {
    console.error("Usage: npx tsx scripts/add-one-stock.ts <TICKER> [<TICKER> …]");
    process.exit(1);
  }

  const dataPath = path.resolve(process.cwd(), "data", "stocks.json");
  const priceDir = path.resolve(process.cwd(), "public", "data", "prices");
  if (!existsSync(priceDir)) mkdirSync(priceDir, { recursive: true });

  const existing = JSON.parse(readFileSync(dataPath, "utf8")) as Record<string, unknown>[];
  let added = 0;
  let updated = 0;
  const failures: string[] = [];

  for (const ticker of tickers) {
    const seed = SEED_STOCKS.find((s) => s.ticker === ticker);
    if (!seed) {
      console.error(`  ✗ ${ticker} — not in SEED_STOCKS (add it to stock-data.ts first).`);
      failures.push(ticker);
      continue;
    }
    console.log(`Fetching ${ticker}…`);
    let res;
    try {
      res = await fetchStockSgd(seed);
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
    const stats = computePeriodStats(res.rows);
    const ret1y = stats.periodReturns["1Y"];
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

    const record = {
      ticker,
      name: seed.name,
      friendlyName: seed.friendlyName,
      shortDescription: seed.shortDescription,
      industries: seed.industries,
      country: seed.country,
      emoji: seed.emoji,
      nativeCurrency: res.currency,
      periodReturns: stats.periodReturns,
      periodSparklines: stats.periodSparklines,
    };
    const idx = existing.findIndex((s) => s.ticker === ticker);
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
    }. data/stocks.json now has ${existing.length} stocks.`,
  );
  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
