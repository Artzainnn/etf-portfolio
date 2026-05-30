/**
 * Short-list of common benchmarks for "Compare with" dropdowns.
 * Default benchmark is the S&P 500 (CSPX.L).
 */

export interface Benchmark {
  ticker: string;
  label: string;
}

export const COMPARE_BENCHMARKS: Benchmark[] = [
  { ticker: "CSPX.L", label: "🇺🇸 S&P 500" },
  { ticker: "IWDA.L", label: "🌍 Developed world" },
  { ticker: "VWCE.DE", label: "🌐 All-world" },
  { ticker: "EIMI.L", label: "📈 Emerging markets" },
  { ticker: "IMEU.L", label: "🇪🇺 Europe" },
  { ticker: "SJPA.L", label: "🇯🇵 Japan" },
  { ticker: "CPXJ.L", label: "🌏 Asia-Pacific" },
  { ticker: "CNDX.L", label: "💻 Nasdaq 100" },
  { ticker: "AGGG.L", label: "🛡️ Global bonds" },
  { ticker: "SGLN.L", label: "🥇 Gold" },
];

export const DEFAULT_COMPARE_TICKER = "CSPX.L";
