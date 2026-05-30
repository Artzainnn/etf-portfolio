"use client";

import { COMPARE_BENCHMARKS } from "@/lib/data/benchmarks";
import { ALL_ETFS_SYNC } from "@/lib/data/etfs";
import { getEtfEmoji } from "@/lib/data/emoji";

/**
 * Dropdown for picking a benchmark to overlay on a chart.
 * Curated benchmarks pinned at top, the rest of the fund universe below.
 */
export function CompareSelect({
  value,
  onChange,
  excludeTicker,
  className = "",
}: {
  value: string;
  onChange: (ticker: string) => void;
  excludeTicker?: string;
  className?: string;
}) {
  const benchmarkTickers = new Set(COMPARE_BENCHMARKS.map((b) => b.ticker));
  const otherEtfs = ALL_ETFS_SYNC.filter(
    (e) => e.ticker !== excludeTicker && !benchmarkTickers.has(e.ticker),
  );

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`appearance-none rounded-md border border-zinc-300 bg-white py-1 pl-2 pr-6 text-xs font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:ring-zinc-700 ${className}`}
      aria-label="Compare with benchmark"
    >
      <option value="">— Off</option>
      <optgroup label="Common benchmarks">
        {COMPARE_BENCHMARKS.filter((b) => b.ticker !== excludeTicker).map(
          (b) => (
            <option key={b.ticker} value={b.ticker}>
              {b.emoji} {b.label}
            </option>
          ),
        )}
      </optgroup>
      {otherEtfs.length > 0 && (
        <optgroup label="All other funds">
          {otherEtfs.map((e) => (
            <option key={e.ticker} value={e.ticker}>
              {getEtfEmoji(e.ticker)} {e.friendlyName ?? e.name}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
