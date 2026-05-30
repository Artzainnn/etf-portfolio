"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import type { Etf } from "@/lib/db/schema";
import {
  getPortfolio,
  updatePortfolio,
  deletePortfolio,
  type StoredPortfolio,
} from "@/lib/storage/portfolios";
import { getEtfEmoji } from "@/lib/data/emoji";
import { listFavorites } from "@/lib/storage/favorites";
import { SimulatorPanel } from "./simulator-panel";
import { PortfolioBacktest } from "./portfolio-backtest";
import { weightedAnnualFee } from "@/lib/simulation/calculator";

interface AllocationState {
  ticker: string;
  emoji: string;
  friendlyName: string;
  name: string;
  riskScore: number | null;
  percentage: number;
  expectedReturn: number | null;
  /** Annual fee as decimal (e.g. 0.0025 = 0.25%/year). */
  ter: number | null;
}

function bestExpectedReturn(etf: {
  return5YAnnualized: string | null;
  return3YAnnualized: string | null;
  return1Y: string | null;
}): number | null {
  if (etf.return5YAnnualized) {
    const v = parseFloat(etf.return5YAnnualized);
    if (isFinite(v)) return v;
  }
  if (etf.return3YAnnualized) {
    const v = parseFloat(etf.return3YAnnualized);
    if (isFinite(v)) return v;
  }
  if (etf.return1Y) {
    const v = parseFloat(etf.return1Y);
    if (isFinite(v)) return v;
  }
  return null;
}

function allocationStateFor(etf: Etf, percentage: number): AllocationState {
  return {
    ticker: etf.ticker,
    emoji: getEtfEmoji(etf.ticker),
    friendlyName: etf.friendlyName ?? etf.name,
    name: etf.name,
    riskScore: etf.riskScore,
    percentage,
    expectedReturn: bestExpectedReturn(etf),
    ter: etf.ter ? parseFloat(etf.ter) : null,
  };
}

