"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Search, Star } from "lucide-react";
import type { Etf } from "@/lib/db/schema";
import { EtfRow } from "./etf-row";
import { RiskBars } from "./risk-bars";
import { listFavorites } from "@/lib/storage/favorites";

const FRIENDLY_CATEGORIES: Record<
  string,
  { label: string; emoji: string; hint: string }
> = {
  broad_market: {
    label: "Whole world",
    emoji: "🌍",
    hint: "Big global funds covering thousands of companies",
  },
  region: {
    label: "Specific countries",
    emoji: "🗺️",
    hint: "Focused on one region (Europe, Japan, India…)",
  },
  sector: {
    label: "Industries",
    emoji: "🏭",
    hint: "Tech, healthcare, energy, etc.",
  },
  thematic: {
    label: "Trends & themes",
    emoji: "⚡",
    hint: "AI, robotics, clean energy, defence…",
  },
  bond: {
    label: "Bonds (safer)",
    emoji: "🛡️",
    hint: "Lower risk, lower expected return",
  },
  commodity: {
    label: "Gold & commodities",
    emoji: "🪙",
    hint: "Physical assets like gold",
  },
};

const RISK_BUCKETS = [
  { key: "low", label: "Low", scores: [1, 2] as number[], displayScore: 2 },
  { key: "medium", label: "Medium", scores: [3] as number[], displayScore: 3 },
  { key: "high", label: "Higher", scores: [4, 5] as number[], displayScore: 5 },
];

type SortKey = "curated" | "perf_desc" | "perf_asc" | "name" | "risk" | "fee";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "curated", label: "Curated order" },
  { key: "perf_desc", label: "Best 1-year return" },
  { key: "perf_asc", label: "Worst 1-year return" },
  { key: "name", label: "Alphabetical" },
  { key: "risk", label: "Lowest risk first" },
  { key: "fee", label: "Cheapest fee first" },
];

export function EtfsExplorer({ etfs }: { etfs: Etf[] }) {
  const [search, setSearch] = useState("");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeRisks, setActiveRisks] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>("curated");

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
    let list = etfs.filter((e) => {
      if (q) {
        const haystack = [
          e.ticker,
          e.friendlyName,
          e.name,
          e.shortDescription,
          e.tags?.join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (
        activeCategories.length > 0 &&
        !activeCategories.includes(e.category ?? "")
      ) {
        return false;
      }
      if (activeRisks.length > 0) {
        const matches = activeRisks.some((bucketKey) => {
          const bucket = RISK_BUCKETS.find((b) => b.key === bucketKey);
          return bucket?.scores.includes(e.riskScore ?? 0) ?? false;
        });
        if (!matches) return false;
      }
      if (favoritesOnly && !favorites.has(e.ticker)) return false;
      return true;
    });

    // Sorting
    const num = (v: string | null) => (v == null ? null : parseFloat(v));
    if (sort === "perf_desc" || sort === "perf_asc") {
      list = [...list].sort((a, b) => {
        const av = num(a.return1Y);
        const bv = num(b.return1Y);
        // Push null returns to the bottom regardless of direction
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        return sort === "perf_desc" ? bv - av : av - bv;
      });
    } else if (sort === "name") {
      list = [...list].sort((a, b) =>
        (a.friendlyName ?? a.name).localeCompare(b.friendlyName ?? b.name),
      );
    } else if (sort === "risk") {
      list = [...list].sort(
        (a, b) => (a.riskScore ?? 99) - (b.riskScore ?? 99),
      );
    } else if (sort === "fee") {
      list = [...list].sort(
        (a, b) => (num(a.ter) ?? 99) - (num(b.ter) ?? 99),
      );
    }
    return list;
  }, [etfs, search, activeCategories, activeRisks, sort, favoritesOnly, favorites]);

  const toggle =
    (set: string[], setSet: (v: string[]) => void) => (value: string) => {
      setSet(
        set.includes(value) ? set.filter((v) => v !== value) : [...set, value],
      );
    };

  const clearAll = () => {
    setSearch("");
    setActiveCategories([]);
    setActiveRisks([]);
    setFavoritesOnly(false);
  };

  const hasFilters =
    search !== "" ||
    activeCategories.length > 0 ||
    activeRisks.length > 0 ||
    favoritesOnly;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse funds</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {etfs.length} investment funds you can buy on Interactive Brokers
          Singapore. Click any row to see its chart.
        </p>
      </div>

      {/* Filters card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder="Search by name, theme, or ticker…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
          />
        </div>

        {/* Theme chips */}
        <div className="mt-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Theme
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(FRIENDLY_CATEGORIES).map(([key, cat]) => (
              <Chip
                key={key}
                active={activeCategories.includes(key)}
                onClick={() => toggle(activeCategories, setActiveCategories)(key)}
                title={cat.hint}
              >
                <span aria-hidden>{cat.emoji}</span>
                <span>{cat.label}</span>
              </Chip>
            ))}
          </div>
        </div>

        {/* Risk chips */}
        <div className="mt-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Risk
          </div>
          <div className="flex flex-wrap gap-2">
            {RISK_BUCKETS.map((bucket) => (
              <Chip
                key={bucket.key}
                active={activeRisks.includes(bucket.key)}
                onClick={() => toggle(activeRisks, setActiveRisks)(bucket.key)}
                variant="risk"
                riskKey={bucket.key}
              >
                <RiskBars score={bucket.displayScore} />
                <span>{bucket.label}</span>
              </Chip>
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
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Showing{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {filtered.length}
          </span>{" "}
          of {etfs.length}
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
            No funds match your filters.
            <button
              onClick={clearAll}
              className="ml-2 font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map((etf) => (
              <EtfRow key={etf.ticker} etf={etf} />
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
  title,
  variant = "default",
  riskKey,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  variant?: "default" | "risk";
  riskKey?: string;
}) {
  const riskActiveCls: Record<string, string> = {
    low: "border-emerald-500 bg-emerald-500 text-white",
    medium: "border-amber-500 bg-amber-500 text-white",
    high: "border-rose-500 bg-rose-500 text-white",
  };
  const riskInactiveCls: Record<string, string> = {
    low: "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40",
    medium:
      "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/40",
    high: "border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40",
  };

  const baseCls =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors";

  let colorCls: string;
  if (variant === "risk" && riskKey) {
    colorCls = active ? riskActiveCls[riskKey] : riskInactiveCls[riskKey];
  } else {
    colorCls = active
      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";
  }

  return (
    <button
      onClick={onClick}
      title={title}
      className={`${baseCls} ${colorCls}`}
    >
      {children}
    </button>
  );
}
