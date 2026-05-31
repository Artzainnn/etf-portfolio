"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Info, Wallet } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  listPortfolios,
  type StoredPortfolio,
} from "@/lib/storage/portfolios";
import { ALL_ETFS_SYNC } from "@/lib/data/etfs";
import { ALL_STOCKS_SYNC, annualizedStockReturn } from "@/lib/data/stocks";
import { resolveLeaves } from "@/lib/portfolio/composition";
import { getCompareLabel } from "@/lib/data/compare";
import { getEtfEmoji } from "@/lib/data/emoji";
import { CompareSelect } from "./compare-select";
import { DEFAULT_COMPARE_TICKER } from "@/lib/data/benchmarks";
import {
  computeBenchmarkSeries,
  computePortfolioBacktest,
  type BacktestSeries,
} from "@/lib/portfolio/backtest";
import {
  formatMoney,
  projectScenarios,
  weightedAnnualFee,
  weightedReturn,
} from "@/lib/simulation/calculator";
import type { Period } from "@/lib/marketData/clientPrices";

interface ResolvedPortfolio {
  id: string;
  name: string;
  color: string;
  allocations: {
    ticker: string;
    friendlyName: string;
    percentage: number;
    ter: number | null;
    expectedReturn: number | null;
  }[];
}

const PORTFOLIO_COLORS = ["#10b981", "#3b82f6", "#f59e0b"]; // emerald / blue / amber
const PERIODS: Period[] = ["1M", "3M", "6M", "1Y", "3Y", "5Y", "Max"];

function bestExpectedReturn(etf: {
  return5YAnnualized?: string | null;
  return3YAnnualized?: string | null;
  return1Y?: string | null;
}): number | null {
  const v5 = etf.return5YAnnualized
    ? parseFloat(etf.return5YAnnualized)
    : null;
  if (v5 != null && isFinite(v5)) return v5;
  const v3 = etf.return3YAnnualized
    ? parseFloat(etf.return3YAnnualized)
    : null;
  if (v3 != null && isFinite(v3)) return v3;
  const v1 = etf.return1Y ? parseFloat(etf.return1Y) : null;
  if (v1 != null && isFinite(v1)) return v1;
  return null;
}

const COMPARE_ETFS_BY_TICKER = new Map(
  ALL_ETFS_SYNC.map((e) => [e.ticker, e]),
);
const COMPARE_STOCKS_BY_TICKER = new Map(
  ALL_STOCKS_SYNC.map((s) => [s.ticker, s]),
);

function resolvePortfolio(
  stored: StoredPortfolio,
  color: string,
  getPortfolioById: (id: string) => StoredPortfolio | null,
): ResolvedPortfolio {
  // Flatten ETFs, stocks, and nested portfolios into leaf holdings.
  const leaves = resolveLeaves(stored.allocations, getPortfolioById);
  const allocations = leaves
    .map((l) => {
      if (l.kind === "etf") {
        const etf = COMPARE_ETFS_BY_TICKER.get(l.ticker);
        if (!etf) return null;
        return {
          ticker: etf.ticker,
          friendlyName: etf.friendlyName ?? etf.name,
          percentage: l.percentage,
          ter: etf.ter ? parseFloat(etf.ter) : null,
          expectedReturn: bestExpectedReturn(etf),
        };
      }
      const s = COMPARE_STOCKS_BY_TICKER.get(l.ticker);
      if (!s) return null;
      return {
        ticker: s.ticker,
        friendlyName: s.friendlyName,
        percentage: l.percentage,
        ter: 0,
        expectedReturn: annualizedStockReturn(s.periodReturns),
      };
    })
    .filter((a): a is ResolvedPortfolio["allocations"][number] => a !== null);

  return {
    id: stored.id,
    name: stored.name,
    color,
    allocations,
  };
}

