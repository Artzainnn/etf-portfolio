"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Info, Plus, Search, X } from "lucide-react";
import {
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
import {
  COMPARE_OPTIONS,
  getCompareMeta,
  type CompareGroup,
} from "@/lib/data/compare";
import {
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

interface ResolvedItem {
  /** Safe, unique key usable as a Recharts dataKey suffix. */
  id: string;
  name: string;
  color: string;
  /** "Portfolio" | "Benchmark" | "Fund" | "Stock" */
  badge: string;
  emoji: string;
  allocations: {
    ticker: string;
    friendlyName: string;
    percentage: number;
    ter: number | null;
    expectedReturn: number | null;
  }[];
}

// emerald / blue / amber / violet
const ITEM_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#a855f7"];
const MAX_ITEMS = 4;
const PERIODS: Period[] = ["1M", "3M", "6M", "1Y", "3Y", "5Y", "Max"];

function bestExpectedReturn(etf: {
  return5YAnnualized?: string | null;
  return3YAnnualized?: string | null;
  return1Y?: string | null;
}): number | null {
  const v5 = etf.return5YAnnualized ? parseFloat(etf.return5YAnnualized) : null;
  if (v5 != null && isFinite(v5)) return v5;
  const v3 = etf.return3YAnnualized ? parseFloat(etf.return3YAnnualized) : null;
  if (v3 != null && isFinite(v3)) return v3;
  const v1 = etf.return1Y ? parseFloat(etf.return1Y) : null;
  if (v1 != null && isFinite(v1)) return v1;
  return null;
}

const COMPARE_ETFS_BY_TICKER = new Map(ALL_ETFS_SYNC.map((e) => [e.ticker, e]));
const COMPARE_STOCKS_BY_TICKER = new Map(
  ALL_STOCKS_SYNC.map((s) => [s.ticker, s]),
);

/**
 * A comparison item is keyed as either:
 *   - "p:<portfolioId>"  → one of the user's saved portfolios
 *   - "t:<ticker>"       → a single ETF or stock (a benchmark is just an ETF)
 */
function safeId(key: string): string {
  return key.replace(/[^a-z0-9]/gi, "_");
}

function resolvePortfolioAllocations(
  stored: StoredPortfolio,
  getPortfolioById: (id: string) => StoredPortfolio | null,
): ResolvedItem["allocations"] {
  const leaves = resolveLeaves(stored.allocations, getPortfolioById);
  return leaves
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
    .filter((a): a is ResolvedItem["allocations"][number] => a !== null);
}

function resolveItem(
  key: string,
  color: string,
  getPortfolioById: (id: string) => StoredPortfolio | null,
): ResolvedItem | null {
  if (key.startsWith("p:")) {
    const p = getPortfolioById(key.slice(2));
    if (!p) return null;
    return {
      id: safeId(key),
      name: p.name,
      color,
      badge: "Portfolio",
      emoji: "🧺",
      allocations: resolvePortfolioAllocations(p, getPortfolioById),
    };
  }
  const ticker = key.slice(2);
  const meta = getCompareMeta(ticker);
  const etf = COMPARE_ETFS_BY_TICKER.get(ticker);
  if (etf) {
    return {
      id: safeId(key),
      name: meta?.label ?? etf.friendlyName ?? etf.name,
      color,
      badge: meta?.group === "Benchmarks" ? "Benchmark" : "Fund",
      emoji: meta?.emoji ?? "📊",
      allocations: [
        {
          ticker,
          friendlyName: etf.friendlyName ?? etf.name,
          percentage: 100,
          ter: etf.ter ? parseFloat(etf.ter) : null,
          expectedReturn: bestExpectedReturn(etf),
        },
      ],
    };
  }
  const s = COMPARE_STOCKS_BY_TICKER.get(ticker);
  if (s) {
    return {
      id: safeId(key),
      name: meta?.label ?? s.friendlyName,
      color,
      badge: "Stock",
      emoji: meta?.emoji ?? "📊",
      allocations: [
        {
          ticker,
          friendlyName: s.friendlyName,
          percentage: 100,
          ter: 0,
          expectedReturn: annualizedStockReturn(s.periodReturns),
        },
      ],
    };
  }
  return null;
}

export function CompareView() {
  const [portfolios, setPortfolios] = useState<StoredPortfolio[] | null>(null);
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    const list = listPortfolios();
    setPortfolios(list);
    // Sensible default: the first portfolio(s), topped up with benchmarks so
    // there's always at least two lines to compare — even with no portfolios.
    const init: string[] = [];
    if (list[0]) init.push(`p:${list[0].id}`);
    if (list[1]) init.push(`p:${list[1].id}`);
    for (const t of ["CSPX.L", "IWDA.L"]) {
      if (init.length >= 2) break;
      init.push(`t:${t}`);
    }
    setKeys(init.slice(0, MAX_ITEMS));
  }, []);

  const portfoliosById = useMemo(
    () => new Map((portfolios ?? []).map((p) => [p.id, p])),
    [portfolios],
  );

  const resolved: ResolvedItem[] = useMemo(() => {
    if (!portfolios) return [];
    const getById = (id: string) => portfoliosById.get(id) ?? null;
    return keys
      .map((key, idx) => resolveItem(key, ITEM_COLORS[idx], getById))
      .filter((r): r is ResolvedItem => r !== null);
  }, [portfolios, portfoliosById, keys]);

  function addKey(key: string) {
    setKeys((prev) => (prev.includes(key) || prev.length >= MAX_ITEMS ? prev : [...prev, key]));
  }
  function removeKey(key: string) {
    setKeys((prev) => prev.filter((k) => k !== key));
  }

  if (portfolios === null) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Compare</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Put up to {MAX_ITEMS} things side-by-side — any mix of your
          portfolios, funds, and individual stocks. See how they would have
          performed in the past and how they could grow.
        </p>
      </div>

      {/* Selected items + add */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-2">
          {keys.map((key, idx) => {
            const item = resolved.find((r) => r.id === safeId(key));
            const color = ITEM_COLORS[idx];
            return (
              <SelectedChip
                key={key}
                color={color}
                emoji={item?.emoji ?? "📊"}
                name={item?.name ?? "(unavailable)"}
                badge={item?.badge ?? ""}
                onRemove={() => removeKey(key)}
              />
            );
          })}
          {keys.length < MAX_ITEMS && (
            <ComparisonPicker
              portfolios={portfolios}
              excludeKeys={new Set(keys)}
              onAdd={addKey}
            />
          )}
        </div>
      </div>

      {resolved.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
          Add at least one investment above to compare.
        </div>
      ) : (
        <>
          <HistoryComparison items={resolved} />
          <ProjectionComparison items={resolved} />
        </>
      )}
    </div>
  );
}

