"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Search, Star } from "lucide-react";
import type { Stock, PeriodKey } from "@/lib/data/stocks";
import { StockRow } from "./stock-row";
import { INDUSTRIES } from "@/lib/data/stock-industries";
import { listFavorites } from "@/lib/storage/favorites";

type SortKey =
  | "curated"
  | "perf_desc"
  | "perf_asc"
  | "name"
  | "alphabetical";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "curated", label: "Curated order" },
  { key: "perf_desc", label: "Best return (selected period)" },
  { key: "perf_asc", label: "Worst return (selected period)" },
  { key: "alphabetical", label: "Alphabetical" },
];

const PERIODS: PeriodKey[] = ["1M", "3M", "6M", "1Y", "3Y", "5Y", "Max"];

const PERIOD_LABELS: Record<PeriodKey, string> = {
  "1M": "1 month",
  "3M": "3 months",
  "6M": "6 months",
  "1Y": "1 year",
  "3Y": "3 years",
  "5Y": "5 years",
  Max: "all-time",
};

export function StocksExplorer({ stocks }: { stocks: Stock[] }) {
  const [search, setSearch] = useState("");
  const [activeIndustries, setActiveIndustries] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>("curated");
  const [period, setPeriod] = useState<PeriodKey>("1Y");

  useEffect(() => {
    setFavorites(new Set(listFavorites()));
    function onChange() {
      setFavorites(new Set(listFavorites()));
    }
    window.addEventListener("etfp:favorites-changed", onChange);
    return () => window.removeEventListener("etfp:favorites-changed", onChange);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = stocks.filter((s) => {
      if (q) {
        const hay = [
          s.ticker,
          s.friendlyName,
          s.name,
          s.shortDescription,
          s.industries.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (activeIndustries.length > 0) {
        const match = activeIndustries.some((ind) =>
          s.industries.includes(ind),
        );
        if (!match) return false;
      }
      if (favoritesOnly && !favorites.has(s.ticker)) return false;
      return true;
    });

    if (sort === "perf_desc" || sort === "perf_asc") {
      list = [...list].sort((a, b) => {
        const av = a.periodReturns?.[period] ?? null;
        const bv = b.periodReturns?.[period] ?? null;
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        return sort === "perf_desc" ? bv - av : av - bv;
      });
    } else if (sort === "alphabetical" || sort === "name") {
      list = [...list].sort((a, b) =>
        a.friendlyName.localeCompare(b.friendlyName),
      );
    }
    return list;
  }, [stocks, search, activeIndustries, favoritesOnly, favorites, sort, period]);

  const toggle =
    (set: string[], setSet: (v: string[]) => void) => (value: string) => {
      setSet(
        set.includes(value) ? set.filter((v) => v !== value) : [...set, value],
      );
    };

  const clearAll = () => {
    setSearch("");
    setActiveIndustries([]);
    setFavoritesOnly(false);
  };

  const hasFilters =
    search !== "" || activeIndustries.length > 0 || favoritesOnly;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse stocks</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {stocks.length} individual companies you can buy on Interactive
          Brokers. Tagged by industry — most companies have multiple tags
          (e.g. Nvidia = AI + Chips).
        </p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          ⚠️ Singapore tax note: buying US stocks directly means 30% dividend
          withholding (vs 15% via UCITS ETFs). Less of an issue for low-yield
          growth names.
        </p>
      </div>

      {/* Filters card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder="Search by name, industry, or ticker…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
          />
        </div>

        {/* Industry chips */}
        <div className="mt-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Industry
          </div>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((ind) => (
              <Chip
                key={ind.key}
                active={activeIndustries.includes(ind.key)}
                onClick={() => toggle(activeIndustries, setActiveIndustries)(ind.key)}
              >
                <span aria-hidden>{ind.emoji}</span>
                <span>{ind.label}</span>
              </Chip>
            ))}
          </div>
        </div>

        {/* Performance period */}
        <div className="mt-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Performance over
          </div>
          <div className="inline-flex flex-wrap rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
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

        {/* Favorites toggle */}
        {favorites.size > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                favoritesOnly
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/40"
              }`}
              aria-pressed={favoritesOnly}
            >
              <Star
                className="h-3.5 w-3.5"
                fill={favoritesOnly ? "currentColor" : "none"}
              />
              <span>Only my favorites ({favorites.size})</span>
            </button>
          </div>
        )}
      </div>

      {/* Result count + sort */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Showing{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {filtered.length}
          </span>{" "}
          of {stocks.length}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="ml-3 text-xs font-medium text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
            >
              Clear filters
            </button>
          )}
        </div>
        <label className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Sort by</span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="appearance-none rounded-md border border-zinc-300 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus:ring-zinc-700"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            {sort === "perf_desc" ? (
              <ArrowDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
            ) : sort === "perf_asc" ? (
              <ArrowUp className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
            ) : (
              <ArrowDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500 opacity-40" />
            )}
          </div>
        </label>
      </div>

      {/* List */}
      <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No stocks match your filters.
            <button
              onClick={clearAll}
              className="ml-2 font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map((stock) => (
              <StockRow key={stock.ticker} stock={stock} previewPeriod={period} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const cls = active
    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${cls}`}
    >
      {children}
    </button>
  );
}
