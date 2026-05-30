/**
 * Fetch Yahoo Finance data for every stock in `stock-data.ts`,
 * convert each price series to SGD, compute multi-period returns +
 * sparklines, and write everything to static files:
 *   - data/stocks.json — metadata + computed stats for the list view
 *   - public/data/prices/{ticker}.json — raw SGD points for charts
 *
 * Same shape as the ETF pipeline so the existing client price helpers
 * and chart components Just Work.
 *
 * Run: npm run db:refresh-stocks
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fetchYahooHistory } from "../lib/marketData/yahoo";

import { SEED_STOCKS, type SeedStock } from "./stock-data";

const BATCH_SIZE = 5;

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

// In-memory FX cache shared across all stocks for this run.
const fxCache = new Map<string, Map<string, number>>(); // pair → date → rate

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function loadFxRates(
  fromCurrency: string,
  fromDate: Date,
): Promise<Map<string, number>> {
  if (fromCurrency === "SGD") return new Map();
  const pair = `${fromCurrency}SGD`;
  const cached = fxCache.get(pair);
  if (cached) return cached;

  const yahooTicker = `${pair}=X`;
  try {
    const fx = await fetchYahooHistory(yahooTicker, fromDate, new Date());
    const map = new Map<string, number>();
    for (const p of fx.prices) {
      map.set(isoDate(p.date), p.close);
    }
    fxCache.set(pair, map);
    return map;
  } catch (e) {
    console.error(`[fx] couldn't load ${pair}:`, (e as Error).message);
    return new Map();
  }
}

async function fetchStockSgd(
  stock: SeedStock,
): Promise<{ currency: string; rows: PriceRow[] } | null> {
  const fromDate = new Date(Date.now() - 366 * 15 * 86400_000); // up to 15y
  let result;
  try {
    result = await fetchYahooHistory(stock.ticker, fromDate, new Date());
  } catch (e) {
    console.log(`  ✗ ${stock.ticker} — ${(e as Error).message}`);
    return null;
  }
  if (result.prices.length === 0) {
    console.log(`  ⚠ ${stock.ticker} — empty series`);
    return null;
  }

  let currency = result.currency;
  let scale = 1;
  if (currency === "GBp" || currency === "GBX") {
    currency = "GBP";
    scale = 0.01;
  }

  const fx =
    currency === "SGD"
      ? new Map<string, number>()
      : await loadFxRates(currency, fromDate);

  const rows: PriceRow[] = [];
  let lastFx: number | null = null;
  for (const p of result.prices) {
    const dateStr = isoDate(p.date);
    const native = p.close * scale;
    if (!isFinite(native) || native <= 0) continue;
    let rate: number;
    if (currency === "SGD") {
      rate = 1;
    } else {
      rate = fx.get(dateStr) ?? lastFx ?? NaN;
    }
    if (!isFinite(rate)) continue;
    lastFx = rate;
    rows.push({ date: dateStr, sgd: native * rate });
  }
  return { currency: result.currency, rows };
}

function computePeriodStats(rows: PriceRow[]): {
  periodReturns: Record<string, number>;
  periodSparklines: Record<string, number[]>;
} {
  const out = { periodReturns: {} as Record<string, number>, periodSparklines: {} as Record<string, number[]> };
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
    for (let i = 0; i < sliced.length; i += step) {
      sampled.push((sliced[i].sgd / first) * 100);
    }
    if (sampled[sampled.length - 1] !== (sliced[sliced.length - 1].sgd / first) * 100) {
      sampled.push((sliced[sliced.length - 1].sgd / first) * 100);
    }
    out.periodSparklines[periodKey] = sampled;
  }
  return out;
}

interface OutputStock {
  ticker: string;
  name: string;
  friendlyName: string;
  shortDescription: string;
  industries: string[];
  country: string;
  emoji?: string;
  nativeCurrency: string;
  periodReturns: Record<string, number>;
  periodSparklines: Record<string, number[]>;
}

async function main() {
  const dataDir = path.resolve(process.cwd(), "data");
  const priceDir = path.resolve(process.cwd(), "public", "data", "prices");
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  if (!existsSync(priceDir)) mkdirSync(priceDir, { recursive: true });

  console.log(`Refreshing ${SEED_STOCKS.length} stocks…`);

  const output: OutputStock[] = [];
  let succeeded = 0;
  let failed = 0;

  // Process in batches to avoid hammering Yahoo
  for (let i = 0; i < SEED_STOCKS.length; i += BATCH_SIZE) {
    const batch = SEED_STOCKS.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (s) => {
        const res = await fetchStockSgd(s);
        return { s, res };
      }),
    );
    for (const { s, res } of results) {
      if (!res) {
        failed++;
        continue;
      }
      const stats = computePeriodStats(res.rows);
      const ret1y = stats.periodReturns["1Y"];
      const r1y = ret1y != null ? `${(ret1y * 100).toFixed(1)}%` : "—";
      console.log(`  ✓ ${s.ticker.padEnd(8)} 1Y=${r1y.padStart(7)}`);

      // Write price file
      const payload = {
        ticker: s.ticker,
        nativeCurrency: res.currency,
        baseCurrency: "SGD",
        points: res.rows.map((p) => [p.date, p.sgd] as [string, number]),
      };
      writeFileSync(path.join(priceDir, `${s.ticker}.json`), JSON.stringify(payload));

      output.push({
        ticker: s.ticker,
        name: s.name,
        friendlyName: s.friendlyName,
        shortDescription: s.shortDescription,
        industries: s.industries,
        country: s.country,
        emoji: s.emoji,
        nativeCurrency: res.currency,
        periodReturns: stats.periodReturns,
        periodSparklines: stats.periodSparklines,
      });
      succeeded++;
    }
  }

  writeFileSync(
    path.join(dataDir, "stocks.json"),
    JSON.stringify(output, null, 2),
  );

  console.log(`\nDone. ${succeeded} OK, ${failed} failed.`);
  console.log(`Wrote data/stocks.json (${output.length} records) + ${succeeded} price files.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Refresh failed:", err);
  process.exit(1);
});
