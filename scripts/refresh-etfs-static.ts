/**
 * Fetch Yahoo Finance data for every ETF in `etf-data.ts`, convert each
 * price series to SGD, compute multi-period returns + sparklines, and
 * write everything to static files. Database-free — designed to run in
 * GitHub Actions.
 *
 *   - data/etfs.json — metadata + computed stats for the list view
 *   - public/data/prices/{ticker}.json — raw SGD points for charts
 *
 * Run: npm run db:refresh-etfs-static
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fetchYahooHistory } from "../lib/marketData/yahoo";
import { seedEtfs } from "./etf-data";

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

const fxCache = new Map<string, Map<string, number>>();

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

  try {
    const fx = await fetchYahooHistory(`${pair}=X`, fromDate, new Date());
    const map = new Map<string, number>();
    for (const p of fx.prices) map.set(isoDate(p.date), p.close);
    fxCache.set(pair, map);
    return map;
  } catch (e) {
    console.error(`[fx] couldn't load ${pair}:`, (e as Error).message);
    return new Map();
  }
}

async function fetchEtfSgd(
  ticker: string,
): Promise<{ currency: string; rows: PriceRow[] } | null> {
  const fromDate = new Date(Date.now() - 366 * 15 * 86400_000);
  let result;
  try {
    result = await fetchYahooHistory(ticker, fromDate, new Date());
  } catch (e) {
    console.log(`  ✗ ${ticker} — ${(e as Error).message}`);
    return null;
  }
  if (result.prices.length === 0) {
    console.log(`  ⚠ ${ticker} — empty series`);
    return null;
  }

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

interface PeriodOutput {
  periodReturns: Record<string, number>;
  periodSparklines: Record<string, number[]>;
}

function computePeriodStats(rows: PriceRow[]): PeriodOutput {
  const out: PeriodOutput = { periodReturns: {}, periodSparklines: {} };
  if (rows.length < 2) return out;
  const lastMs = new Date(rows[rows.length - 1].date).getTime();

  for (const [periodKey, days] of Object.entries(PERIOD_DAYS) as [
    Period,
    number | null,
  ][]) {
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
    if (
      sampled[sampled.length - 1] !==
      (sliced[sliced.length - 1].sgd / first) * 100
    ) {
      sampled.push((sliced[sliced.length - 1].sgd / first) * 100);
    }
    out.periodSparklines[periodKey] = sampled;
  }
  return out;
}

/**
 * Legacy single-period stats kept for backward compat with code that
 * still reads return1Y / return3YAnnualized / return5YAnnualized /
 * maxDrawdown5Y / sparkline1Y as raw string fields on the ETF row.
 */
interface LegacyStats {
  return1Y: string | null;
  return3YAnnualized: string | null;
  return5YAnnualized: string | null;
  maxDrawdown5Y: string | null;
  sparkline1Y: string | null;
}

function computeLegacyStats(rows: PriceRow[]): LegacyStats {
  const out: LegacyStats = {
    return1Y: null,
    return3YAnnualized: null,
    return5YAnnualized: null,
    maxDrawdown5Y: null,
    sparkline1Y: null,
  };
  if (rows.length < 2) return out;

  const lastIdx = rows.length - 1;
  const lastDate = new Date(rows[lastIdx].date);
  const last = rows[lastIdx].sgd;

  // 1Y total return
  const oneYearAgo = new Date(lastDate.getTime() - 365 * 86400_000);
  const start1Y = rows.find((p) => new Date(p.date) >= oneYearAgo);
  if (start1Y) {
    out.return1Y = (last / start1Y.sgd - 1).toFixed(4);

    // Sparkline (last 1Y, ~30 samples normalised to 100 at start)
    const points1Y = rows.slice(rows.indexOf(start1Y));
    const step = Math.max(1, Math.floor(points1Y.length / 30));
    const spark: number[] = [];
    const base = points1Y[0].sgd;
    for (let i = 0; i < points1Y.length; i += step) {
      spark.push((points1Y[i].sgd / base) * 100);
    }
    if (spark[spark.length - 1] !== (points1Y[points1Y.length - 1].sgd / base) * 100) {
      spark.push((points1Y[points1Y.length - 1].sgd / base) * 100);
    }
    out.sparkline1Y = JSON.stringify(spark);
  }

  // 3Y annualized
  const threeYearsAgo = new Date(lastDate.getTime() - 365 * 3 * 86400_000);
  const start3Y = rows.find((p) => new Date(p.date) >= threeYearsAgo);
  if (start3Y) {
    const years =
      (lastDate.getTime() - new Date(start3Y.date).getTime()) /
      (365.25 * 86400_000);
    if (years >= 2) {
      out.return3YAnnualized = (Math.pow(last / start3Y.sgd, 1 / years) - 1).toFixed(4);
    }
  }

  // 5Y annualized + max drawdown over 5Y window
  const fiveYearsAgo = new Date(lastDate.getTime() - 365 * 5 * 86400_000);
  const start5Y = rows.find((p) => new Date(p.date) >= fiveYearsAgo);
  if (start5Y) {
    const fiveYSlice = rows.slice(rows.indexOf(start5Y));
    const years =
      (lastDate.getTime() - new Date(start5Y.date).getTime()) /
      (365.25 * 86400_000);
    if (years >= 4) {
      out.return5YAnnualized = (Math.pow(last / start5Y.sgd, 1 / years) - 1).toFixed(4);
    }
    // Max drawdown across the slice
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
  const dataDir = path.resolve(process.cwd(), "data");
  const priceDir = path.resolve(process.cwd(), "public", "data", "prices");
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  if (!existsSync(priceDir)) mkdirSync(priceDir, { recursive: true });

  console.log(`Refreshing ${seedEtfs.length} ETFs (no DB)…`);

  const output: unknown[] = [];
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < seedEtfs.length; i += BATCH_SIZE) {
    const batch = seedEtfs.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (etf) => {
        const res = await fetchEtfSgd(etf.ticker);
        return { etf, res };
      }),
    );
    for (const { etf, res } of results) {
      if (!res) {
        failed++;
        continue;
      }
      const period = computePeriodStats(res.rows);
      const legacy = computeLegacyStats(res.rows);
      const ret1y = period.periodReturns["1Y"];
      const r1y = ret1y != null ? `${(ret1y * 100).toFixed(1)}%` : "—";
      console.log(`  ✓ ${etf.ticker.padEnd(8)} 1Y=${r1y.padStart(7)}`);

      // Write price file
      writeFileSync(
        path.join(priceDir, `${etf.ticker}.json`),
        JSON.stringify({
          ticker: etf.ticker,
          nativeCurrency: res.currency,
          baseCurrency: "SGD",
          points: res.rows.map((p) => [p.date, p.sgd] as [string, number]),
        }),
      );

      // Update currency field if Yahoo reports something the seed doesn't have
      const effectiveCurrency = etf.currency ?? res.currency;

      output.push({
        // Stable fake id derived from index — components use ticker as the
        // real identity but Etf type expects a numeric id from Drizzle.
        id: i + (batch.indexOf(etf) + 1),
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
        currency: effectiveCurrency,
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
        statsUpdatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        periodReturns: period.periodReturns,
        periodSparklines: period.periodSparklines,
      });
      succeeded++;
    }
  }

  writeFileSync(
    path.join(dataDir, "etfs.json"),
    JSON.stringify(output, null, 2),
  );
  console.log(`\nDone. ${succeeded} OK, ${failed} failed.`);
  console.log(`Wrote data/etfs.json (${output.length} records) + ${succeeded} price files.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Refresh failed:", err);
  process.exit(1);
});
