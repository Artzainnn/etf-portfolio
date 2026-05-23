"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import {
  listPortfolios,
  createPortfolio,
  deletePortfolio,
  type StoredPortfolio,
} from "@/lib/storage/portfolios";

export function PortfoliosIndex() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<StoredPortfolio[] | null>(null);

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

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your portfolios</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Build a strategy by mixing funds — then simulate how it could grow.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          New portfolio
        </button>
      </div>

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
          {portfolios.map((p) => (
            <li
              key={p.id}
              className="group flex items-center gap-4 border-b border-zinc-100 px-6 py-4 last:border-b-0 dark:border-zinc-800"
            >
              <Link href={`/portfolios/${p.id}`} className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
                  {p.name}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {p.allocations.length} fund
                    {p.allocations.length === 1 ? "" : "s"}
                  </span>
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
                onClick={() => handleDelete(p.id, p.name)}
                className="rounded-md p-2 text-zinc-400 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                aria-label={`Delete ${p.name}`}
                title="Delete portfolio"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {portfolios && portfolios.length > 0 && (
        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Portfolios are saved to this browser only. Clearing site data will erase them.
        </p>
      )}
    </div>
  );
}
