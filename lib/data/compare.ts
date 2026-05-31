/**
 * Unified option list + label resolver for the "Compare with" selectors.
 *
 * Anything with a price series can be overlaid on a chart, so the compare
 * universe spans curated benchmarks, every ETF, and every stock. Each is
 * reduced to { ticker, emoji, label } for a searchable dropdown, with the
 * benchmark version winning when a ticker is both (e.g. CSPX.L).
 */

import { COMPARE_BENCHMARKS } from "./benchmarks";
import { ALL_ETFS_SYNC } from "./etfs";
import { ALL_STOCKS_SYNC, flagFor } from "./stocks";
import { getEtfEmoji } from "./emoji";

export type CompareGroup = "Benchmarks" | "Funds" | "Stocks";

export interface CompareOption {
  ticker: string;
  emoji: string;
  label: string;
  group: CompareGroup;
  /** lowercased "label ticker" for cheap searching */
  haystack: string;
}

const benchmarkTickers = new Set(COMPARE_BENCHMARKS.map((b) => b.ticker));

function opt(
  ticker: string,
  emoji: string,
  label: string,
  group: CompareGroup,
): CompareOption {
  return {
    ticker,
    emoji,
    label,
    group,
    haystack: `${label} ${ticker}`.toLowerCase(),
  };
}

export const COMPARE_OPTIONS: CompareOption[] = [
  ...COMPARE_BENCHMARKS.map((b) => opt(b.ticker, b.emoji, b.label, "Benchmarks")),
  ...ALL_ETFS_SYNC.filter((e) => !benchmarkTickers.has(e.ticker)).map((e) =>
    opt(e.ticker, getEtfEmoji(e.ticker), e.friendlyName ?? e.name, "Funds"),
  ),
  ...ALL_STOCKS_SYNC.map((s) =>
    opt(s.ticker, s.emoji ?? flagFor(s.country), s.friendlyName, "Stocks"),
  ),
];

const byTicker = new Map(COMPARE_OPTIONS.map((o) => [o.ticker, o]));

/** Resolve a ticker to its display meta (emoji + label) across all groups. */
export function getCompareMeta(ticker: string): CompareOption | null {
  return byTicker.get(ticker) ?? null;
}

/** Plain label for a compare ticker, falling back to the ticker itself. */
export function getCompareLabel(ticker: string): string {
  return byTicker.get(ticker)?.label ?? ticker;
}
