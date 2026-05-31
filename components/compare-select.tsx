"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import {
  COMPARE_OPTIONS,
  getCompareMeta,
  type CompareGroup,
  type CompareOption,
} from "@/lib/data/compare";

/**
 * Searchable "Compare with" picker. Overlay anything that has a price
 * series — curated benchmarks, any ETF, or any individual stock — onto a
 * chart. Type to filter across all of them.
 */
export function CompareSelect({
  value,
  onChange,
  excludeTicker,
  className = "",
}: {
  value: string;
  onChange: (ticker: string) => void;
  excludeTicker?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
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

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const order: CompareGroup[] = ["Benchmarks", "Funds", "Stocks"];
    const buckets: Record<CompareGroup, CompareOption[]> = {
      Benchmarks: [],
      Funds: [],
      Stocks: [],
    };
    for (const o of COMPARE_OPTIONS) {
      if (o.ticker === excludeTicker) continue;
      if (q && !o.haystack.includes(q)) continue;
      const bucket = buckets[o.group];
      if (bucket.length < 50) bucket.push(o);
    }
    return order
      .map((g) => ({ group: g, items: buckets[g] }))
      .filter((b) => b.items.length > 0);
  }, [query, excludeTicker]);

  const selected = value ? getCompareMeta(value) : null;
  const triggerLabel = value ? (selected?.label ?? value) : "Off";
  const triggerEmoji = selected?.emoji ?? "";

  function pick(ticker: string) {
    onChange(ticker);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-1.5 rounded-md border border-zinc-300 bg-white py-1 pl-2 pr-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:ring-zinc-700"
      >
        <span className="truncate">
          {triggerEmoji && <span className="mr-1">{triggerEmoji}</span>}
          {triggerLabel}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-64 max-w-[80vw] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <div className="relative border-b border-zinc-100 p-2 dark:border-zinc-800">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search funds, stocks, benchmarks…"
              className="w-full rounded-md border border-zinc-300 bg-white py-1.5 pl-8 pr-2 text-xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <ul
            role="listbox"
            className="max-h-72 overflow-y-auto py-1 text-xs"
          >
            {/* Off / clear */}
            <li>
              <button
                type="button"
                onClick={() => pick("")}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                  value === "" ? "font-semibold text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-300"
                }`}
              >
                <X className="h-3.5 w-3.5 text-zinc-400" />
                Off (no comparison)
              </button>
            </li>

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
                      <li key={o.ticker}>
                        <button
                          type="button"
                          onClick={() => pick(o.ticker)}
                          className={`flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                            value === o.ticker
                              ? "bg-zinc-50 font-semibold text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-100"
                              : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <span className="w-4 shrink-0 text-center" aria-hidden>
                            {o.emoji}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{o.label}</span>
                          <span className="shrink-0 font-mono text-[10px] text-zinc-400">
                            {o.ticker}
                          </span>
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
