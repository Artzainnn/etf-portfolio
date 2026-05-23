/**
 * Server-side data access for ETFs. Used by Server Components and Route Handlers.
 */
import "server-only";
import { db } from "@/lib/db/client";
import { etfs } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import type { Etf } from "@/lib/db/schema";

export async function listEtfs(): Promise<Etf[]> {
  return db.select().from(etfs).orderBy(asc(etfs.category), asc(etfs.ticker));
}

export async function getEtfByTicker(ticker: string): Promise<Etf | null> {
  const rows = await db.select().from(etfs).where(eq(etfs.ticker, ticker)).limit(1);
  return rows[0] ?? null;
}

/** Categories in display order, with human-readable labels. */
export const CATEGORY_LABELS: Record<string, string> = {
  broad_market: "Broad Market",
  region: "Regions",
  sector: "Sectors",
  thematic: "Thematic",
  bond: "Bonds",
  commodity: "Commodities",
};

export const CATEGORY_ORDER = [
  "broad_market",
  "region",
  "sector",
  "thematic",
  "bond",
  "commodity",
];

/** Human-readable label for a risk score 1–5. */
export function riskLabel(score: number | null): string {
  if (score == null) return "Unknown";
  return ["", "Very Low", "Low", "Medium", "High", "Very High"][score] ?? "Unknown";
}

/** Format a TER (stored as decimal 0.0007) as a percentage string ("0.07%"). */
export function formatTer(ter: string | null): string {
  if (ter == null) return "—";
  const pct = parseFloat(ter) * 100;
  return `${pct.toFixed(2)}%`;
}
