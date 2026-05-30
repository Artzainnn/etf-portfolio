/**
 * Client-side helpers for reading the static price JSON files served from
 * /public/data/prices/{ticker}.json, slicing by period, and computing stats.
 *
 * No database access. No server-only deps. Safe to import from "use client"
 * components.
 */

export type Period = "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y" | "Max";

export interface PriceStats {
  totalReturn: number;
  annualizedReturn: number | null;
  maxDrawdown: number;
  volatility: number | null;
  periodYears: number;
}

export interface PriceSeriesResult {
  ticker: string;
  nativeCurrency: string;
  baseCurrency: "SGD";
  /** Normalized so first = 100. */
  points: { date: string; value: number }[];
  stats: PriceStats;
}

interface RawPriceFile {
  ticker: string;
  nativeCurrency: string;
  baseCurrency: string;
  points: [string, number][]; // [date, sgd]
}

/** Compact raw price series — direct SGD values, full history. */
export interface RawSeries {
  ticker: string;
  points: { date: string; sgd: number }[];
}

/** Series result with an optional comparison overlay aligned to main dates. */
export interface ComparedSeriesResult {
  main: PriceSeriesResult;
  compare: PriceSeriesResult | null;
  /** Date-aligned dual series for the chart. compare may be undefined per row. */
  combined: { date: string; main: number; compare?: number }[];
}

function periodToDays(period: Period): number | null {
  switch (period) {
    case "1M":
      return 31;
    case "3M":
      return 92;
    case "6M":
      return 183;
    case "1Y":
      return 366;
    case "3Y":
      return 366 * 3;
    case "5Y":
      return 366 * 5;
    case "Max":
      return null;
  }
}

// In-memory cache keyed by ticker — avoids refetching the same ~25KB JSON
// when the user toggles periods.
const CACHE = new Map<string, RawPriceFile>();
const IN_FLIGHT = new Map<string, Promise<RawPriceFile>>();

// We fetch price files from jsDelivr (which proxies GitHub `main`) so
// daily data refreshes appear without a Vercel redeploy. The path on
// the Vercel deployment itself is used as a fallback.
const REMOTE_PRICE_BASE =
  "https://cdn.jsdelivr.net/gh/Artzainnn/etf-portfolio@main/public/data/prices";

