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
import { EDITORIAL } from "@/lib/data/editorial";
import { fetchRemoteJsonOrFallback } from "@/lib/data/remote";

export type PeriodKey = "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y" | "Max";

/** ETF row with the multi-period stats injected at export time. */
export type EtfWithPeriodData = Etf & {
  periodReturns: Partial<Record<PeriodKey, number>>;
  periodSparklines: Partial<Record<PeriodKey, number[]>>;
};

const BUNDLED_ETFS = etfsData as unknown as EtfWithPeriodData[];

function applyEditorial(
  list: EtfWithPeriodData[],
): EtfWithPeriodData[] {
  return list.map((etf) => {
    const editorial = EDITORIAL[etf.ticker];
    if (!editorial) return etf;
    return {
      ...etf,
      shortDescription: editorial.shortDescription,
      pros: editorial.pros,
      cons: editorial.cons,
    };
  });
}

async function loadEtfs(): Promise<EtfWithPeriodData[]> {
  const raw = await fetchRemoteJsonOrFallback<EtfWithPeriodData[]>(
    "data/etfs.json",
    BUNDLED_ETFS,
  );
  return applyEditorial(raw);
}

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

function order(list: EtfWithPeriodData[]): EtfWithPeriodData[] {
  return [...list].sort((a, b) => {
    const rA = categoryRank(a.category);
    const rB = categoryRank(b.category);
    if (rA !== rB) return rA - rB;
    return (a.ticker ?? "").localeCompare(b.ticker ?? "");
  });
}

export async function listEtfs(): Promise<EtfWithPeriodData[]> {
  return order(await loadEtfs());
}

/**
 * Synchronous accessor — uses the bundled snapshot only. Used by client
 * components (CompareSelect dropdown) where a sync API is needed and a
 * slightly stale list is fine. Server-rendered pages call `listEtfs()`
 * which gets the fresh remote data.
 */
export const ALL_ETFS_SYNC: EtfWithPeriodData[] = order(
  applyEditorial(BUNDLED_ETFS),
);

export async function getEtfByTicker(
  ticker: string,
): Promise<EtfWithPeriodData | null> {
  const list = await loadEtfs();
  return list.find((e) => e.ticker === ticker) ?? null;
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
