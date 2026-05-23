/**
 * Export everything the deployed app needs into static JSON files.
 * Run this whenever you want to refresh the snapshot served to the web app:
 *   npm run db:refresh-stats   # pull latest from Yahoo into local Postgres
 *   npm run db:export-static   # dump local Postgres → data/*.json
 *   git add data/ && git commit -m "Refresh ETF data" && git push
 *
 * Output:
 *   data/etfs.json          — 44 ETFs with all metadata + stats
 *   data/prices/*.json      — one file per ticker with SGD-converted price points
 *   data/manifest.json      — metadata (last update, ticker list)
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

async function main() {
  if (!process.env.POSTGRES_URL) {
    console.error("✗ POSTGRES_URL is not set.");
    process.exit(1);
  }

  const { db } = await import("../lib/db/client");
  const { etfs } = await import("../lib/db/schema");
  const { getPriceSeries } = await import("../lib/marketData/prices");
  const { asc } = await import("drizzle-orm");

  // etfs.json is server-imported (bundled into the build).
  // prices/*.json are fetched by the client at runtime, so they live in /public.
  const outDir = path.resolve(process.cwd(), "data");
  const priceDir = path.resolve(process.cwd(), "public", "data", "prices");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  if (!existsSync(priceDir)) mkdirSync(priceDir, { recursive: true });

  // ── 1. Export ETF metadata + stats ────────────────────────────────
  const allEtfs = await db
    .select()
    .from(etfs)
    .orderBy(asc(etfs.category), asc(etfs.ticker));

  console.log(`Exporting ${allEtfs.length} ETFs…`);

  // Per-period returns + sparkline (for the global period filter on the list view)
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

  function computePeriodData(allPoints: { date: string; sgd: number }[]) {
    const out: {
      returns: Record<string, number>;
      sparklines: Record<string, number[]>;
    } = { returns: {}, sparklines: {} };

    if (allPoints.length < 2) return out;

    const lastDateMs = new Date(allPoints[allPoints.length - 1].date).getTime();

    for (const [periodKey, days] of Object.entries(PERIOD_DAYS) as [
      Period,
      number | null,
    ][]) {
      const cutoff = days
        ? new Date(lastDateMs - days * 86400_000)
        : null;
      const sliced = cutoff
        ? allPoints.filter((p) => new Date(p.date) >= cutoff)
        : allPoints;
      if (sliced.length < 2) continue;

      const first = sliced[0].sgd;
      const last = sliced[sliced.length - 1].sgd;
      out.returns[periodKey] = last / first - 1;

      // Sample ~30 points
      const TARGET = 30;
      const step = Math.max(1, Math.floor(sliced.length / TARGET));
      const sampled: number[] = [];
      for (let i = 0; i < sliced.length; i += step) {
        sampled.push((sliced[i].sgd / first) * 100);
      }
      // Always include the last point
      if (
        sampled[sampled.length - 1] !==
        (sliced[sliced.length - 1].sgd / first) * 100
      ) {
        sampled.push((sliced[sliced.length - 1].sgd / first) * 100);
      }
      out.sparklines[periodKey] = sampled;
    }
    return out;
  }

  // Build enriched ETF records with periodReturns + periodSparklines
  const enrichedEtfs = [];
  for (const etf of allEtfs) {
    const series = await getPriceSeries(etf.ticker, "Max");
    let periodReturns: Record<string, number> = {};
    let periodSparklines: Record<string, number[]> = {};
    if (series && series.pointsSgd.length >= 2) {
      const computed = computePeriodData(series.pointsSgd);
      periodReturns = computed.returns;
      periodSparklines = computed.sparklines;
    }
    enrichedEtfs.push({ ...etf, periodReturns, periodSparklines });
  }

  writeFileSync(
    path.join(outDir, "etfs.json"),
    JSON.stringify(enrichedEtfs, null, 2),
  );
  console.log(`  ✓ data/etfs.json (${enrichedEtfs.length} records with multi-period data)`);

  // ── 2. Export per-ticker price series (all periods in one) ────────
  // We export 'Max' (15 years) once per ticker — the client can slice it.
  console.log("\nExporting price series (Max range) per ticker…");
  let priceFilesWritten = 0;
  for (const etf of allEtfs) {
    try {
      const series = await getPriceSeries(etf.ticker, "Max");
      if (!series) {
        console.log(`  ⚠ ${etf.ticker} — no series`);
        continue;
      }
      // Compact: store just the SGD-converted price points.
      // The client (or API route) recomputes stats per-period from this.
      const payload = {
        ticker: series.ticker,
        nativeCurrency: series.nativeCurrency,
        baseCurrency: "SGD",
        // Compact representation: [[date, sgdPrice], ...]
        points: series.pointsSgd.map((p) => [p.date, p.sgd] as [string, number]),
      };
      writeFileSync(
        path.join(priceDir, `${etf.ticker}.json`),
        JSON.stringify(payload),
      );
      priceFilesWritten++;
    } catch (err) {
      console.log(`  ✗ ${etf.ticker} — ${(err as Error).message}`);
    }
  }
  console.log(`  ✓ ${priceFilesWritten} price files written to data/prices/`);

  // ── 3. Manifest ───────────────────────────────────────────────────
  const manifest = {
    generatedAt: new Date().toISOString(),
    etfCount: allEtfs.length,
    priceFileCount: priceFilesWritten,
    tickers: allEtfs.map((e) => e.ticker),
  };
  writeFileSync(
    path.join(outDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  console.log(`  ✓ data/manifest.json`);

  console.log("\nDone. Commit the data/ directory to ship these to production.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
