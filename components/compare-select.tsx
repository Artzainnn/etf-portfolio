"use client";

import { COMPARE_BENCHMARKS } from "@/lib/data/benchmarks";

/**
 * Compact dropdown for picking a benchmark to overlay on a chart.
 * The "Off" option (empty string) disables comparison.
 */
export function CompareSelect({
  value,
  onChange,
  excludeTicker,
  className = "",
}: {
  value: string;
  onChange: (ticker: string) => void;
  /** Hide this ticker from the dropdown (e.g. don't compare a fund to itself). */
  excludeTicker?: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`appearance-none rounded-md border border-zinc-300 bg-white py-1 pl-2 pr-6 text-xs font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:ring-zinc-700 ${className}`}
      aria-label="Compare with benchmark"
    >
      <option value="">— Off</option>
      {COMPARE_BENCHMARKS.filter((b) => b.ticker !== excludeTicker).map((b) => (
        <option key={b.ticker} value={b.ticker}>
          {b.label}
        </option>
      ))}
    </select>
  );
}
