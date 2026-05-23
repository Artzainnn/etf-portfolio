"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getPriceSeries,
  type Period as ClientPeriod,
  type PriceStats as ClientPriceStats,
} from "@/lib/marketData/clientPrices";

export type Period = ClientPeriod;
export type PriceStats = ClientPriceStats;

export interface PricesResponse {
  ticker: string;
  period: Period;
  nativeCurrency: string;
  baseCurrency: string;
  points: { date: string; value: number }[];
  stats: PriceStats;
}

interface Props {
  ticker: string;
  period: Period;
  /** Compact mode is used in expanded list rows; tall mode on the detail page. */
  variant?: "compact" | "tall";
  /** Notify parent when stats land (so it can render return tiles). */
  onStats?: (stats: PriceStats | null) => void;
}

export function PriceChart({ ticker, period, variant = "compact", onStats }: Props) {
  const [data, setData] = useState<PricesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPriceSeries(ticker, period)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setError("No data");
          setLoading(false);
          onStats?.(null);
          return;
        }
        setData({
          ticker: result.ticker,
          period,
          nativeCurrency: result.nativeCurrency,
          baseCurrency: result.baseCurrency,
          points: result.points,
          stats: result.stats,
        });
        setLoading(false);
        onStats?.(result.stats);
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
  }, [ticker, period, onStats]);

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

  const first = data.points[0].value;
  const last = data.points[data.points.length - 1].value;
  const totalChangePct = (last / first - 1) * 100;
  const isPositive = totalChangePct >= 0;

  // Pick a reasonable number of X-axis ticks
  const tickCount = variant === "tall" ? 6 : 4;
  const tickIndices = Array.from({ length: tickCount }, (_, i) =>
    Math.floor((i * (data.points.length - 1)) / (tickCount - 1)),
  );
  const tickDates = new Set(tickIndices.map((i) => data.points[i].date));

  // y-axis padding
  const values = data.points.map((p) => p.value);
  const yMin = Math.min(...values);
  const yMax = Math.max(...values);
  const yPad = (yMax - yMin) * 0.1;

  const strokeColor = isPositive ? "#059669" : "#dc2626";

  return (
    <div className={`${heightCls} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data.points}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={`grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
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
              const p = payload[0].payload as { date: string; value: number };
              const change = p.value - 100;
              return (
                <div className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {p.date}
                  </div>
                  <div
                    className={`font-medium tabular-nums ${
                      change >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(2)}%
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.75}
            fill={`url(#grad-${ticker})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
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

export function formatPct(pct: number | null, opts: { decimals?: number } = {}): string {
  if (pct == null) return "—";
  const decimals = opts.decimals ?? 1;
  const v = pct * 100;
  return `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}%`;
}
