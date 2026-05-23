"use client";

import { useState } from "react";
import { PriceChart, type Period, type PriceStats } from "./price-chart";
import { PeriodStats } from "./period-stats";

const PERIODS: Period[] = ["1M", "3M", "6M", "1Y", "3Y", "5Y", "Max"];

export function EtfDetailChart({
  ticker,
  name: _name,
}: {
  ticker: string;
  name: string;
}) {
  const [period, setPeriod] = useState<Period>("1Y");
  const [stats, setStats] = useState<PriceStats | null>(null);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_140px]">
        <PriceChart
          ticker={ticker}
          period={period}
          variant="tall"
          onStats={setStats}
        />

        <div className="space-y-4">
          <div>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Time period
            </div>
            <div className="flex flex-wrap gap-1 lg:flex-col">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors lg:text-left ${
                    period === p
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance for the currently selected period */}
      <div className="mt-6">
        <PeriodStats period={period} stats={stats} size="tall" />
      </div>

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        Returns shown in SGD (your base currency). Past performance is not a
        reliable guide to future results.
      </p>
    </div>
  );
}
