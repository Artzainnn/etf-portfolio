/**
 * Seed the `etfs` table with the curated list of 37 ETFs.
 *
 * Idempotent: re-running updates existing rows by ticker.
 * Run with: `npm run db:seed`
 */

import { config as loadEnv } from "dotenv";

// Load env BEFORE importing anything that touches POSTGRES_URL.
loadEnv({ path: ".env.local" });
loadEnv();

async function main() {
  if (!process.env.POSTGRES_URL) {
    console.error("✗ POSTGRES_URL is not set. Add it to .env.local first.");
    process.exit(1);
  }

  // Dynamic imports: avoid evaluating the db client at module-load time,
  // which would try to connect using the fallback URL before dotenv has run.
  const { db } = await import("../lib/db/client");
  const { etfs } = await import("../lib/db/schema");
  const { seedEtfs } = await import("./etf-data");
  const { sql } = await import("drizzle-orm");

  console.log(`Seeding ${seedEtfs.length} ETFs into the database…`);

  let inserted = 0;
  let updated = 0;

  for (const etf of seedEtfs) {
    const result = await db
      .insert(etfs)
      .values(etf)
      .onConflictDoUpdate({
        target: etfs.ticker,
        set: {
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
          currency: etf.currency ?? null,
          riskScore: etf.riskScore ?? null,
          inceptionDate: etf.inceptionDate ?? null,
          ibkrAvailable: etf.ibkrAvailable ?? true,
          ibkrSymbol: etf.ibkrSymbol ?? null,
          factSheetUrl: etf.factSheetUrl ?? null,
          issuer: etf.issuer ?? null,
          benchmark: etf.benchmark ?? null,
          tags: etf.tags ?? null,
          updatedAt: sql`NOW()`,
        },
      })
      .returning({
        ticker: etfs.ticker,
        createdAt: etfs.createdAt,
        updatedAt: etfs.updatedAt,
      });

    if (result.length > 0) {
      const row = result[0];
      const isNew =
        Math.abs(
          new Date(row.createdAt).getTime() - new Date(row.updatedAt).getTime(),
        ) < 1000;
      if (isNew) {
        inserted++;
        console.log(`  + ${row.ticker}`);
      } else {
        updated++;
        console.log(`  ~ ${row.ticker} (updated)`);
      }
    }
  }

  console.log(`\nDone. Inserted ${inserted}, updated ${updated}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
