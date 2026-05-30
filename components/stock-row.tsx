"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import {
  PriceChart,
  type PriceStats,
  type Period,
} from "./price-chart";
import { PeriodStats } from "./period-stats";
import { Sparkline } from "./sparkline";
import { CompareSelect } from "./compare-select";
import { DEFAULT_COMPARE_TICKER } from "@/lib/data/benchmarks";
import { isFavorite, toggleFavorite } from "@/lib/storage/favorites";
import type { Stock, PeriodKey } from "@/lib/data/stocks";
import { flagFor } from "@/lib/data/stocks";
import { INDUSTRY_LOOKUP } from "@/lib/data/stock-industries";
import { StockLogo } from "./stock-logo";

function formatReturnNumber(pct: number | null | undefined): {
  text: string;
  positive: boolean | null;
} {
  if (pct == null || !isFinite(pct)) return { text: "—", positive: null };
  const v = pct * 100;
  return {
    text: `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`,
    positive: v >= 0,
  };
}

const PERIOD_SHORT_LABEL: Record<PeriodKey, string> = {
  "1M": "past 1M",
  "3M": "past 3M",
  "6M": "past 6M",
  "1Y": "past 1Y",
  "3Y": "past 3Y",
  "5Y": "past 5Y",
  Max: "all-time",
};

const PERIODS: Period[] = ["1M", "3M", "6M", "1Y", "3Y", "5Y", "Max"];

export function StockRow({
  stock,
  previewPeriod = "1Y",
}: {
  stock: Stock;
  previewPeriod?: PeriodKey;
}) {
  const [expanded, setExpanded] = useState(false);
  const [period, setPeriod] = useState<Period>("1Y");
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [fav, setFav] = useState(false);
  const [compare, setCompare] = useState<string>(
    stock.ticker === DEFAULT_COMPARE_TICKER ? "" : DEFAULT_COMPARE_TICKER,
  );

  // Leading emoji = stock-specific override OR first industry's emoji (so it
  // always conveys "what this is"). The country flag goes on the meta line below.
  const primaryIndustry = stock.industries[0];
  const primaryIndustryMeta = primaryIndustry
    ? INDUSTRY_LOOKUP.get(primaryIndustry)
    : null;
  const emoji =
    stock.emoji ?? primaryIndustryMeta?.emoji ?? flagFor(stock.country);
  const sparkData = stock.periodSparklines?.[previewPeriod] ?? null;
  const periodReturn = stock.periodReturns?.[previewPeriod] ?? null;
  const retInfo = formatReturnNumber(periodReturn);

  useEffect(() => {
    setFav(isFavorite(stock.ticker));
    function onChange() {
      setFav(isFavorite(stock.ticker));
    }
    window.addEventListener("etfp:favorites-changed", onChange);
    return () => window.removeEventListener("etfp:favorites-changed", onChange);
  }, [stock.ticker]);

  function handleToggleFav(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setFav(toggleFavorite(stock.ticker));
  }

  const retCls =
    retInfo.positive == null
      ? "text-zinc-400 dark:text-zinc-500"
      : retInfo.positive
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-rose-600 dark:text-rose-400";

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        className="flex w-full cursor-pointer items-center gap-5 px-6 py-5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
        aria-expanded={expanded}
      >
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 text-[15px] font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
            <StockLogo ticker={stock.ticker} fallbackEmoji={emoji} size={20} />
            <span className="truncate">{stock.friendlyName}</span>
            <span className="shrink-0 font-mono text-[11px] font-normal text-zinc-400">
              {stock.ticker}
            </span>
          </div>
          {/* Country + industries meta line — more breathing room from the title */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>{flagFor(stock.country)}</span>
              <span className="font-medium">{stock.country}</span>
            </span>
            {stock.industries.map((ind) => {
              const meta = INDUSTRY_LOOKUP.get(ind);
              if (!meta) return null;
              return (
                <span
                  key={ind}
                  className="inline-flex items-center gap-1 before:mr-1 before:text-zinc-300 before:content-['·'] dark:before:text-zinc-700"
                >
                  <span aria-hidden>{meta.emoji}</span>
                  <span>{meta.label}</span>
                </span>
              );
            })}
          </div>
          {stock.shortDescription && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {stock.shortDescription}
            </p>
          )}
        </div>

        {sparkData && sparkData.length >= 2 ? (
          <div className="hidden shrink-0 sm:block">
            <Sparkline data={sparkData} width={100} height={32} />
          </div>
        ) : (
          <div className="hidden h-8 w-[100px] shrink-0 sm:block" />
        )}

        <div className="hidden w-[68px] shrink-0 text-right sm:block">
          <div className={`text-sm font-semibold tabular-nums ${retCls}`}>
            {retInfo.text}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {PERIOD_SHORT_LABEL[previewPeriod]}
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleFav}
          className={`shrink-0 rounded-md p-1.5 transition-colors ${
            fav
              ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              : "text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500 dark:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-400"
          }`}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={fav}
          title={fav ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className="h-4 w-4" fill={fav ? "currentColor" : "none"} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-zinc-100 bg-zinc-50/70 px-6 pb-6 pt-5 dark:border-zinc-800 dark:bg-zinc-950/40">
          {/* Header in expanded view */}
          <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
            <span className="font-medium text-zinc-600 dark:text-zinc-400">
              {stock.name}
            </span>
            <span className="font-mono text-zinc-400 dark:text-zinc-500">
              {stock.ticker}
            </span>
            <span className="text-zinc-400 dark:text-zinc-500">
              · {flagFor(stock.country)} {stock.nativeCurrency}
            </span>
          </div>

          {/* Industry chips */}
          {stock.industries.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {stock.industries.map((ind) => {
                const meta = INDUSTRY_LOOKUP.get(ind);
                if (!meta) return null;
                return (
                  <span
                    key={ind}
                    className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    <span aria-hidden>{meta.emoji}</span>
                    {meta.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Chart + controls — right column wider so 'S&P 500 (US)' isn't truncated */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_200px]">
            <PriceChart
              ticker={stock.ticker}
              period={period}
              variant="compact"
              compareTicker={compare}
              mainName={stock.friendlyName}
              mainEmoji={emoji}
              onStats={setStats}
            />

            <div className="space-y-3">
              <div>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
                          : "text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      }`}
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
                  excludeTicker={stock.ticker}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <PeriodStats period={period} stats={stats} size="compact" />
          </div>
        </div>
      )}
    </li>
  );
}
