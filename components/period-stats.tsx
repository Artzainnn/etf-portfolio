"use client";

import { formatPct, periodLabel, type Period, type PriceStats } from "./price-chart";

/**
 * Reusable performance tiles that always reflect the currently-selected
 * time period. Adapts the number of tiles based on whether the period
 * is long enough to show an annualized rate.
 */
export function PeriodStats({
  period,
  stats,
  size = "compact",
}: {
  period: Period;
  stats: PriceStats | null;
  size?: "compact" | "tall";
}) {
  const showAnnualized = (stats?.periodYears ?? 0) >= 1.5;

  const tiles = [
    {
      label: `Change ${periodLabel(period)}`,
      value: formatPct(stats?.totalReturn ?? null),
      hint: "Total percent change between the first and last day of this period.",
    },
    ...(showAnnualized
      ? [
          {
            label: "Per year (average)",
            value: formatPct(stats?.annualizedReturn ?? null),
            hint: "Compounded annual growth rate over this period.",
          },
        ]
      : []),
    {
      label: "Worst drop in this period",
      value: formatPct(stats?.maxDrawdown ?? null),
      hint: "Biggest peak-to-trough decline within the displayed window.",
      forceNegative: true,
    },
  ];

  const cols = tiles.length === 2 ? "grid-cols-2" : "grid-cols-3";
  const tilePadding = size === "tall" ? "px-3 py-2.5" : "px-2 py-2";
  const labelSize = size === "tall" ? "text-[11px]" : "text-[10px]";
  const valueSize = size === "tall" ? "text-lg" : "text-sm";

  return (
    <div className={`grid gap-2 sm:gap-3 ${cols}`}>
      {tiles.map((t) => {
        const isPositive = t.value.startsWith("+");
        const isNegative = t.value.startsWith("-");
        const valCls = t.forceNegative
          ? "text-rose-600 dark:text-rose-400"
          : isPositive
            ? "text-emerald-600 dark:text-emerald-400"
            : isNegative
              ? "text-rose-600 dark:text-rose-400"
              : "text-zinc-900 dark:text-zinc-100";

        return (
          <div
            key={t.label}
            className={`rounded-md border border-zinc-200 bg-white ${tilePadding} dark:border-zinc-800 dark:bg-zinc-900`}
            title={t.hint}
          >
            <div
              className={`uppercase tracking-wide text-zinc-500 dark:text-zinc-400 ${labelSize}`}
            >
              {t.label}
            </div>
            <div
              className={`mt-0.5 font-semibold tabular-nums ${valueSize} ${valCls}`}
            >
              {t.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
