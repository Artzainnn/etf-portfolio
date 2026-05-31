"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Star } from "lucide-react";
import { PriceChart, type PriceStats, type Period } from "./price-chart";
import { PeriodStats } from "./period-stats";
import { Sparkline } from "./sparkline";
import { RiskBars } from "./risk-bars";
import { isFavorite, toggleFavorite } from "@/lib/storage/favorites";
import type { EtfWithPeriodData, PeriodKey } from "@/lib/data/etfs";
import { CompareSelect } from "./compare-select";
import { DEFAULT_COMPARE_TICKER } from "@/lib/data/benchmarks";
import { getEtfEmoji } from "@/lib/data/emoji";

function annualFeeLabel(ter: string | null): string {
  if (!ter) return "—";
  const pct = parseFloat(ter) * 100;
  return `${pct.toFixed(2)}%`;
}

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

function dividendInfo(isAcc: boolean | null): {
  label: string;
  technical: string;
  icon: string;
} | null {
  if (isAcc === true) return { label: "Reinvested", technical: "Accumulating", icon: "🔁" };
  if (isAcc === false) return { label: "Paid out", technical: "Distributing", icon: "💵" };
  return null;
}

export function EtfRow({
  etf,
  previewPeriod = "1Y",
}: {
  etf: EtfWithPeriodData;
  previewPeriod?: PeriodKey;
}) {
  const [expanded, setExpanded] = useState(false);
  const [period, setPeriod] = useState<Period>("1Y");
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [fav, setFav] = useState(false);
  const [compare, setCompare] = useState<string>(
    etf.ticker === DEFAULT_COMPARE_TICKER ? "" : DEFAULT_COMPARE_TICKER,
  );
  const emoji = getEtfEmoji(etf.ticker);
  const sparkData = etf.periodSparklines?.[previewPeriod] ?? null;
  const periodReturn = etf.periodReturns?.[previewPeriod] ?? null;
  const retInfo = formatReturnNumber(periodReturn);
  const divInfo = dividendInfo(etf.isAccumulating);

  useEffect(() => {
    setFav(isFavorite(etf.ticker));
    function onChange() {
      setFav(isFavorite(etf.ticker));
    }
    window.addEventListener("etfp:favorites-changed", onChange);
    return () => window.removeEventListener("etfp:favorites-changed", onChange);
  }, [etf.ticker]);

  function handleToggleFav(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const now = toggleFavorite(etf.ticker);
    setFav(now);
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

        {/* Name + description */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[15px] font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
            <span className="shrink-0 text-lg leading-none" aria-hidden>
              {emoji}
            </span>
            <span className="truncate">{etf.friendlyName ?? etf.name}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-tight text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {etf.ticker}
            </span>
            {etf.friendlyName && etf.friendlyName !== etf.name && (
              <span className="truncate">{etf.name}</span>
            )}
          </div>
          {etf.shortDescription && (
            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {etf.shortDescription}
            </p>
          )}
        </div>

        {/* Sparkline */}
        {sparkData && sparkData.length >= 2 ? (
          <div className="hidden shrink-0 sm:block">
            <Sparkline data={sparkData} width={100} height={32} />
          </div>
        ) : (
          <div className="hidden h-8 w-[100px] shrink-0 sm:block" />
        )}

        {/* Period return */}
        <div className="hidden w-[68px] shrink-0 text-right sm:block">
          <div className={`text-sm font-semibold tabular-nums ${retCls}`}>
            {retInfo.text}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {PERIOD_SHORT_LABEL[previewPeriod]}
          </div>
        </div>

        {/* Risk bars */}
        <div className="hidden w-7 shrink-0 items-center justify-center md:flex">
          <RiskBars score={etf.riskScore} />
        </div>

        {/* Dividends */}
        <div
          className="hidden w-[78px] shrink-0 text-center md:block"
          title={
            divInfo
              ? `${divInfo.label} (${divInfo.technical})`
              : "No dividends (n/a)"
          }
        >
          {divInfo ? (
            <>
              <div className="text-xs text-zinc-700 dark:text-zinc-300">
                <span aria-hidden className="mr-1">
                  {divInfo.icon}
                </span>
                {divInfo.label}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                dividends
              </div>
            </>
          ) : (
            <>
              <div className="text-xs text-zinc-400 dark:text-zinc-500">—</div>
              <div className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                dividends
              </div>
            </>
          )}
        </div>

        {/* Fee */}
        <div className="hidden w-[58px] shrink-0 text-right md:block">
          <div className="text-xs tabular-nums text-zinc-700 dark:text-zinc-300">
            {annualFeeLabel(etf.ter)}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            fee/yr
          </div>
        </div>

        {/* Favorite */}
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
          {/* Official fund name (revealed on expand) */}
          <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
            <span className="font-medium text-zinc-600 dark:text-zinc-400">
              {etf.name}
            </span>
            <span className="font-mono text-zinc-400 dark:text-zinc-500">
              {etf.ticker}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_200px]">
            <PriceChart
              ticker={etf.ticker}
              period={period}
              variant="compact"
              compareTicker={compare}
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
                  excludeTicker={etf.ticker}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <PeriodStats period={period} stats={stats} size="compact" />
          </div>

          {/* Pros & Cons */}
          {(etf.pros?.length || etf.cons?.length) ? (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {etf.pros && etf.pros.length > 0 && (
                <div>
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    What's good
                  </div>
                  <ul className="space-y-1.5">
                    {etf.pros.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300"
                      >
                        <span className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden>
                          ✓
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {etf.cons && etf.cons.length > 0 && (
                <div>
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
                    Watch out for
                  </div>
                  <ul className="space-y-1.5">
                    {etf.cons.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300"
                      >
                        <span className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden>
                          ✕
                        </span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          <div className="mt-5">
            <Link
              href={`/etfs/${encodeURIComponent(etf.ticker)}`}
              className="text-xs font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              See all details →
            </Link>
          </div>
        </div>
      )}
    </li>
  );
}
