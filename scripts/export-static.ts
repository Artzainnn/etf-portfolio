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
  writeFileSync(
    path.join(outDir, "etfs.json"),
    JSON.stringify(allEtfs, null, 2),
  );
  console.log(`  ✓ data/etfs.json (${allEtfs.length} records)`);

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