async function fetchRaw(ticker: string): Promise<RawPriceFile> {
  const cached = CACHE.get(ticker);
  if (cached) return cached;

  const existing = IN_FLIGHT.get(ticker);
  if (existing) return existing;

  const promise = (async () => {
    const enc = encodeURIComponent(ticker);
    let res: Response;
    try {
      res = await fetch(`${REMOTE_PRICE_BASE}/${enc}.json`, {
        cache: "force-cache",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      // Fallback: the Vercel-bundled snapshot
      res = await fetch(`/data/prices/${enc}.json`, { cache: "force-cache" });
      if (!res.ok) throw new Error(`Couldn't load price data for ${ticker}`);
    }
    const json = (await res.json()) as RawPriceFile;
    CACHE.set(ticker, json);
    IN_FLIGHT.delete(ticker);
    return json;
  })();
  IN_FLIGHT.set(ticker, promise);
  return promise;
}

/**
 * Load + slice + compute. Returns null if the ticker has no data or the slice
 * is empty.
 */
export async function getPriceSeries(
  ticker: string,
  period: Period,
): Promise<PriceSeriesResult | null> {
  const raw = await fetchRaw(ticker);
  if (raw.points.length === 0) return null;

  const days = periodToDays(period);
  const lastDateStr = raw.points[raw.points.length - 1][0];
  const cutoffDate = days
    ? new Date(new Date(lastDateStr).getTime() - days * 86400_000)
    : null;

  const sliced = cutoffDate
    ? raw.points.filter(([d]) => new Date(d) >= cutoffDate)
    : raw.points;

  if (sliced.length < 2) return null;

  const first = sliced[0][1];
  const points = sliced.map(([date, sgd]) => ({
    date,
    value: (sgd / first) * 100,
  }));

  const stats = computeStats(sliced);

  return {
    ticker: raw.ticker,
    nativeCurrency: raw.nativeCurrency,
    baseCurrency: "SGD",
    points,
    stats,
  };
}

/** Public helper: fetch raw SGD price points for a ticker (full history). */
export async function getRawSeries(ticker: string): Promise<RawSeries | null> {
  try {
    const raw = await fetchRaw(ticker);
    return {
      ticker: raw.ticker,
      points: raw.points.map(([date, sgd]) => ({ date, sgd })),
    };
  } catch {
    return null;
  }
}

/**
 * Get a main series + optional comparison series. When a comparison is
 * requested, both series are normalized to 100 at the **same** common
 * start date (the later of the two first-dates within the period) so the
 * lines are visually + numerically comparable. The total-return stat on
 * `main` also reflects performance from that common start.
 *
 * When no comparison is requested, behaves as before: main is normalized
 * to its own first date.
 */
export async function getSeriesWithCompare(
  mainTicker: string,
  compareTicker: string | null,
  period: Period,
): Promise<ComparedSeriesResult | null> {
  // No compare → existing single-series behaviour
  if (!compareTicker || compareTicker === mainTicker) {
    const main = await getPriceSeries(mainTicker, period);
    if (!main) return null;
    return {
      main,
      compare: null,
      combined: main.points.map((p) => ({ date: p.date, main: p.value })),
    };
  }

  // With compare → fetch raw series for both and align at common start
  let mainRawFile: RawPriceFile;
  let compareRawFile: RawPriceFile;
  try {
    [mainRawFile, compareRawFile] = await Promise.all([
      fetchRaw(mainTicker),
      fetchRaw(compareTicker),
    ]);
  } catch {
    // Fall back to main-only behaviour if the compare fetch fails
    const main = await getPriceSeries(mainTicker, period);
    if (!main) return null;
    return {
      main,
      compare: null,
      combined: main.points.map((p) => ({ date: p.date, main: p.value })),
    };
  }

  // Apply the period filter to both
  const days = periodToDays(period);
  const mainAll = mainRawFile.points;
  const compareAll = compareRawFile.points;
  if (mainAll.length === 0 || compareAll.length === 0) return null;

  const lastDate = mainAll[mainAll.length - 1][0];
  const cutoff = days
    ? new Date(new Date(lastDate).getTime() - days * 86400_000)
        .toISOString()
        .slice(0, 10)
    : "";

  const mainSliced = cutoff
    ? mainAll.filter(([d]) => d >= cutoff)
    : mainAll;
  const compareSliced = cutoff
    ? compareAll.filter(([d]) => d >= cutoff)
    : compareAll;

  if (mainSliced.length < 2 || compareSliced.length < 2) {
    // Not enough overlap — return main-only
    const main = await getPriceSeries(mainTicker, period);
    if (!main) return null;
    return {
      main,
      compare: null,
      combined: main.points.map((p) => ({ date: p.date, main: p.value })),
    };
  }

  // Common start = later of the two first-dates
  const mainStart = mainSliced[0][0];
  const compareStart = compareSliced[0][0];
  const commonStart = mainStart > compareStart ? mainStart : compareStart;

  // Slice both from the common start onward
  const mainFromCommon = mainSliced.filter(([d]) => d >= commonStart);
  const compareFromCommon = compareSliced.filter(([d]) => d >= commonStart);

  if (mainFromCommon.length < 2 || compareFromCommon.length < 2) {
    const main = await getPriceSeries(mainTicker, period);
    if (!main) return null;
    return {
      main,
      compare: null,
      combined: main.points.map((p) => ({ date: p.date, main: p.value })),
    };
  }

  const mainBase = mainFromCommon[0][1];
  const compareBase = compareFromCommon[0][1];

  // Map compare by date for the join
  const compareByDate = new Map<string, number>();
  for (const [d, sgd] of compareFromCommon) {
    compareByDate.set(d, (sgd / compareBase) * 100);
  }

  // Build combined data and normalized main points (both 100 at commonStart)
  const combined: { date: string; main: number; compare?: number }[] = [];
  const mainNormalized: { date: string; value: number }[] = [];
  for (const [d, sgd] of mainFromCommon) {
    const v = (sgd / mainBase) * 100;
    mainNormalized.push({ date: d, value: v });
    combined.push({ date: d, main: v, compare: compareByDate.get(d) });
  }

  // Stats are computed on raw SGD values from the common start
  const mainStats = computeStats(mainFromCommon);
  const compareStats = computeStats(compareFromCommon);

  return {
    main: {
      ticker: mainTicker,
      nativeCurrency: mainRawFile.nativeCurrency,
      baseCurrency: "SGD",
      points: mainNormalized,
      stats: mainStats,
    },
    compare: {
      ticker: compareTicker,
      nativeCurrency: compareRawFile.nativeCurrency,
      baseCurrency: "SGD",
      points: compareFromCommon.map(([d, sgd]) => ({
        date: d,
        value: (sgd / compareBase) * 100,
      })),
      stats: compareStats,
    },
    combined,
  };
}

function computeStats(points: [string, number][]): PriceStats {
  if (points.length < 2) {
    return {
      totalReturn: 0,
      annualizedReturn: null,
      maxDrawdown: 0,
      volatility: null,
      periodYears: 0,
    };
  }

  const first = points[0][1];
  const last = points[points.length - 1][1];
  const totalReturn = last / first - 1;

  const periodYears =
    (new Date(points[points.length - 1][0]).getTime() -
      new Date(points[0][0]).getTime()) /
    (365.25 * 86400_000);

  const annualizedReturn =
    periodYears >= 1 ? Math.pow(1 + totalReturn, 1 / periodYears) - 1 : null;

  let peak = first;
  let maxDD = 0;
  for (const [, v] of points) {
    if (v > peak) peak = v;
    const dd = v / peak - 1;
    if (dd < maxDD) maxDD = dd;
  }

  const logReturns: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const r = Math.log(points[i][1] / points[i - 1][1]);
    if (isFinite(r)) logReturns.push(r);
  }
  let volatility: number | null = null;
  if (logReturns.length > 20) {
    const mean = logReturns.reduce((a, b) => a + b, 0) / logReturns.length;
    const variance =
      logReturns.reduce((s, r) => s + (r - mean) ** 2, 0) /
      (logReturns.length - 1);
    volatility = Math.sqrt(variance) * Math.sqrt(252);
  }

  return {
    totalReturn,
    annualizedReturn,
    maxDrawdown: maxDD,
    volatility,
    periodYears,
  };
}
