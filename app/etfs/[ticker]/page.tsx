import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getEtfByTicker } from "@/lib/data/etfs";
import { getEtfEmoji } from "@/lib/data/emoji";
import { EtfDetailChart } from "@/components/etf-detail-chart";
import { TechnicalDetails } from "@/components/technical-details";

export const dynamic = "force-dynamic";

function annualFeeLabel(ter: string | null): string {
  if (!ter) return "—";
  const pct = parseFloat(ter) * 100;
  return `${pct.toFixed(2)}% per year`;
}

function riskWord(score: number | null): string {
  if (score == null) return "Unknown";
  if (score <= 2) return "Low";
  if (score === 3) return "Medium";
  return "Higher";
}

function dividendBehaviour(isAcc: boolean | null): string {
  if (isAcc === true) return "Reinvested automatically";
  if (isAcc === false) return "Paid out as cash";
  return "—";
}

export default async function EtfDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const decodedTicker = decodeURIComponent(ticker);
  const etf = await getEtfByTicker(decodedTicker);

  if (!etf) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/etfs"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all funds
      </Link>

      <h1 className="mt-4 flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
        <span aria-hidden>{getEtfEmoji(etf.ticker)}</span>
        <span>{etf.friendlyName ?? etf.name}</span>
      </h1>
      <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {etf.name}
      </div>
      {etf.shortDescription && (
        <p className="mt-3 text-zinc-700 dark:text-zinc-300">
          {etf.shortDescription}
        </p>
      )}

      {/* Plain-language key stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <PlainStat label="Annual fee" value={annualFeeLabel(etf.ter)} />
        <PlainStat label="Risk level" value={riskWord(etf.riskScore)} />
        <PlainStat
          label="Dividends"
          value={dividendBehaviour(etf.isAccumulating)}
        />
        <PlainStat label="Provider" value={etf.issuer ?? "—"} />
      </div>

      {/* Pros & Cons */}
      {(etf.pros?.length || etf.cons?.length) ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {etf.pros && etf.pros.length > 0 && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                What's good
              </div>
              <ul className="mt-2 space-y-1.5">
                {etf.pros.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200"
                  >
                    <span
                      className="mt-1 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {etf.cons && etf.cons.length > 0 && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
              <div className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
                Watch out for
              </div>
              <ul className="mt-2 space-y-1.5">
                {etf.cons.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200"
                  >
                    <span
                      className="mt-1 shrink-0 text-rose-600 dark:text-rose-400"
                      aria-hidden
                    >
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

      {/* Chart */}
      <div className="mt-8">
        <EtfDetailChart ticker={etf.ticker} name={etf.name} />
      </div>

      {/* About */}
      {etf.longDescription && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            About this fund
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {etf.longDescription}
          </p>
        </section>
      )}

      {/* Tags */}
      {etf.tags && etf.tags.length > 0 && (
        <section className="mt-6">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Themes
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {etf.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Technical details — collapsed by default */}
      <TechnicalDetails etf={etf} />

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <button
          type="button"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add to portfolio
        </button>
        {etf.factSheetUrl && (
          <a
            href={etf.factSheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ExternalLink className="h-4 w-4" />
            Official fact sheet
          </a>
        )}
      </div>
    </div>
  );
}

function PlainStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </div>
    </div>
  );
}
