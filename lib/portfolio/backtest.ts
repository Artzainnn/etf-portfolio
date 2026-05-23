/**
 * Pure portfolio-backtest computation. Given a set of allocations and a date
 * range, returns the simulated SGD value over time with continuous
 * rebalancing to target weights + pro-rata reweighting for short-history
 * funds (their weight is spread across active funds until they launch).
 *
 * Used by both the single-portfolio backtest section (portfolio-backtest.tsx)
 * and the multi-portfolio compare view (compare-view.tsx).
 */
import { getRawSeries, type Period } from "@/lib/marketData/clientPrices";

export interface BacktestAllocation {
  ticker: string;
  friendlyName: string;
  percentage: number;
}

export interface BacktestJoinEvent {
  date: string;
  ticker: string;
  friendlyName: string;
  percentage: number;
}

export interface BacktestSeries {
  /** Date-indexed series; values are normalized to 100 at effectiveStart. */
  points: { date: string; value: number }[];
  effectiveStart: string;
  joinEvents: BacktestJoinEvent[];
  totalReturn: number;
}

const PERIOD_DAYS: Record<Period, number | null> = {
  "1M": 31,
  "3M": 92,
  "6M": 183,
  "1Y": 366,
  "3Y": 366 * 3,
  "5Y": 366 * 5,
  Max: null,
};

interface SeriesPoint {
  date: string;
  sgd: number;
}

function priceAtOrBefore(
  series: SeriesPoint[],
  targetDate: string,
): number | null {
  let last: number | null = null;
  for (const p of series) {
    if (p.date > targetDate) break;
    last = p.sgd;
  }
  return last;
}

export async function computePortfolioBacktest(
  allocations: BacktestAllocation[],
  period: Period,
): Promise<BacktestSeries | null> {
  const active = allocations.filter((a) => a.percentage > 0);
  if (active.length === 0) return null;

  // Fetch all constituent series in parallel
  const entries = await Promise.all(
    active.map(async (a) => {
      const raw = await getRawSeries(a.ticker);
      return [a.ticker, raw?.points ?? null] as [string, SeriesPoint[] | null];
    }),
  );
  const seriesMap = new Map<string, SeriesPoint[]>();
  for (const [t, points] of entries) {
    if (points && points.length >= 2) seriesMap.set(t, points);
  }
  if (seriesMap.size === 0) return null;

  // Determine date range
  let earliestStart = "";
  let commonEnd = "";
  for (const points of seriesMap.values()) {
    if (earliestStart === "" || points[0].date < earliestStart) {
      earliestStart = points[0].date;
    }
    const last = points[points.length - 1].date;
    if (commonEnd === "" || last < commonEnd) commonEnd = last;
  }

  // Apply requested period (clamped to earliestStart)
  const days = PERIOD_DAYS[period];
  const lastDateMs = new Date(commonEnd).getTime();
  const requestedStart = days
    ? new Date(lastDateMs - days * 86400_000).toISOString().slice(0, 10)
    : "1990-01-01";
  const effectiveStart =
    requestedStart > earliestStart ? requestedStart : earliestStart;

  // Pick the longest available series within the range as the spine
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
  if (!spine || spine.length < 2) return null;

  // Detect join events
  const joinEvents: BacktestJoinEvent[] = [];
  for (const a of active) {
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

  // Compute series with daily rebalancing + pro-rata reweighting
  const points: { date: string; value: number }[] = [];
  let value = 100;
  const prevPrices = new Map<string, number>();

  for (const a of active) {
    const series = seriesMap.get(a.ticker);
    if (!series) continue;
    if (series[0].date <= spine[0].date) {
      const p = priceAtOrBefore(series, spine[0].date);
      if (p != null && p > 0) prevPrices.set(a.ticker, p);
    }
  }
  points.push({ date: spine[0].date, value: 100 });

  for (let i = 1; i < spine.length; i++) {
    const dateStr = spine[i].date;
    let activeWeightSum = 0;
    const activeToday: { ticker: string; percentage: number }[] = [];
    for (const a of active) {
      const series = seriesMap.get(a.ticker);
      if (!series) continue;
      if (series[0].date <= dateStr) {
        activeToday.push(a);
        activeWeightSum += a.percentage;
      }
    }
    if (activeToday.length === 0 || activeWeightSum === 0) {
      points.push({ date: dateStr, value });
      continue;
    }
    let dailyReturn = 0;
    for (const a of activeToday) {
      const series = seriesMap.get(a.ticker)!;
      const today = priceAtOrBefore(series, dateStr);
      if (today == null || today <= 0) continue;
      const prev = prevPrices.get(a.ticker);
      if (prev == null) {
        prevPrices.set(a.ticker, today);
        continue;
      }
      const scaled = a.percentage / activeWeightSum;
      dailyReturn += scaled * (today / prev - 1);
      prevPrices.set(a.ticker, today);
    }
    value *= 1 + dailyReturn;
    points.push({ date: dateStr, value });
  }

  return {
    points,
    effectiveStart,
    joinEvents,
    totalReturn: points[points.length - 1].value / 100 - 1,
  };
}

/** Normalize a benchmark series to 100 at the first date >= rangeStart. */
export async function computeBenchmarkSeries(
  benchmarkTicker: string,
  rangeStart: string,
  rangeEnd: string,
): Promise<{ points: Map<string, number>; totalReturn: number | null } | null> {
  const raw = await getRawSeries(benchmarkTicker);
  if (!raw?.points || raw.points.length < 2) return null;
  let baseline: number | null = null;
  let baselineIdx = -1;
  for (let i = 0; i < raw.points.length; i++) {
    if (raw.points[i].date >= rangeStart) {
      baseline = raw.points[i].sgd;
      baselineIdx = i;
      break;
    }
  }
  if (baseline == null || baseline <= 0 || baselineIdx < 0) return null;
  const points = new Map<string, number>();
  let lastValue = 0;
  for (let i = baselineIdx; i < raw.points.length; i++) {
    const p = raw.points[i];
    if (p.date > rangeEnd) break;
    const value = (p.sgd / baseline) * 100;
    points.set(p.date, value);
    lastValue = value;
  }
  return {
    points,
    totalReturn: lastValue > 0 ? lastValue / 100 - 1 : null,
  };
}
