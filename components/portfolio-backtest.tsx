"use client";

import { useEffect, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Info } from "lucide-react";
import { getRawSeries, type Period } from "@/lib/marketData/clientPrices";
import { CompareSelect } from "./compare-select";
import { DEFAULT_COMPARE_TICKER } from "@/lib/data/benchmarks";
import { getCompareLabel } from "@/lib/data/compare";

interface Allocation {
  ticker: string;
  friendlyName: string;
  percentage: number;
}

interface SeriesPoint {
  date: string;
  sgd: number;
}

interface ChartPoint {
  date: string;
  portfolio: number;
  compare?: number;
}

const PERIODS: Period[] = ["1M", "3M", "6M", "1Y", "3Y", "5Y", "Max"];
const PERIOD_LABELS: Record<Period, string> = {
  "1M": "1 month",
  "3M": "3 months",
  "6M": "6 months",
  "1Y": "1 year",
  "3Y": "3 years",
  "5Y": "5 years",
  Max: "all-time",
};
const PERIOD_DAYS: Record<Period, number | null> = {
  "1M": 31,
  "3M": 92,
  "6M": 183,
  "1Y": 366,
  "3Y": 366 * 3,
  "5Y": 366 * 5,
  Max: null,
};

/**
 * Look up the most recent price at or before `targetDate` in a sorted
 * series. Returns null if no such price exists.
 */
function priceAtOrBefore(
  series: SeriesPoint[],
  targetDate: string,
): number | null {
  // Linear scan with early-exit — series is sorted ascending by date.
  let last: number | null = null;
  for (const p of series) {
    if (p.date > targetDate) break;
    last = p.sgd;
  }
  return last;
}

interface JoinEvent {
  date: string;
  ticker: string;
  friendlyName: string;
  percentage: number;
}

interface BacktestResult {
  points: ChartPoint[];
  /** ISO date string from which the chart actually starts. */
  effectiveStart: string;
  /** Each time a fund's data first appears within the chart range (after start). */
  joinEvents: JoinEvent[];
  /** Total return over the chart range, portfolio. */
  portfolioReturn: number;
  /** Total return over the chart range, compare benchmark (null if no compare). */
  compareReturn: number | null;
}

