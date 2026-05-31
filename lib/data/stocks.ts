import stocksData from "@/data/stocks.json";
import { fetchRemoteJsonOrFallback } from "@/lib/data/remote";

export type PeriodKey = "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y" | "Max";

export interface Stock {
  ticker: string;
  name: string;
  friendlyName: string;
  shortDescription: string;
  industries: string[];
  country: string;
  emoji?: string;
  nativeCurrency: string;
  periodReturns: Partial<Record<PeriodKey, number>>;
  periodSparklines: Partial<Record<PeriodKey, number[]>>;
}

const BUNDLED_STOCKS = stocksData as unknown as Stock[];

/**
 * Server-side stock list — fetches fresh from GitHub `main` so daily
 * data refreshes appear without a redeploy. Falls back to the bundled
 * snapshot on any error.
 */
export async function listStocks(): Promise<Stock[]> {
  return fetchRemoteJsonOrFallback<Stock[]>("data/stocks.json", BUNDLED_STOCKS);
}

/**
 * Synchronous accessor — uses the bundled snapshot only. Used by client
 * components (portfolio editor, compare view) where a sync API is needed
 * and a slightly stale list is acceptable. Mirrors ALL_ETFS_SYNC.
 */
export const ALL_STOCKS_SYNC: Stock[] = BUNDLED_STOCKS;

/** Number of years each cumulative period spans, for annualising. */
const PERIOD_YEARS: Partial<Record<PeriodKey, number>> = {
  "5Y": 5,
  "3Y": 3,
  "1Y": 1,
};

/**
 * Best estimate of a stock's expected *annual* return.
 *
 * `periodReturns` holds **cumulative** total returns (e.g. "5Y" = +250%
 * over five years), so a multi-year figure must be annualised before it
 * can be used as a yearly rate:  annual = (1 + cumulative)^(1/years) − 1.
 *
 * Prefers the longest available window (5Y → 3Y → 1Y) for stability,
 * mirroring how ETFs prefer return5YAnnualized. Returns null if none exist.
 */
export function annualizedStockReturn(
  periodReturns: Partial<Record<PeriodKey, number>>,
): number | null {
  for (const period of ["5Y", "3Y", "1Y"] as const) {
    const cumulative = periodReturns[period];
    const years = PERIOD_YEARS[period];
    if (cumulative == null || years == null) continue;
    if (!isFinite(cumulative) || 1 + cumulative <= 0) continue;
    return Math.pow(1 + cumulative, 1 / years) - 1;
  }
  return null;
}

// Country code → flag emoji
export const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  CN: "🇨🇳",
  JP: "🇯🇵",
  DE: "🇩🇪",
  FR: "🇫🇷",
  GB: "🇬🇧",
  CH: "🇨🇭",
  NL: "🇳🇱",
  DK: "🇩🇰",
  IT: "🇮🇹",
  AR: "🇦🇷",
  TW: "🇹🇼",
  SG: "🇸🇬",
};

export function flagFor(country: string): string {
  return COUNTRY_FLAGS[country] ?? "🌐";
}