function SelectedChip({
  color,
  emoji,
  name,
  badge,
  onRemove,
}: {
  color: string;
  emoji: string;
  name: string;
  badge: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white py-1 pl-2 pr-1 text-xs dark:border-zinc-700 dark:bg-zinc-950">
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span aria-hidden>{emoji}</span>
      <span className="max-w-[180px] truncate font-medium text-zinc-800 dark:text-zinc-200">
        {name}
      </span>
      {badge && (
        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {badge}
        </span>
      )}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        aria-label={`Remove ${name}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

interface PickerOption {
  key: string;
  emoji: string;
  label: string;
  ticker?: string;
  group: "Your portfolios" | CompareGroup;
}

function ComparisonPicker({
  portfolios,
  excludeKeys,
  onAdd,
}: {
  portfolios: StoredPortfolio[];
  excludeKeys: Set<string>;
  onAdd: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const allOptions: PickerOption[] = useMemo(
    () => [
      ...portfolios.map((p) => ({
        key: `p:${p.id}`,
        emoji: "🧺",
        label: p.name,
        group: "Your portfolios" as const,
      })),
      ...COMPARE_OPTIONS.map((o) => ({
        key: `t:${o.ticker}`,
        emoji: o.emoji,
        label: o.label,
        ticker: o.ticker,
        group: o.group,
      })),
    ],
    [portfolios],
  );

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const order: PickerOption["group"][] = [
      "Your portfolios",
      "Benchmarks",
      "Funds",
      "Stocks",
    ];
    const buckets = new Map<string, PickerOption[]>();
    for (const o of allOptions) {
      if (excludeKeys.has(o.key)) continue;
      if (q && !`${o.label} ${o.ticker ?? ""}`.toLowerCase().includes(q)) continue;
      const arr = buckets.get(o.group) ?? [];
      if (arr.length < 50) {
        arr.push(o);
        buckets.set(o.group, arr);
      }
    }
    return order
      .map((g) => ({ group: g, items: buckets.get(g) ?? [] }))
      .filter((b) => b.items.length > 0);
  }, [allOptions, excludeKeys, query]);

  function pick(key: string) {
    onAdd(key);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <Plus className="h-3.5 w-3.5" />
        Add to compare
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-1 w-72 max-w-[85vw] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <div className="relative border-b border-zinc-100 p-2 dark:border-zinc-800">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search portfolios, funds, stocks…"
              className="w-full rounded-md border border-zinc-300 bg-white py-1.5 pl-8 pr-2 text-xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <ul role="listbox" className="max-h-72 overflow-y-auto py-1 text-xs">
            {groups.length === 0 ? (
              <li className="px-3 py-4 text-center text-zinc-500">No matches.</li>
            ) : (
              groups.map(({ group, items }) => (
                <li key={group}>
                  <div className="px-3 pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {group}
                  </div>
                  <ul>
                    {items.map((o) => (
                      <li key={o.key}>
                        <button
                          type="button"
                          onClick={() => pick(o.key)}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                        >
                          <span className="w-4 shrink-0 text-center" aria-hidden>
                            {o.emoji}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{o.label}</span>
                          {o.ticker && (
                            <span className="shrink-0 font-mono text-[10px] text-zinc-400">
                              {o.ticker}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── History comparison ──────────────────────────────────────────────

interface HistoryDatapoint {
  date: string;
  values: Record<string, number | undefined>; // key: `p_<id>`
}

function HistoryComparison({ items }: { items: ResolvedItem[] }) {
  const [period, setPeriod] = useState<Period>("1Y");
  const [chartData, setChartData] = useState<HistoryDatapoint[] | null>(null);
  const [results, setResults] = useState<{
    returns: Record<string, number>;
    joinEvents: {
      itemId: string;
      itemName: string;
      itemColor: string;
      ticker: string;
      date: string;
      friendlyName: string;
      percentage: number;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setChartData(null);
      setResults(null);
      return;
    }
    let cancelled = false;
    setLoading(true);

    (async () => {
      const seriesByItem = await Promise.all(
        items.map(async (it) => {
          const series = await computePortfolioBacktest(
            it.allocations.map((a) => ({
              ticker: a.ticker,
              friendlyName: a.friendlyName,
              percentage: a.percentage,
            })),
            period,
          );
          return { item: it, series };
        }),
      );

      if (cancelled) return;

      const valid = seriesByItem.filter(
        (s): s is { item: ResolvedItem; series: BacktestSeries } =>
          s.series !== null,
      );
      if (valid.length === 0) {
        setChartData(null);
        setResults(null);
        setLoading(false);
        return;
      }

      // Use the longest series as the date spine.
      const longest = valid.reduce((a, b) =>
        a.series.points.length >= b.series.points.length ? a : b,
      );
      const dateSpine = longest.series.points.map((p) => p.date);

      const itemPointMaps = valid.map((s) => ({
        item: s.item,
        map: new Map(s.series.points.map((p) => [p.date, p.value])),
      }));

      const combined: HistoryDatapoint[] = dateSpine.map((date) => {
        const values: HistoryDatapoint["values"] = {};
        for (const { item, map } of itemPointMaps) {
          const v = map.get(date);
          if (v != null) values[`p_${item.id}`] = v;
        }
        return { date, values };
      });

      const returns: Record<string, number> = {};
      for (const { item, series } of valid) returns[item.id] = series.totalReturn;

      const joinEvents = valid
        .flatMap((s) =>
          s.series.joinEvents.map((e) => ({
            itemId: s.item.id,
            itemName: s.item.name,
            itemColor: s.item.color,
            ticker: e.ticker,
            date: e.date,
            friendlyName: e.friendlyName,
            percentage: e.percentage,
          })),
        )
        .sort((a, b) => a.date.localeCompare(b.date));

      setChartData(combined);
      setResults({ returns, joinEvents });
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [items, period]);

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
            Couldn't compute a backtest for this combination.
          </div>
        ) : (
          <HistoryChart
            data={chartData}
            items={items}
            joinEvents={results?.joinEvents ?? []}
          />
        )}
      </div>

      {results && items.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((it) => (
            <ReturnTile
              key={it.id}
              label={it.name}
              value={results.returns[it.id]}
              color={it.color}
            />
          ))}
        </div>
      )}

      {results && results.joinEvents.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <div>
              Some funds launched after the chart starts. Their target weight is
              spread across the rest until they exist (markers show when each
              one joined).
            </div>
            <ul className="mt-2 space-y-0.5">
              {results.joinEvents.map((e) => (
                <li
                  key={`${e.itemId}-${e.ticker}`}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: e.itemColor }}
                  />
                  📍 <strong>{formatHumanDate(e.date)}</strong> —{" "}
                  <em>{e.friendlyName}</em> joined{" "}
                  <span className="font-medium">&quot;{e.itemName}&quot;</span> at{" "}
                  {e.percentage}% weight
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
  items,
  joinEvents,
}: {
  data: HistoryDatapoint[];
  items: ResolvedItem[];
  joinEvents: {
    itemId: string;
    itemColor: string;
    ticker: string;
    date: string;
  }[];
}) {
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
                {items.map((it) => {
                  const v = row[`p_${it.id}`];
                  if (typeof v !== "number") return null;
                  const ch = v - 100;
                  return (
                    <div key={it.id} className="mt-1 flex items-center gap-2">
                      <span
                        className="inline-block h-1.5 w-3 rounded-sm"
                        style={{ backgroundColor: it.color }}
                      />
                      <span className="max-w-[160px] truncate text-zinc-700 dark:text-zinc-300">
                        {it.name}
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
              </div>
            );
          }}
        />
        {items.map((it) => (
          <Line
            key={it.id}
            type="monotone"
            dataKey={`p_${it.id}`}
            stroke={it.color}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
        ))}
        {joinEvents.map((e) => (
          <ReferenceLine
            key={`${e.itemId}-${e.ticker}`}
            x={e.date}
            stroke={e.itemColor}
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
            const id = String(val).replace(/^p_/, "");
            const it = items.find((x) => x.id === id);
            return it?.name ?? val;
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

function ProjectionComparison({ items }: { items: ResolvedItem[] }) {
  const [initial, setInitial] = useState(50000);
  const [monthly, setMonthly] = useState(5000);
  const [years, setYears] = useState(10);

  const projections = useMemo(() => {
    return items.map((it) => {
      const weightedR = weightedReturn(
        it.allocations.map((a) => ({
          percentage: a.percentage,
          expectedReturn: a.expectedReturn,
        })),
      );
      const fee = weightedAnnualFee(
        it.allocations.map((a) => ({ percentage: a.percentage, ter: a.ter })),
      );
      if (weightedR == null) return null;
      const scenarios = projectScenarios({
        initialInvestment: initial,
        monthlyContribution: monthly,
        durationYears: years,
        expectedAnnualReturn: weightedR,
        inflationRate: 0.02,
      });
      return {
        item: it,
        weightedReturn: weightedR,
        annualFee: fee,
        scenarios,
        finalRealistic: scenarios[scenarios.length - 1].realistic,
      };
    });
  }, [items, initial, monthly, years]);

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
          Add something with available return data to see a projection.
        </p>
      </section>
    );
  }

  const chartData: Record<string, string | number>[] = [];
  for (let y = 0; y <= years; y++) {
    const row: Record<string, string | number> = { year: y };
    row.contributed = initial + monthly * 12 * y;
    for (const proj of validProjections) {
      row[`p_${proj.item.id}`] = proj.scenarios[y].realistic;
    }
    chartData.push(row);
  }

  return (
    <section className="mt-10">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        How they could grow (realistic projection)
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Same starting amount and monthly top-up applied to each. Uses 75% of
        each one's historical return (haircut for realism).
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
        <ProjectionChart data={chartData} items={items} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {validProjections.map((proj) => (
          <div
            key={proj.item.id}
            className="rounded-lg border bg-white p-4 dark:bg-zinc-900"
            style={{ borderColor: proj.item.color }}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: proj.item.color }}
              />
              <span className="truncate">{proj.item.name}</span>
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
  items,
}: {
  data: Record<string, string | number>[];
  items: ResolvedItem[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
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
                {items.map((it) => {
                  const v = row[`p_${it.id}`];
                  if (typeof v !== "number") return null;
                  return (
                    <div key={it.id} className="mt-1 flex items-center gap-2">
                      <span
                        className="inline-block h-1.5 w-3 rounded-sm"
                        style={{ backgroundColor: it.color }}
                      />
                      <span className="max-w-[160px] truncate text-zinc-700 dark:text-zinc-300">
                        {it.name}
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
        {items.map((it) => (
          <Line
            key={it.id}
            type="monotone"
            dataKey={`p_${it.id}`}
            stroke={it.color}
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
            const it = items.find((x) => x.id === id);
            return it?.name ?? val;
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
}: {
  label: string;
  value: number;
  color: string;
}) {
  const pct = value * 100;
  const sign = pct >= 0 ? "+" : "";
  const cls =
    pct >= 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";
  return (
    <div
      className="rounded-lg border bg-white px-4 py-3 dark:bg-zinc-900"
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        <span
          className="inline-block h-2 w-2 shrink-0 rounded-full"
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
