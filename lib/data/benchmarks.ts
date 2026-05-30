/**
 * Short-list of common benchmarks for "Compare with" dropdowns.
 * `emoji` and `label` are stored separately so the chart legend can
 * render the logo + plain text without trying to parse the emoji out
 * of a combined string.
 */

export interface Benchmark {
  ticker: string;
  emoji: string;
  label: string;
}

export const COMPARE_BENCHMARKS: Benchmark[] = [
  { ticker: "CSPX.L", emoji: "🇺🇸", label: "S&P 500" },
  { ticker: "IWDA.L", emoji: "🌍", label: "Developed world" },
  { ticker: "VWCE.DE", emoji: "🌐", label: "All-world" },
  { ticker: "EIMI.L", emoji: "📈", label: "Emerging markets" },
  { ticker: "IMEU.L", emoji: "🇪🇺", label: "Europe" },
  { ticker: "SJPA.L", emoji: "🇯🇵", label: "Japan" },
  { ticker: "CPXJ.L", emoji: "🌏", label: "Asia-Pacific" },
  { ticker: "CNDX.L", emoji: "💻", label: "Nasdaq 100" },
  { ticker: "AGGG.L", emoji: "🛡️", label: "Global bonds" },
  { ticker: "SGLN.L", emoji: "🥇", label: "Gold" },
];

export const DEFAULT_COMPARE_TICKER = "CSPX.L";

/** Lookup: ticker → emoji + label, with sensible fallback. */
export function getBenchmark(ticker: string): Benchmark | null {
  return COMPARE_BENCHMARKS.find((b) => b.ticker === ticker) ?? null;
}
