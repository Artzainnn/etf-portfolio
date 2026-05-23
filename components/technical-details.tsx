"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Etf } from "@/lib/db/schema";

/**
 * Collapsed-by-default block for the jargon-heavy fund metadata
 * (ISIN, UCITS status, domicile, exchange, etc.).
 */
export function TechnicalDetails({ etf }: { etf: Etf }) {
  const [open, setOpen] = useState(false);

  const rows: { label: string; value: string; tooltip?: string }[] = [
    {
      label: "Ticker",
      value: etf.ticker,
      tooltip: "The trading symbol used on the stock exchange.",
    },
    ...(etf.isin
      ? [
          {
            label: "ISIN",
            value: etf.isin,
            tooltip:
              "International Securities Identification Number — a unique global ID for the fund.",
          },
        ]
      : []),
    {
      label: "Fund type",
      value: etf.isUcits ? "UCITS (EU-regulated fund)" : "ETC (Exchange-Traded Commodity)",
      tooltip: etf.isUcits
        ? "UCITS = a fund regulated under EU rules. Good for non-US residents because it avoids US estate tax and reduces dividend withholding."
        : "ETC = a security backed by a physical commodity (like gold). Different legal structure from a UCITS fund.",
    },
    ...(etf.domicile
      ? [
          {
            label: "Based in",
            value: etf.domicile,
            tooltip:
              "Where the fund is legally registered. Ireland is preferred for non-US residents (15% dividend withholding tax vs 30% for US funds).",
          },
        ]
      : []),
    ...(etf.exchange
      ? [
          {
            label: "Traded on",
            value: `${etf.exchange}${etf.currency ? ` (${etf.currency})` : ""}`,
            tooltip: "The exchange where you actually buy this fund.",
          },
        ]
      : []),
    ...(etf.benchmark
      ? [
          {
            label: "Tracks",
            value: etf.benchmark,
            tooltip:
              "The index the fund is designed to mirror. Performance should closely match this benchmark minus fees.",
          },
        ]
      : []),
  ];

  return (
    <section className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Technical details
        </span>
        <ChevronDown
          className={`h-4 w-4 text-zinc-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <dl className="mt-3 divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[140px_1fr] gap-3 px-4 py-2.5 text-sm"
            >
              <dt
                className="text-zinc-500 dark:text-zinc-400"
                title={row.tooltip}
              >
                {row.label}
              </dt>
              <dd className="text-zinc-900 dark:text-zinc-100">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