export function PortfolioBacktest({
  allocations,
}: {
  allocations: Allocation[];
}) {
  const [period, setPeriod] = useState<Period>("1Y");
  const [compare, setCompare] = useState<string>(DEFAULT_COMPARE_TICKER);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only allocations with > 0% matter for the backtest
  const activeAllocations = allocations.filter((a) => a.percentage > 0);
  const totalWeight = activeAllocations.reduce(
    (s, a) => s + a.percentage,
    0,
  );

  useEffect(() => {
    if (activeAllocations.length === 0) {
      setResult(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const tickers = activeAllocations.map((a) => a.ticker);
        const seriesEntries = await Promise.all(
          tickers.map(async (t) => {
            const s = await getRawSeries(t);
            return [t, s?.points ?? null] as [string, SeriesPoint[] | null];
          }),
        );

        if (cancelled) return;

        const seriesMap = new Map<string, SeriesPoint[]>();
        for (const [t, points] of seriesEntries) {
          if (points && points.length >= 2) seriesMap.set(t, points);
        }
        if (seriesMap.size === 0) {
          setError("No price data available for these funds.");
          setResult(null);
          setLoading(false);
          return;
        }

        // For maximum coverage, use the EARLIEST first-date across all funds.
        // The chart will extend back to that point even for funds that haven't
        // launched yet — their target weight is reallocated pro-rata across
        // the funds that do have data on each day.
        let earliestStart = "";
        let commonEnd = "";
        for (const points of seriesMap.values()) {
          if (earliestStart === "" || points[0].date < earliestStart) {
            earliestStart = points[0].date;
          }
          const last = points[points.length - 1].date;
          if (commonEnd === "" || last < commonEnd) commonEnd = last;
        }

        // Apply the requested period — clamp to earliestStart (can't go before that)
        const days = PERIOD_DAYS[period];
        const lastDateMs = new Date(commonEnd).getTime();
        const requestedStart = days
          ? new Date(lastDateMs - days * 86400_000).toISOString().slice(0, 10)
          : "1990-01-01";
        const effectiveStart =
          requestedStart > earliestStart ? requestedStart : earliestStart;

        // Pick a spine series — the longest one within the effective range
        let spine: SeriesPoint[] | null = null;
        let spineLength = 0;
        for (const points of seriesMap.values()) {
          const filtered = points.filter(
            (p) => p.date >= effectiveStart && p.date <= commonEnd,
          );
          if (filtered.length > spineLength) {
            spine = filtered;
            spineLength = filtered.length;
          }
        }
        if (!spine || spine.length < 2) {
          setError("Not enough price history for this period.");
          setResult(null);
          setLoading(false);
          return;
        }

        // Determine join events — first time each fund has data within the range
        const joinEvents: JoinEvent[] = [];
        for (const a of activeAllocations) {
          const series = seriesMap.get(a.ticker);
          if (!series) continue;
          const inception = series[0].date;
          if (inception > effectiveStart && inception <= commonEnd) {
            joinEvents.push({
              date: inception,
              ticker: a.ticker,
              friendlyName: a.friendlyName,
              percentage: a.percentage,
            });
          }
        }
        joinEvents.sort((a, b) => a.date.localeCompare(b.date));

        // Compute portfolio series with proportional reweighting:
        // on each day, scale active weights so they sum to 100%.
        // Funds that haven't launched yet aren't included that day.
        const portfolioPoints: { date: string; value: number }[] = [];
        let portfolioValue = 100;
        const prevPrices = new Map<string, number>();

        // Seed prevPrices for funds that have data at effectiveStart
        for (const a of activeAllocations) {
          const series = seriesMap.get(a.ticker);
          if (!series) continue;
          if (series[0].date <= spine[0].date) {
            const p = priceAtOrBefore(series, spine[0].date);
            if (p != null && p > 0) prevPrices.set(a.ticker, p);
          }
        }
        portfolioPoints.push({ date: spine[0].date, value: 100 });

        for (let i = 1; i < spine.length; i++) {
          const dateStr = spine[i].date;

          // Determine which funds are active (have launched) by this date
          let activeWeightSum = 0;
          const activeToday: { ticker: string; percentage: number }[] = [];
          for (const a of activeAllocations) {
            const series = seriesMap.get(a.ticker);
            if (!series) continue;
            if (series[0].date <= dateStr) {
              activeToday.push(a);
              activeWeightSum += a.percentage;
            }
          }

          if (activeToday.length === 0 || activeWeightSum === 0) {
            portfolioPoints.push({ date: dateStr, value: portfolioValue });
            continue;
          }

          let dailyReturn = 0;
          for (const a of activeToday) {
            const series = seriesMap.get(a.ticker)!;
            const today = priceAtOrBefore(series, dateStr);
            if (today == null || today <= 0) continue;
            const prev = prevPrices.get(a.ticker);
            if (prev == null) {
              // Fund just joined — seed its price, no return today
              prevPrices.set(a.ticker, today);
              continue;
            }
            // Scale weight so active funds sum to 100%
            const scaledWeight = a.percentage / activeWeightSum;
            dailyReturn += scaledWeight * (today / prev - 1);
            prevPrices.set(a.ticker, today);
          }
          portfolioValue *= 1 + dailyReturn;
          portfolioPoints.push({ date: dateStr, value: portfolioValue });
        }

        // Compare benchmark series, normalised to 100 at the first date
        // where BOTH series have data. If the benchmark starts later than
        // the portfolio's chart start, the compare line begins mid-chart
        // at 100 (still useful — shows how the benchmark has fared since
        // it became available).
        let compareSeries: Map<string, number> | null = null;
        let compareReturn: number | null = null;
        if (compare) {
          const compareRaw = await getRawSeries(compare);
          if (compareRaw?.points && compareRaw.points.length >= 2) {
            // Find baseline: first compare point at or after effectiveStart
            let baseline: number | null = null;
            let baselineIdx = -1;
            for (let i = 0; i < compareRaw.points.length; i++) {
              if (compareRaw.points[i].date >= effectiveStart) {
                baseline = compareRaw.points[i].sgd;
                baselineIdx = i;
                break;
              }
            }
            if (baseline != null && baseline > 0 && baselineIdx >= 0) {
              compareSeries = new Map();
              for (let i = baselineIdx; i < compareRaw.points.length; i++) {
                const point = compareRaw.points[i];
                if (point.date > commonEnd) break;
                compareSeries.set(point.date, (point.sgd / baseline) * 100);
              }
              const lastCompareValue = compareSeries.get(
                portfolioPoints[portfolioPoints.length - 1].date,
              );
              if (lastCompareValue != null) {
                compareReturn = lastCompareValue / 100 - 1;
              }
            }
          }
        }

        // Build combined chart data
        const points: ChartPoint[] = portfolioPoints.map((p) => ({
          date: p.date,
          portfolio: p.value,
          compare: compareSeries?.get(p.date),
        }));

        if (cancelled) return;

        setResult({
          points,
          effectiveStart,
          joinEvents,
          portfolioReturn:
            portfolioPoints[portfolioPoints.length - 1].value / 100 - 1,
          compareReturn,
        });
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    period,
    compare,
    activeAllocations.map((a) => `${a.ticker}:${a.percentage}`).join(","),
  ]);

  if (allocations.length === 0) {
    return null;
  }

  const compareLabel = compare ? getCompareLabel(compare) : null;

  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        How this portfolio would have done in the past
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Simulated with continuous rebalancing to your target allocation. In
        SGD. Past performance doesn't predict the future.
      </p>

      {/* Chart + controls */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_200px]">
        <div className="aspect-[16/9] w-full">
          {loading ? (
            <div className="flex h-full animate-pulse items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
              Loading backtest…
            </div>
          ) : error || !result || result.points.length < 2 ? (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
              <div>
                <div>Couldn't compute backtest.</div>
                {error && (
                  <div className="mt-1 text-[10px] opacity-60">{error}</div>
                )}
              </div>
            </div>
          ) : (
            <BacktestChart
              points={result.points}
              period={period}
              joinEvents={result.joinEvents}
            />
          )}
        </div>

        <div className="space-y-3">
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
                  title={`Show ${PERIOD_LABELS[p]}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Compare with
            </div>
            <CompareSelect
              value={compare}
              onChange={setCompare}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      {result && !loading && !error && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile
            label="Your portfolio"
            value={result.portfolioReturn}
            highlight
          />
          {result.compareReturn != null && compareLabel && (
            <>
              <StatTile
                label={compareLabel}
                value={result.compareReturn}
                muted
              />
              <StatTile
                label="Difference"
                value={result.portfolioReturn - result.compareReturn}
                differential
              />
            </>
          )}
        </div>
      )}

      {/* Coverage note — explains the join events */}
      {result && result.joinEvents.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <div>
              Some funds launched after the chart starts. Their target weight
              is spread across the rest of the portfolio until they exist
              (markers on the chart show when each one joined).
            </div>
            <ul className="mt-2 space-y-0.5">
              {result.joinEvents.map((e) => (
                <li key={e.ticker}>
                  📍 <strong>{formatHumanDate(e.date)}</strong> —{" "}
                  <em>{e.friendlyName}</em> joined at {e.percentage}% weight
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

function BacktestChart({
  points,
  period,
  joinEvents,
}: {
  points: ChartPoint[];
  period: Period;
  joinEvents: JoinEvent[];
}) {
  const lastPortfolio = points[points.length - 1].portfolio;
  const isPositive = lastPortfolio >= 100;
  const mainColor = isPositive ? "#10b981" : "#f43f5e";
  const compareColor = "#a1a1aa";
  const gradientId = `bt-grad-${period}`;

  const allValues: number[] = [];
  for (const p of points) {
    allValues.push(p.portfolio);
    if (p.compare != null) allValues.push(p.compare);
  }
  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);
  const yPad = (yMax - yMin) * 0.1;

  const tickCount = 6;
  const tickIndices = Array.from({ length: tickCount }, (_, i) =>
    Math.floor((i * (points.length - 1)) / (tickCount - 1)),
  );
  const tickDates = new Set(tickIndices.map((i) => points[i].date));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={points}
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
            const p = payload[0].payload as ChartPoint;
            const portfolioChange = p.portfolio - 100;
            const compareChange = p.compare != null ? p.compare - 100 : null;
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
                      portfolioChange >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {portfolioChange >= 0 ? "+" : ""}
                    {portfolioChange.toFixed(2)}%
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
          dataKey="portfolio"
          stroke={mainColor}
          strokeWidth={1.75}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
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
        {joinEvents.map((e) => (
          <ReferenceLine
            key={e.ticker}
            x={e.date}
            stroke="#71717a"
            strokeDasharray="2 3"
            strokeWidth={1}
            label={{
              value: "📍",
              position: "insideTopRight",
              offset: 4,
              style: { fontSize: 11 },
            }}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function StatTile({
  label,
  value,
  highlight = false,
  muted = false,
  differential = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  muted?: boolean;
  differential?: boolean;
}) {
  const pct = value * 100;
  const sign = pct >= 0 ? "+" : "";
  const color = muted
    ? "text-zinc-700 dark:text-zinc-300"
    : pct >= 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";
  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        highlight
          ? "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40"
      }`}
    >
      <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${color}`}>
        {differential ? sign : sign}
        {pct.toFixed(1)}%
      </div>
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

function formatHumanDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