export function CompareView() {
  const [portfolios, setPortfolios] = useState<StoredPortfolio[] | null>(null);
  const [slotIds, setSlotIds] = useState<string[]>(["", "", ""]);
  const [benchmark, setBenchmark] = useState<string>(DEFAULT_COMPARE_TICKER);

  useEffect(() => {
    const list = listPortfolios();
    setPortfolios(list);
    if (list.length >= 2) {
      setSlotIds([list[0].id, list[1].id, ""]);
    } else if (list.length === 1) {
      setSlotIds([list[0].id, "", ""]);
    }
  }, []);

  const resolved: ResolvedPortfolio[] = useMemo(() => {
    if (!portfolios) return [];
    const byId = new Map(portfolios.map((p) => [p.id, p]));
    const getById = (id: string): StoredPortfolio | null => byId.get(id) ?? null;
    return slotIds
      .map((id, idx) => {
        const p = id ? byId.get(id) : undefined;
        if (!p) return null;
        return resolvePortfolio(p, PORTFOLIO_COLORS[idx], getById);
      })
      .filter((p): p is ResolvedPortfolio => p !== null);
  }, [portfolios, slotIds]);

  if (portfolios === null) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold tracking-tight">Compare portfolios</h1>
        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <Wallet className="mx-auto h-10 w-10 text-zinc-400" />
          <h2 className="mt-3 text-base font-medium text-zinc-900 dark:text-zinc-100">
            You don't have any portfolios yet
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Create at least two portfolios first, then come back here to put
            them side-by-side.
          </p>
          <Link
            href="/portfolios"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Go to Portfolio Builder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Compare portfolios</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Pick up to 3 of your portfolios and an optional benchmark, then see
          how they would have performed historically and how they could grow.
        </p>
      </div>

      {/* Slot pickers */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {slotIds.map((slotId, idx) => (
            <div key={idx}>
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: PORTFOLIO_COLORS[idx] }}
                />
                Portfolio {idx + 1}
              </div>
              <select
                value={slotId}
                onChange={(e) =>
                  setSlotIds((prev) => {
                    const next = [...prev];
                    next[idx] = e.target.value;
                    return next;
                  })
                }
                className="w-full appearance-none rounded-md border border-zinc-300 bg-white py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-zinc-700"
              >
                <option value="">— None</option>
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Benchmark
          </div>
          <CompareSelect value={benchmark} onChange={setBenchmark} />
        </div>
      </div>

      {resolved.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
          Pick at least one portfolio above.
        </div>
      ) : (
        <>
          <HistoryComparison
            portfolios={resolved}
            benchmark={benchmark || null}
          />
          <ProjectionComparison portfolios={resolved} />
        </>
      )}
    </div>
  );
}

// ─── History comparison ──────────────────────────────────────────────

interface HistoryDatapoint {
  date: string;
  values: Record<string, number | undefined>; // key: 'p1' | 'p2' | 'p3' | 'bench'
}

