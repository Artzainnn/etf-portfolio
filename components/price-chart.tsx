"use client";

import { useEffect, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getSeriesWithCompare,
  type Period as ClientPeriod,
  type PriceStats as ClientPriceStats,
} from "@/lib/marketData/clientPrices";
import { getBenchmark } from "@/lib/data/benchmarks";
import { StockLogo } from "./stock-logo";

export type Period = ClientPeriod;
export type PriceStats = ClientPriceStats;

interface Props {
  ticker: string;
  period: Period;
  /** Compact mode is used in expanded list rows; tall mode on the detail page. */
  variant?: "compact" | "tall";
  /** Optional comparison benchmark ticker (empty string = no comparison). */
  compareTicker?: string;
  /** Display name for the main fund (shown in the "X vs Y" legend). */
  mainName?: string;
  /** Fallback emoji for the main fund's logo (if logo fetch fails). */
  mainEmoji?: string;
  /** Notify parent when stats land. */
  onStats?: (stats: PriceStats | null) => void;
}

export function PriceChart({
  ticker,
  period,
  variant = "compact",
  compareTicker = "",
  mainName,
  mainEmoji,
  onStats,
}: Props) {
  const [data, setData] = useState<{
    points: { date: string; main: number; compare?: number }[];
    stats: PriceStats;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getSeriesWithCompare(ticker, compareTicker || null, period)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setError("No data");
          setLoading(false);
          onStats?.(null);
          return;
        }
        setData({
          points: result.combined,
          stats: result.main.stats,
        });
        setLoading(false);
        onStats?.(result.main.stats);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setLoading(false);
        onStats?.(null);
      });

    return () => {
      cancelled = true;
    };
  }, [ticker, period, compareTicker, onStats]);

  const heightCls = variant === "tall" ? "aspect-[16/9]" : "aspect-[16/9]";

  if (loading) {
    return (
      <div
        className={`flex ${heightCls} animate-pulse items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900`}
      >
        Loading chart…
      </div>
    );
  }

  if (error || !data || data.points.length < 2) {
    return (
      <div
        className={`flex ${heightCls} items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400`}
      >
        <div>
          <div>No chart data for this period.</div>
          {error && <div className="mt-1 text-[10px] opacity-60">{error}</div>}
        </div>
      </div>
    );
  }

  const first = data.points[0].main;
  const last = data.points[data.points.length - 1].main;
  const isPositive = last >= first;

  // Pick reasonable X-axis ticks
  const tickCount = variant === "tall" ? 6 : 4;
  const tickIndices = Array.from({ length: tickCount }, (_, i) =>
    Math.floor((i * (data.points.length - 1)) / (tickCount - 1)),
  );
  const tickDates = new Set(tickIndices.map((i) => data.points[i].date));

  // y-axis padding — include both series in the range
  const allValues: number[] = [];
  for (const p of data.points) {
    allValues.push(p.main);
    if (p.compare != null) allValues.push(p.compare);
  }
  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);
  const yPad = (yMax - yMin) * 0.1;

  const mainColor = isPositive ? "#10b981" : "#f43f5e";
  const compareColor = "#a1a1aa";
  const gradientId = `grad-${ticker}-${period}`;

  const compareBenchmark = compareTicker ? getBenchmark(compareTicker) : null;

  return (
    <div className={`${heightCls} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data.points}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={mainColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={mainColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-zinc-200 dark:text-zinc-800"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatXLabel(d, period)}
            ticks={Array.from(tickDates)}
            interval={0}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "currentColor" }}
            className="text-zinc-500"
          />
          <YAxis
            domain={[yMin - yPad, yMax + yPad]}
            tickFormatter={(v) => `${(v - 100).toFixed(0)}%`}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "currentColor" }}
            className="text-zinc-500"
            width={40}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              const p = payload[0].payload as {
                date: string;
                main: number;
                compare?: number;
              };
              const mainChange = p.main - 100;
              const compareChange =
                p.compare != null ? p.compare - 100 : null;
              return (
                <div className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {p.date}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="inline-block h-1.5 w-3 rounded-sm"
                      style={{ backgroundColor: mainColor }}
                    />
                    <span
                      className={`font-medium tabular-nums ${
                        mainChange >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {mainChange >= 0 ? "+" : ""}
                      {mainChange.toFixed(2)}%
                    </span>
                  </div>
                  {compareChange != null && (
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className="inline-block h-1.5 w-3 rounded-sm"
                        style={{ backgroundColor: compareColor }}
                      />
                      <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
                        {compareChange >= 0 ? "+" : ""}
                        {compareChange.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="main"
            stroke={mainColor}
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
          {compareTicker && (
            <Line
              type="monotone"
              dataKey="compare"
              stroke={compareColor}
              strokeWidth={1.25}
              strokeDasharray="4 3"
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      {compareTicker && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
          <StockLogo
            ticker={ticker}
            fallbackEmoji={mainEmoji ?? "📊"}
            size={16}
          />
          {mainName && (
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {mainName}
            </span>
          )}
          <span className="text-zinc-400 dark:text-zinc-500">vs</span>
          <StockLogo
            ticker={compareTicker}
            fallbackEmoji={compareBenchmark?.emoji ?? "📊"}
            size={16}
          />
          <span className="truncate">
            {compareBenchmark?.label ?? compareTicker}
          </span>
        </div>
      )}
    </div>
  );
}

function formatXLabel(dateStr: string, period: Period): string {
  const d = new Date(dateStr);
  if (period === "1M" || period === "3M" || period === "6M") {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  if (period === "1Y") {
    return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
  }
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

/** Friendly label for the period (used in tile headings). */
export function periodLabel(period: Period): string {
  switch (period) {
    case "1M":
      return "over 1 month";
    case "3M":
      return "over 3 months";
    case "6M":
      return "over 6 months";
    case "1Y":
      return "over 1 year";
    case "3Y":
      return "over 3 years";
    case "5Y":
      return "over 5 years";
    case "Max":
      return "all-time";
  }
}

export function formatPct(
  pct: number | null,
  opts: { decimals?: number } = {},
): string {
  if (pct == null) return "—";
  const decimals = opts.decimals ?? 1;
  const v = pct * 100;
  return `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}%`;
}
