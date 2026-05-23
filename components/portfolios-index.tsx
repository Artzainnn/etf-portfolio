"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Wallet } from "lucide-react";
import { useState } from "react";

interface PortfolioRow {
  id: number;
  name: string;
  description: string | null;
  durationYears: number | null;
  initialInvestment: string | null;
  monthlyContribution: string | null;
  allocationCount: number;
  updatedAt: Date;
}

export function PortfoliosIndex({ portfolios }: { portfolios: PortfolioRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/portfolios", { method: "POST", body: "{}" });
      const json = await res.json();
      if (res.ok && json.id) {
        router.push(`/portfolios/${json.id}`);
      } else {
        alert("Couldn't create portfolio.");
        setCreating(false);
      }
    } catch (e) {
      console.error(e);
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (
      !window.confirm(
        "Delete this portfolio? This can't be undone.",
      )
    )
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/portfolios/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
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
          disabled={creating}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          {creating ? "Creating…" : "New portfolio"}
        </button>
      </div>

      {portfolios.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <Wallet className="mx-auto h-10 w-10 text-zinc-400" />
          <h2 className="mt-3 text-base font-medium text-zinc-900 dark:text-zinc-100">
            No portfolios yet
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Create your first portfolio to start building an allocation and simulating returns.
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
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
              <Link
                href={`/portfolios/${p.id}`}
                className="min-w-0 flex-1"
              >
                <div className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
                  {p.name}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {p.allocationCount} fund
                    {p.allocationCount === 1 ? "" : "s"}
                  </span>
                  {p.durationYears && (
                    <>
                      <span>·</span>
                      <span>{p.durationYears}-year horizon</span>
                    </>
                  )}
                  {p.description && (
                    <>
                      <span>·</span>
                      <span className="truncate">{p.description}</span>
                    </>
                  )}
                </div>
              </Link>
              <button
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
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
    </div>
  );
}
