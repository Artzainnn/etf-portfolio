/**
 * ETF data access. Reads from a static JSON snapshot bundled with the build
 * (data/etfs.json). To refresh the snapshot:
 *
 *   npm run db:refresh-stats      # pull latest from Yahoo into local Postgres
 *   npm run db:export-static      # dump local Postgres → data/etfs.json
 *   git add data/ public/data/ && git commit && git push  # ships to Vercel
 *
 * The deployed app never touches the database.
 */
import etfsData from "@/data/etfs.json";
import type { Etf } from "@/lib/db/schema";

// JSON has dates as strings, decimals as strings — same shape the rest of the
// app expects from the Drizzle row type, so this cast is safe.
const ETFS = etfsData as unknown as Etf[];

const CATEGORY_DISPLAY_ORDER = [
  "broad_market",
  "region",
  "sector",
  "thematic",
  "bond",
  "commodity",
];

function categoryRank(cat: string | null): number {
  if (cat == null) return 99;
  const i = CATEGORY_DISPLAY_ORDER.indexOf(cat);
  return i === -1 ? 99 : i;
}

const ORDERED_ETFS = [...ETFS].sort((a, b) => {
  const rA = categoryRank(a.category);
  const rB = categoryRank(b.category);
  if (rA !== rB) return rA - rB;
  return (a.ticker ?? "").localeCompare(b.ticker ?? "");
});

const BY_TICKER: Map<string, Etf> = new Map(
  ORDERED_ETFS.map((e) => [e.ticker, e]),
);

export async function listEtfs(): Promise<Etf[]> {
  return ORDERED_ETFS;
}

export async function getEtfByTicker(ticker: string): Promise<Etf | null> {
  return BY_TICKER.get(ticker) ?? null;
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

export const CATEGORY_ORDER = CATEGORY_DISPLAY_ORDER;

export function riskLabel(score: number | null): string {
  if (score == null) return "Unknown";
  return ["", "Very Low", "Low", "Medium", "High", "Very High"][score] ?? "Unknown";
}

export function formatTer(ter: string | null): string {
  if (ter == null) return "—";
  const pct = parseFloat(ter) * 100;
  return `${pct.toFixed(2)}%`;
}