export function PortfolioEditor({
  portfolioId,
  allEtfs,
}: {
  portfolioId: string;
  allEtfs: Etf[];
}) {
  const router = useRouter();
  const etfsByTicker = useMemo(
    () => new Map(allEtfs.map((e) => [e.ticker, e])),
    [allEtfs],
  );

  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [initialInvestment, setInitialInvestment] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(5000);
  const [durationYears, setDurationYears] = useState(10);
  const [inflationRate, setInflationRate] = useState(0.02);
  const [allocations, setAllocations] = useState<AllocationState[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Hydrate state from localStorage on mount
  useEffect(() => {
    const stored = getPortfolio(portfolioId);
    if (!stored) {
      setMissing(true);
      setLoaded(true);
      return;
    }
    setName(stored.name);
    setDescription(stored.description ?? "");
    setInitialInvestment(stored.initialInvestment);
    setMonthlyContribution(stored.monthlyContribution);
    setDurationYears(stored.durationYears);
    setInflationRate(stored.inflationRate);
    setAllocations(
      stored.allocations
        .map((a) => {
          if (!a.ticker) return null;
          const etf = etfsByTicker.get(a.ticker);
          if (!etf) return null;
          return allocationStateFor(etf, a.percentage);
        })
        .filter((a): a is AllocationState => a !== null),
    );
    setLoaded(true);
  }, [portfolioId, etfsByTicker]);

  // Auto-save (debounced 500ms)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const skipFirstSaveRef = useRef(true);
  useEffect(() => {
    if (!loaded || missing) return;
    if (skipFirstSaveRef.current) {
      skipFirstSaveRef.current = false;
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    saveTimerRef.current = setTimeout(() => {
      try {
        updatePortfolio(portfolioId, {
          name,
          description: description.trim() === "" ? null : description,
          initialInvestment,
          monthlyContribution,
          durationYears,
          inflationRate,
          allocations: allocations.map((a) => ({
            ticker: a.ticker,
            percentage: a.percentage,
          })),
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1200);
      } catch {
        setSaveStatus("error");
      }
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    loaded,
    missing,
    portfolioId,
    name,
    description,
    initialInvestment,
    monthlyContribution,
    durationYears,
    inflationRate,
    allocations,
  ]);

  const totalAllocation = allocations.reduce((s, a) => s + a.percentage, 0);
  const inRange = totalAllocation >= 99 && totalAllocation <= 101;

  const setAllocationPct = useCallback((ticker: string, pct: number) => {
    setAllocations((prev) =>
      prev.map((a) =>
        a.ticker === ticker
          ? { ...a, percentage: Math.max(0, Math.min(100, pct)) }
          : a,
      ),
    );
  }, []);

  const removeAllocation = useCallback((ticker: string) => {
    setAllocations((prev) => prev.filter((a) => a.ticker !== ticker));
  }, []);

  const addAllocation = useCallback((etf: Etf) => {
    setAllocations((prev) => {
      if (prev.some((a) => a.ticker === etf.ticker)) return prev;
      const defaultPct = prev.length === 0 ? 100 : 10;
      return [...prev, allocationStateFor(etf, defaultPct)];
    });
  }, []);

  const equalize = useCallback(() => {
    if (allocations.length === 0) return;
    const each = +(100 / allocations.length).toFixed(2);
    setAllocations((prev) => prev.map((a) => ({ ...a, percentage: each })));
  }, [allocations.length]);

  const rebalanceTo100 = useCallback(() => {
    if (totalAllocation === 0) return;
    const factor = 100 / totalAllocation;
    setAllocations((prev) =>
      prev.map((a) => ({
        ...a,
        percentage: +(a.percentage * factor).toFixed(2),
      })),
    );
  }, [totalAllocation]);

  function handleDelete() {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    deletePortfolio(portfolioId);
    router.push("/portfolios");
  }

  // ─── Copy as markdown ────────────────────────────────────────────
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  function buildCopyText(): string {
    const fmtSgd = (v: number) =>
      `S$${v.toLocaleString("en-SG", { maximumFractionDigits: 0 })}`;
    const lines: string[] = [];
    lines.push(`**${name}**`);
    if (description.trim()) lines.push(description.trim());
    lines.push("");
    lines.push(
      `${fmtSgd(initialInvestment)} initial · ${fmtSgd(monthlyContribution)}/month · ${durationYears} years`,
    );
    lines.push("");
    if (allocations.length === 0) {
      lines.push("_(no funds added yet)_");
    } else {
      lines.push("| Fund | Ticker | Allocation |");
      lines.push("|---|---|---|");
      for (const a of allocations) {
        lines.push(
          `| ${a.emoji} ${a.friendlyName} | ${a.ticker} | ${a.percentage}% |`,
        );
      }
      lines.push("");
      lines.push(`**Total:** ${totalAllocation.toFixed(1)}%`);
    }
    return lines.join("\n");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildCopyText());
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (e) {
      console.error("Clipboard write failed:", e);
    }
  }

  if (!loaded) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  if (missing) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Portfolio not found</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This portfolio doesn't exist on this browser. It may have been created
          on another device.
        </p>
        <Link
          href="/portfolios"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to portfolios
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/portfolios"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          All portfolios
        </Link>
        <div className="flex items-center gap-3">
          <SaveStatusBadge status={saveStatus} />
          <button
            onClick={handleCopy}
            disabled={allocations.length === 0}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              copyStatus === "copied"
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
            title="Copy portfolio as a markdown table"
          >
            {copyStatus === "copied" ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Portfolio name"
          className="w-full bg-transparent text-3xl font-bold tracking-tight text-zinc-900 placeholder:text-zinc-300 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-700"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a short description (optional)…"
          className="mt-2 w-full bg-transparent text-sm text-zinc-600 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-400 dark:placeholder:text-zinc-600"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              What you own
            </h2>
            <div className="flex items-center gap-2 text-xs">
              {allocations.length > 1 && (
                <button
                  onClick={equalize}
                  className="rounded-md px-2 py-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Split equally
                </button>
              )}
              {allocations.length > 0 && !inRange && (
                <button
                  onClick={rebalanceTo100}
                  className="rounded-md px-2 py-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Rebalance to 100%
                </button>
              )}
            </div>
          </div>

          {allocations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No funds yet. Add at least one to start simulating.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {allocations.map((a) => (
                <AllocationRow
                  key={a.ticker}
                  allocation={a}
                  onChange={(pct) => setAllocationPct(a.ticker, pct)}
                  onRemove={() => removeAllocation(a.ticker)}
                />
              ))}
            </ul>
          )}

          <AddEtfPicker
            allEtfs={allEtfs}
            selectedTickers={new Set(allocations.map((a) => a.ticker))}
            onAdd={addAllocation}
          />

          {allocations.length > 0 && (
            <div
              className={`mt-4 flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm ${
                inRange
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
              }`}
            >
              <span className="font-medium">
                Total: {totalAllocation.toFixed(1)}%
              </span>
              <span className="text-xs">
                {inRange
                  ? "Looks good — adds up to 100%"
                  : "Should add up to 100% for an accurate simulation"}
              </span>
            </div>
          )}

          {/* Weighted fee summary */}
          {allocations.length > 0 &&
            (() => {
              const avgFee = weightedAnnualFee(
                allocations.map((a) => ({
                  percentage: a.percentage,
                  ter: a.ter,
                })),
              );
              if (avgFee == null) return null;
              const feePct = avgFee * 100;
              const yearlyOnStart =
                initialInvestment > 0 ? initialInvestment * avgFee : 0;
              const fmt = (v: number) =>
                v
                  .toLocaleString("en-SG", {
                    style: "currency",
                    currency: "SGD",
                    maximumFractionDigits: 0,
                  })
                  .replace("$", "S$");
              return (
                <div className="mt-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Average annual fee
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                      {feePct.toFixed(2)}%
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Weighted across your funds. On your starting amount that's
                    roughly{" "}
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {fmt(yearlyOnStart)}
                    </span>{" "}
                    per year (grows as the portfolio grows).
                  </p>
                  {/* Per-fund breakdown */}
                  <div className="mt-3 space-y-1 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                    {allocations
                      .filter((a) => a.percentage > 0)
                      .map((a) => (
                        <div
                          key={a.ticker}
                          className="flex items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400"
                        >
                          <span className="truncate">
                            <span aria-hidden className="mr-1">
                              {a.emoji}
                            </span>
                            {a.friendlyName}
                          </span>
                          <span className="tabular-nums">
                            {a.ter != null
                              ? `${(a.ter * 100).toFixed(2)}%`
                              : "—"}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })()}
        </section>

        <section>
          <SimulatorPanel
            allocations={allocations}
            initialInvestment={initialInvestment}
            monthlyContribution={monthlyContribution}
            durationYears={durationYears}
            inflationRate={inflationRate}
            onInitialChange={setInitialInvestment}
            onMonthlyChange={setMonthlyContribution}
            onDurationChange={setDurationYears}
            onInflationChange={setInflationRate}
          />
        </section>
      </div>

      {/* Historical backtest */}
      <PortfolioBacktest
        allocations={allocations.map((a) => ({
          ticker: a.ticker,
          friendlyName: a.friendlyName,
          percentage: a.percentage,
        }))}
      />
    </div>
  );
}

function SaveStatusBadge({
  status,
}: {
  status: "idle" | "saving" | "saved" | "error";
}) {
  if (status === "idle") return <span className="w-0" />;
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
        <Check className="h-3.5 w-3.5" />
        Saved
      </span>
    );
  }
  return (
    <span className="text-xs text-rose-600 dark:text-rose-400">
      Save failed
    </span>
  );
}

function AllocationRow({
  allocation,
  onChange,
  onRemove,
}: {
  allocation: AllocationState;
  onChange: (pct: number) => void;
  onRemove: () => void;
}) {
  return (
    <li className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none" aria-hidden>
          {allocation.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {allocation.friendlyName}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-tight text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {allocation.ticker}
            </span>
            <span className="truncate">{allocation.name}</span>
          </div>
        </div>
        <input
          type="number"
          value={allocation.percentage}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={0}
          max={100}
          step={0.5}
          className="w-16 rounded-md border border-zinc-300 bg-white px-2 py-1 text-right text-sm tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
        />
        <span className="self-center text-xs text-zinc-500 dark:text-zinc-400">
          %
        </span>
        <button
          onClick={onRemove}
          className="rounded-md p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
          aria-label={`Remove ${allocation.friendlyName}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <input
        type="range"
        value={allocation.percentage}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={0}
        max={100}
        step={0.5}
        className="mt-3 w-full accent-zinc-900 dark:accent-zinc-100"
        aria-label={`Allocation for ${allocation.friendlyName}`}
      />
    </li>
  );
}

function AddEtfPicker({
  allEtfs,
  selectedTickers,
  onAdd,
}: {
  allEtfs: Etf[];
  selectedTickers: Set<string>;
  onAdd: (etf: Etf) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFavorites(new Set(listFavorites()));
    function onChange() {
      setFavorites(new Set(listFavorites()));
    }
    window.addEventListener("etfp:favorites-changed", onChange);
    return () => window.removeEventListener("etfp:favorites-changed", onChange);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allEtfs
      .filter((e) => !selectedTickers.has(e.ticker))
      .filter((e) => (favoritesOnly ? favorites.has(e.ticker) : true))
      .filter((e) => {
        if (!q) return true;
        const hay = [
          e.ticker,
          e.friendlyName,
          e.name,
          e.shortDescription,
          e.tags?.join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 50);
  }, [allEtfs, selectedTickers, query, favoritesOnly, favorites]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
      >
        <Plus className="h-4 w-4" />
        Add a fund
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <input
          type="search"
          autoFocus
          placeholder="Search by name, theme, or ticker…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          onClick={() => {
            setOpen(false);
            setQuery("");
          }}
          className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Close fund picker"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {favorites.size > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              favoritesOnly
                ? "border-amber-500 bg-amber-500 text-white"
                : "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/40"
            }`}
            aria-pressed={favoritesOnly}
          >
            <Star
              className="h-3 w-3"
              fill={favoritesOnly ? "currentColor" : "none"}
            />
            <span>Only my favorites ({favorites.size})</span>
          </button>
        </div>
      )}
      <ul className="mt-2 max-h-72 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
        {filtered.length === 0 ? (
          <li className="py-6 text-center text-xs text-zinc-500">No matches.</li>
        ) : (
          filtered.map((etf) => (
            <li key={etf.id}>
              <button
                onClick={() => {
                  onAdd(etf);
                  setQuery("");
                }}
                className="flex w-full items-center gap-3 px-2 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <span className="text-lg" aria-hidden>
                  {getEtfEmoji(etf.ticker)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {etf.friendlyName ?? etf.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono font-semibold tracking-tight text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      {etf.ticker}
                    </span>
                    <span className="truncate">{etf.name}</span>
                  </div>
                </div>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