function HistoryComparison({
  portfolios,
  benchmark,
}: {
  portfolios: ResolvedPortfolio[];
  benchmark: string | null;
}) {
  const [period, setPeriod] = useState<Period>("1Y");
  const [chartData, setChartData] = useState<HistoryDatapoint[] | null>(null);
  const [results, setResults] = useState<{
    portfolioReturns: Record<string, number>;
    benchmarkReturn: number | null;
    earliestStart: string | null;
    joinEvents: {
      portfolioId: string;
      portfolioName: string;
      portfolioColor: string;
      ticker: string;
      date: string;
      friendlyName: string;
      percentage: number;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (portfolios.length === 0) {
      setChartData(null);
      setResults(null);
      return;
    }
    let cancelled = false;
    setLoading(true);

    (async () => {
      const seriesByPortfolio = await Promise.all(
        portfolios.map(async (p) => {
          const series = await computePortfolioBacktest(
            p.allocations.map((a) => ({
              ticker: a.ticker,
              friendlyName: a.friendlyName,
              percentage: a.percentage,
            })),
            period,
          );
          return { portfolio: p, series };
        }),
      );

      if (cancelled) return;

      const valid = seriesByPortfolio.filter(
        (s): s is { portfolio: ResolvedPortfolio; series: BacktestSeries } =>
          s.series !== null,
      );
      if (valid.length === 0) {
        setChartData(null);
        setResults(null);
        setLoading(false);
        return;
      }

      // Use the longest series as the date spine
      const longest = valid.reduce((a, b) =>
        a.series.points.length >= b.series.points.length ? a : b,
      );
      const dateSpine = longest.series.points.map((p) => p.date);

      // Find earliest start across all series (to align benchmark)
      const earliestStart = valid.reduce(
        (acc, s) =>
          !acc || s.series.effectiveStart < acc ? s.series.effectiveStart : acc,
        "",
      );
      const latestEnd = dateSpine[dateSpine.length - 1];

      // Map each portfolio's points to its date for fast lookup
      const portfolioPointMaps = valid.map((s) => ({
        portfolio: s.portfolio,
        map: new Map(s.series.points.map((p) => [p.date, p.value])),
      }));

      // Optional benchmark
      let benchmarkMap: Map<string, number> | null = null;
      let benchmarkReturn: number | null = null;
      if (benchmark) {
        const b = await computeBenchmarkSeries(
          benchmark,
          earliestStart,
          latestEnd,
        );
        if (b) {
          benchmarkMap = b.points;
          benchmarkReturn = b.totalReturn;
        }
      }

      const combined: HistoryDatapoint[] = dateSpine.map((date) => {
        const values: HistoryDatapoint["values"] = {};
        for (const { portfolio, map } of portfolioPointMaps) {
          const v = map.get(date);
          if (v != null) values[`p_${portfolio.id}`] = v;
        }
        if (benchmarkMap) {
          const v = benchmarkMap.get(date);
          if (v != null) values["bench"] = v;
        }
        return { date, values };
      });

      // Total returns
      const portfolioReturns: Record<string, number> = {};
      for (const { portfolio, series } of valid) {
        portfolioReturns[portfolio.id] = series.totalReturn;
      }
      // Collect all join events with their portfolio + sort by date
      const joinEvents = valid
        .flatMap((s) =>
          s.series.joinEvents.map((e) => ({
            portfolioId: s.portfolio.id,
            portfolioName: s.portfolio.name,
            portfolioColor: s.portfolio.color,
            ticker: e.ticker,
            date: e.date,
            friendlyName: e.friendlyName,
            percentage: e.percentage,
          })),
        )
        .sort((a, b) => a.date.localeCompare(b.date));

      setChartData(combined);
      setResults({
        portfolioReturns,
        benchmarkReturn,
        earliestStart,
        joinEvents,
      });
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [portfolios, period, benchmark]);

  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        How they would have done in the past
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Period
        </span>
        <div className="inline-flex flex-wrap rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
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

      <div className="mt-4 aspect-[16/9] w-full">
        {loading ? (
          <div className="flex h-full animate-pulse items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
            Loading…
          </div>
        ) : chartData == null || chartData.length < 2 ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            Couldn't compute backtest for this combination.
          </div>
        ) : (
          <HistoryChart
            data={chartData}
            portfolios={portfolios}
            benchmarkLabel={benchmark ? getCompareLabel(benchmark) : null}
            joinEvents={results?.joinEvents ?? []}
          />
        )}
      </div>

      {results && portfolios.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {portfolios.map((p) => (
            <ReturnTile
              key={p.id}
              label={p.name}
              value={results.portfolioReturns[p.id]}
              color={p.color}
            />
          ))}
          {results.benchmarkReturn != null && (
            <ReturnTile
              label="Benchmark"
              value={results.benchmarkReturn}
              color="#a1a1aa"
              muted
            />
          )}
        </div>
      )}

      {results && results.joinEvents.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <div>
              Some funds launched after the chart starts. Their target weight
              is spread across the rest of the portfolio until they exist
              (markers on the chart show when each one joined).
            </div>
            <ul className="mt-2 space-y-0.5">
              {results.joinEvents.map((e) => (
                <li
                  key={`${e.portfolioId}-${e.ticker}`}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: e.portfolioColor }}
                  />
                  📍 <strong>{formatHumanDate(e.date)}</strong> —{" "}
                  <em>{e.friendlyName}</em> joined{" "}
                  <span className="font-medium">
                    &quot;{e.portfolioName}&quot;
                  </span>{" "}
                  at {e.percentage}% weight
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

function HistoryChart({
  data,
  portfolios,
  benchmarkLabel,
  joinEvents,
}: {
  data: HistoryDatapoint[];
  portfolios: ResolvedPortfolio[];
  benchmarkLabel: string | null;
  joinEvents: {
    portfolioId: string;
    portfolioColor: string;
    ticker: string;
    date: string;
  }[];
}) {
  // Flatten the nested values structure so Recharts can read them as dataKeys.
  const flat = data.map((d) => {
    const row: Record<string, string | number | undefined> = { date: d.date };
    for (const [k, v] of Object.entries(d.values)) row[k] = v;
    return row;
  });

  const tickCount = 6;
  const tickIndices = Array.from({ length: tickCount }, (_, i) =>
    Math.floor((i * (data.length - 1)) / (tickCount - 1)),
  );
  const tickDates = new Set(tickIndices.map((i) => data[i].date));

  const allValues: number[] = [];
  for (const d of data) {
    for (const v of Object.values(d.values)) {
      if (typeof v === "number") allValues.push(v);
    }
  }
  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);
  const yPad = (yMax - yMin) * 0.08;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={flat} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="currentColor"
          className="text-zinc-200 dark:text-zinc-800"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => {
            const date = new Date(d);
            return date.toLocaleDateString("en-GB", {
              month: "short",
              year: "2-digit",
            });
          }}
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
          width={42}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null;
            const row = payload[0].payload as Record<string, number | string>;
            return (
              <div className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {row.date}
                </div>
                {portfolios.map((p) => {
                  const v = row[`p_${p.id}`];
                  if (typeof v !== "number") return null;
                  const ch = v - 100;
                  return (
                    <div
                      key={p.id}
                      className="mt-1 flex items-center gap-2"
                    >
                      <span
                        className="inline-block h-1.5 w-3 rounded-sm"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="truncate text-zinc-700 dark:text-zinc-300">
                        {p.name}
                      </span>
                      <span
                        className={`ml-auto tabular-nums ${
                          ch >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {ch >= 0 ? "+" : ""}
                        {ch.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
                {benchmarkLabel && typeof row.bench === "number" && (
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="inline-block h-1.5 w-3 rounded-sm"
                      style={{ backgroundColor: "#a1a1aa" }}
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      Benchmark
                    </span>
                    <span className="ml-auto tabular-nums text-zinc-600 dark:text-zinc-400">
                      {row.bench - 100 >= 0 ? "+" : ""}
                      {(row.bench - 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            );
          }}
        />
        {portfolios.map((p) => (
          <Line
            key={p.id}
            type="monotone"
            dataKey={`p_${p.id}`}
            stroke={p.color}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
        ))}
        {benchmarkLabel && (
          <Line
            type="monotone"
            dataKey="bench"
            stroke="#a1a1aa"
            strokeWidth={1.25}
            strokeDasharray="4 3"
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
        )}
        {joinEvents.map((e) => (
          <ReferenceLine
            key={`${e.portfolioId}-${e.ticker}`}
            x={e.date}
            stroke={e.portfolioColor}
            strokeDasharray="2 3"
            strokeOpacity={0.6}
            strokeWidth={1}
            label={{
              value: "📍",
              position: "insideTopRight",
              offset: 4,
              style: { fontSize: 11 },
            }}
          />
        ))}
        <Legend
          verticalAlign="top"
          height={20}
          iconSize={8}
          wrapperStyle={{ fontSize: 11 }}
          formatter={(val) => {
            if (val === "bench") return "Benchmark";
            const id = String(val).replace(/^p_/, "");
            const p = portfolios.find((pp) => pp.id === id);
            return p?.name ?? val;
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function formatHumanDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Projection comparison ──────────────────────────────────────────

function ProjectionComparison({
  portfolios,
}: {
  portfolios: ResolvedPortfolio[];
}) {
  const [initial, setInitial] = useState(50000);
  const [monthly, setMonthly] = useState(5000);
  const [years, setYears] = useState(10);

  const projections = useMemo(() => {
    return portfolios.map((p) => {
      const weightedR = weightedReturn(
        p.allocations.map((a) => ({
          percentage: a.percentage,
          expectedReturn: a.expectedReturn,
        })),
      );
      const fee = weightedAnnualFee(
        p.allocations.map((a) => ({
          percentage: a.percentage,
          ter: a.ter,
        })),
      );
      if (weightedR == null) return null;
      const scenarios = projectScenarios({
        initialInvestment: initial,
        monthlyContribution: monthly,
        durationYears: years,
        expectedAnnualReturn: weightedR,
        inflationRate: 0.02,
      });
      const finalRealistic = scenarios[scenarios.length - 1].realistic;
      return {
        portfolio: p,
        weightedReturn: weightedR,
        annualFee: fee,
        scenarios,
        finalRealistic,
      };
    });
  }, [portfolios, initial, monthly, years]);

  const validProjections = projections.filter(
    (p): p is NonNullable<typeof p> => p !== null,
  );

  if (validProjections.length === 0) {
    return (
      <section className="mt-10">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          How they could grow
        </h2>
        <p className="mt-3 text-sm text-zinc-500">
          Add funds with available return data to see a projection.
        </p>
      </section>
    );
  }

  // Build chart data — years × portfolios
  const chartData: Record<string, string | number>[] = [];
  for (let y = 0; y <= years; y++) {
    const row: Record<string, string | number> = { year: y };
    let contributed = initial + monthly * 12 * y;
    row.contributed = contributed;
    for (const proj of validProjections) {
      row[`p_${proj.portfolio.id}`] = proj.scenarios[y].realistic;
    }
    chartData.push(row);
  }

  return (
    <section className="mt-10">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        How they could grow (realistic projection)
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Same starting amount and monthly top-up applied to each portfolio.
        Uses 75% of each portfolio's historical return (haircut for realism).
      </p>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <NumberField
            label="Starting amount"
            value={initial}
            onChange={setInitial}
            suffix="SGD"
            step={1000}
          />
          <NumberField
            label="Monthly top-up"
            value={monthly}
            onChange={setMonthly}
            suffix="SGD"
            step={100}
          />
          <NumberField
            label="Years"
            value={years}
            onChange={setYears}
            min={1}
            max={40}
            step={1}
          />
        </div>
      </div>

      <div className="mt-4 aspect-[16/9] w-full">
        <ProjectionChart
          data={chartData}
          portfolios={portfolios}
          years={years}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {validProjections.map((proj) => (
          <div
            key={proj.portfolio.id}
            className="rounded-lg border bg-white p-4 dark:bg-zinc-900"
            style={{ borderColor: proj.portfolio.color }}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: proj.portfolio.color }}
              />
              {proj.portfolio.name}
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatMoney(proj.finalRealistic)}
            </div>
            <div className="mt-1 grid grid-cols-2 gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              <div>
                Expected:{" "}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {(proj.weightedReturn * 100).toFixed(1)}%/yr
                </span>
              </div>
              {proj.annualFee != null && (
                <div>
                  Fee:{" "}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {(proj.annualFee * 100).toFixed(2)}%/yr
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectionChart({
  data,
  portfolios,
  years,
}: {
  data: Record<string, string | number>[];
  portfolios: ResolvedPortfolio[];
  years: number;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="currentColor"
          className="text-zinc-200 dark:text-zinc-800"
          vertical={false}
        />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "currentColor" }}
          className="text-zinc-500"
        />
        <YAxis
          tickFormatter={(v) =>
            formatMoney(v as number, "SGD", { compact: true }).replace("SGD", "")
          }
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "currentColor" }}
          className="text-zinc-500"
          width={50}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null;
            const row = payload[0].payload as Record<string, number>;
            return (
              <div className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Year {row.year}
                </div>
                {portfolios.map((p) => {
                  const v = row[`p_${p.id}`];
                  if (typeof v !== "number") return null;
                  return (
                    <div
                      key={p.id}
                      className="mt-1 flex items-center gap-2"
                    >
                      <span
                        className="inline-block h-1.5 w-3 rounded-sm"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {p.name}
                      </span>
                      <span className="ml-auto font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                        {formatMoney(v)}
                      </span>
                    </div>
                  );
                })}
                <div className="mt-1 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <span
                    className="inline-block h-1.5 w-3"
                    style={{ borderTop: "1.5px dashed #71717a" }}
                  />
                  <span>Contributed</span>
                  <span className="ml-auto tabular-nums">
                    {formatMoney(row.contributed)}
                  </span>
                </div>
              </div>
            );
          }}
        />
        {portfolios.map((p) => (
          <Line
            key={p.id}
            type="monotone"
            dataKey={`p_${p.id}`}
            stroke={p.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
        <Line
          type="monotone"
          dataKey="contributed"
          stroke="#71717a"
          strokeWidth={1.25}
          strokeDasharray="4 3"
          dot={false}
          isAnimationActive={false}
        />
        <Legend
          verticalAlign="top"
          height={20}
          iconSize={8}
          wrapperStyle={{ fontSize: 11 }}
          formatter={(val) => {
            if (val === "contributed") return "Money put in";
            const id = String(val).replace(/^p_/, "");
            const p = portfolios.find((pp) => pp.id === id);
            return p?.name ?? val;
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  step = 1,
  min = 0,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <div className="mt-1.5 flex items-center rounded-md border border-zinc-300 bg-white focus-within:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          min={min}
          max={max}
          className="w-full bg-transparent px-3 py-2 text-sm tabular-nums focus:outline-none"
        />
        {suffix && (
          <span className="shrink-0 px-3 text-xs text-zinc-500">{suffix}</span>
        )}
      </div>
    </label>
  );
}

function ReturnTile({
  label,
  value,
  color,
  muted = false,
}: {
  label: string;
  value: number;
  color: string;
  muted?: boolean;
}) {
  const pct = value * 100;
  const sign = pct >= 0 ? "+" : "";
  const cls = muted
    ? "text-zinc-700 dark:text-zinc-300"
    : pct >= 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";
  return (
    <div
      className={`rounded-lg border bg-white px-4 py-3 dark:bg-zinc-900 ${muted ? "border-zinc-200 dark:border-zinc-800" : ""}`}
      style={!muted ? { borderColor: color } : undefined}
    >
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="truncate">{label}</span>
      </div>
      <div className={`mt-1 text-lg font-bold tabular-nums ${cls}`}>
        {sign}
        {pct.toFixed(1)}%
      </div>
    </div>
  );
}
