/**
 * For each ETF in the database:
 *   1. Ensure 5Y of native prices are cached
 *   2. Compute 1Y / 3Y / 5Y returns + 5Y max drawdown (all in SGD)
 *   3. Generate a ~30-point sparkline series for the last 1Y
 *   4. Store everything on the `etfs` row
 *
 * Run with: `npm run db:refresh-stats`
 * Idempotent. Use `--ticker CSPX.L` to refresh a single ETF.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

async function main() {
  if (!process.env.POSTGRES_URL) {
    console.error("✗ POSTGRES_URL is not set.");
    process.exit(1);
  }

  const { db } = await import("../lib/db/client");
  const { etfs } = await import("../lib/db/schema");
  const { getPriceSeries } = await import("../lib/marketData/prices");
  const { eq, sql } = await import("drizzle-orm");

  const tickerFilter = process.argv.includes("--ticker")
    ? process.argv[process.argv.indexOf("--ticker") + 1]
    : null;

  const allEtfs = await db.select({ id: etfs.id, ticker: etfs.ticker }).from(etfs);
  const targets = tickerFilter
    ? allEtfs.filter((e) => e.ticker === tickerFilter)
    : allEtfs;

  if (targets.length === 0) {
    console.error(`No ETF found${tickerFilter ? ` for ${tickerFilter}` : ""}.`);
    process.exit(1);
  }

  console.log(`Refreshing stats for ${targets.length} ETFs…`);

  // Run in small batches to avoid hammering Yahoo
  const BATCH_SIZE = 5;
  let done = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (etf) => {
        try {
          // Fetch 5Y series — this also caches everything we need for 1Y/3Y views
          const series5Y = await getPriceSeries(etf.ticker, "5Y");
          if (!series5Y || series5Y.pointsSgd.length < 2) {
            console.log(`  ⚠ ${etf.ticker} — no data`);
            failed++;
            return;
          }

          const points = series5Y.pointsSgd;
          const lastIdx = points.length - 1;
          const lastDate = new Date(points[lastIdx].date);
          const last = points[lastIdx].sgd;

          // 1Y total return (not annualized; 1Y IS the natural unit)
          const oneYearAgo = new Date(lastDate.getTime() - 365 * 86400_000);
          const start1Y = points.find((p) => new Date(p.date) >= oneYearAgo);
          const return1Y = start1Y ? last / start1Y.sgd - 1 : null;

          // 3Y annualized
          const threeYearsAgo = new Date(lastDate.getTime() - 365 * 3 * 86400_000);
          const start3Y = points.find((p) => new Date(p.date) >= threeYearsAgo);
          let return3YAnnualized: number | null = null;
          if (start3Y) {
            const years =
              (lastDate.getTime() - new Date(start3Y.date).getTime()) /
              (365.25 * 86400_000);
            if (years >= 2) {
              return3YAnnualized =
                Math.pow(last / start3Y.sgd, 1 / years) - 1;
            }
          }

          // 5Y annualized
          let return5YAnnualized: number | null = null;
          const first = points[0];
          const yearsSpanned =
            (lastDate.getTime() - new Date(first.date).getTime()) /
            (365.25 * 86400_000);
          if (yearsSpanned >= 4) {
            return5YAnnualized = Math.pow(last / first.sgd, 1 / yearsSpanned) - 1;
          }

          // Max drawdown over the whole 5Y window
          let peak = points[0].sgd;
          let maxDD = 0;
          for (const p of points) {
            if (p.sgd > peak) peak = p.sgd;
            const dd = p.sgd / peak - 1;
            if (dd < maxDD) maxDD = dd;
          }

          // Sparkline: sample ~30 points from the last 1Y of data
          const points1Y = start1Y
            ? points.slice(points.indexOf(start1Y))
            : points;
          const SAMPLES = 30;
          const step = Math.max(1, Math.floor(points1Y.length / SAMPLES));
          const sparkline: number[] = [];
          for (let k = 0; k < points1Y.length; k += step) {
            sparkline.push(points1Y[k].sgd);
          }
          // Ensure last point is included
          if (sparkline[sparkline.length - 1] !== points1Y[points1Y.length - 1].sgd) {
            sparkline.push(points1Y[points1Y.length - 1].sgd);
          }
          // Normalize to 100 at start
          const sparkBase = sparkline[0];
          const sparkNormalized = sparkline.map((v) => (v / sparkBase) * 100);

          await db
            .update(etfs)
            .set({
              return1Y: return1Y?.toFixed(4) ?? null,
              return3YAnnualized: return3YAnnualized?.toFixed(4) ?? null,
              return5YAnnualized: return5YAnnualized?.toFixed(4) ?? null,
              maxDrawdown5Y: maxDD.toFixed(4),
              sparkline1Y: JSON.stringify(sparkNormalized),
              statsUpdatedAt: sql`NOW()`,
            })
            .where(eq(etfs.id, etf.id));

          done++;
          const r1y = return1Y != null ? `${(return1Y * 100).toFixed(1)}%` : "—";
          console.log(`  ✓ ${etf.ticker.padEnd(8)} 1Y=${r1y.padStart(7)}`);
        } catch (err) {
          failed++;
          console.error(`  ✗ ${etf.ticker} — ${(err as Error).message}`);
        }
      }),
    );
  }

  console.log(`\nDone. Updated ${done}, failed ${failed}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Refresh failed:", err);
  process.exit(1);
});
