"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Download, Plus, Trash2, Upload, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  listPortfolios,
  createPortfolio,
  deletePortfolio,
  duplicatePortfolio,
  exportPortfoliosJson,
  parseBackup,
  restorePortfolios,
  type StoredPortfolio,
} from "@/lib/storage/portfolios";
import {
  allocationKind,
  composition,
  resolveLeaves,
} from "@/lib/portfolio/composition";

type ImportState =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | {
      kind: "confirm";
      filename: string;
      portfolios: StoredPortfolio[];
      fileCount: number;
      currentCount: number;
    }
  | { kind: "done"; message: string };

export function PortfoliosIndex() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<StoredPortfolio[] | null>(null);
  const [importState, setImportState] = useState<ImportState>({ kind: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPortfolios(listPortfolios());
  }, []);

  function refresh() {
    setPortfolios(listPortfolios());
  }

  function handleCreate() {
    const created = createPortfolio();
    router.push(`/portfolios/${created.id}`);
  }

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    deletePortfolio(id);
    refresh();
  }

  function handleDuplicate(id: string) {
    const copy = duplicatePortfolio(id);
    if (copy) router.push(`/portfolios/${copy.id}`);
  }

  function handleExport() {
    const json = exportPortfoliosJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const today = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `etf-portfolios-${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so the same file can be re-selected
    if (!file) return;
    try {
      const text = await file.text();
      const { portfolios: imported, preview } = parseBackup(text);
      setImportState({
        kind: "confirm",
        filename: file.name,
        portfolios: imported,
        fileCount: preview.fileCount,
        currentCount: preview.currentCount,
      });
    } catch (err) {
      setImportState({
        kind: "error",
        message: (err as Error).message,
      });
    }
  }

  function confirmRestore() {
    if (importState.kind !== "confirm") return;
    restorePortfolios(importState.portfolios);
    setImportState({
      kind: "done",
      message: `Restored ${importState.portfolios.length} portfolio${importState.portfolios.length === 1 ? "" : "s"} from backup.`,
    });
    refresh();
    setTimeout(() => setImportState({ kind: "idle" }), 3500);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your portfolios</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Build a strategy by mixing funds — then simulate how it could grow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            title="Restore portfolios from a backup file"
          >
            <Upload className="h-3.5 w-3.5" />
            Import
          </button>
          <button
            onClick={handleExport}
            disabled={!portfolios || portfolios.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            title="Download all portfolios as a JSON backup file"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            New portfolio
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImportFile}
        className="hidden"
      />

      {importState.kind === "confirm" && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
          <div className="text-sm font-medium text-amber-900 dark:text-amber-200">
            Restore from {importState.filename}?
          </div>
          <div className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            This will <strong>replace</strong> your {importState.currentCount}{" "}
            current portfolio{importState.currentCount === 1 ? "" : "s"} with{" "}
            {importState.fileCount} from the file. This can't be undone.
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={confirmRestore}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Replace {importState.currentCount} → {importState.fileCount}
            </button>
            <button
              onClick={() => setImportState({ kind: "idle" })}
              className="rounded-md border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {importState.kind === "error" && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          <span>{importState.message}</span>
          <button
            onClick={() => setImportState({ kind: "idle" })}
            className="text-xs font-medium underline-offset-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {importState.kind === "done" && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          {importState.message}
        </div>
      )}

      {portfolios === null ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          Loading…
        </div>
      ) : portfolios.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <Wallet className="mx-auto h-10 w-10 text-zinc-400" />
          <h2 className="mt-3 text-base font-medium text-zinc-900 dark:text-zinc-100">
            No portfolios yet
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Portfolios live in your browser — only you can see them.
          </p>
          <button
            onClick={handleCreate}
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            <Plus className="h-4 w-4" />
            Create your first portfolio
          </button>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {(() => {
            const byId = new Map(portfolios.map((p) => [p.id, p]));
            const getById = (id: string) => byId.get(id) ?? null;
            return portfolios.map((p) => {
              // Top-level make-up
              let funds = 0;
              let stocks = 0;
              let nested = 0;
              for (const a of p.allocations) {
                const k = allocationKind(a);
                if (k === "etf") funds++;
                else if (k === "stock") stocks++;
                else if (k === "portfolio") nested++;
              }
              const holdingParts: string[] = [];
              if (funds > 0) holdingParts.push(`${funds} fund${funds === 1 ? "" : "s"}`);
              if (stocks > 0) holdingParts.push(`${stocks} stock${stocks === 1 ? "" : "s"}`);
              if (nested > 0)
                holdingParts.push(`${nested} portfolio${nested === 1 ? "" : "s"}`);
              if (holdingParts.length === 0) holdingParts.push("empty");
              // Flattened ETF vs stock split (nested portfolios expanded)
              const comp = composition(resolveLeaves(p.allocations, getById));
              const etfPct = Math.round(comp.etf * 100);
              const stockPct = Math.round(comp.stock * 100);
              return (
            <li
              key={p.id}
              className="group flex items-center gap-4 border-b border-zinc-100 px-6 py-4 last:border-b-0 dark:border-zinc-800"
            >
              <Link href={`/portfolios/${p.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
                    {p.name}
                  </span>
                  {etfPct > 0 && (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                      {etfPct}% funds
                    </span>
                  )}
                  {stockPct > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      {stockPct}% stocks
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{holdingParts.join(" · ")}</span>
                  <span>·</span>
                  <span>{p.durationYears}-year horizon</span>
                  {p.description && (
                    <>
                      <span>·</span>
                      <span className="truncate">{p.description}</span>
                    </>
                  )}
                </div>
              </Link>
              <button
                onClick={() => handleDuplicate(p.id)}
                className="rounded-md p-2 text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-zinc-700 group-hover:opacity-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                aria-label={`Duplicate ${p.name}`}
                title="Duplicate portfolio"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(p.id, p.name)}
                className="rounded-md p-2 text-zinc-400 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                aria-label={`Delete ${p.name}`}
                title="Delete portfolio"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
              );
            });
          })()}
        </ul>
      )}

      {portfolios && portfolios.length > 0 && (
        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Saved to this browser only. Use <strong>Export</strong> to back up,
          or to move them to another device.
        </p>
      )}
    </div>
  );
}
