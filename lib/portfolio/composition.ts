/**
 * Flatten a portfolio's allocations into the underlying ETF/stock holdings.
 *
 * A portfolio can hold ETFs, individual stocks, AND other saved portfolios
 * (nested as live references). To simulate, backtest, or summarise a
 * portfolio we need its *leaf* holdings — the real tickers and how much of
 * the whole each one represents — with nested portfolios expanded.
 *
 * Nested references are LIVE: editing a building-block portfolio flows up
 * into every portfolio that includes it. Cycles (A → B → A) are broken
 * defensively via a visited set, so a malformed reference can never loop.
 *
 * Pure functions — safe to import from client or server.
 */

import type { Allocation, StoredPortfolio } from "@/lib/storage/portfolios";

export type LeafKind = "etf" | "stock";

export interface Leaf {
  kind: LeafKind;
  ticker: string;
  /** Share of the *whole* top-level portfolio, in the same units as the
   *  input percentages (top-level summing to ~100 ⇒ leaves sum to ~100). */
  percentage: number;
}

type PortfolioLookup = (id: string) => StoredPortfolio | null | undefined;

/** Classify a stored allocation, tolerating legacy rows that predate `kind`. */
export function allocationKind(
  a: Allocation,
): "etf" | "stock" | "portfolio" | null {
  if (a.kind) return a.kind;
  if (a.portfolioId) return "portfolio";
  if (a.ticker) return "etf"; // legacy: everything used to be an ETF
  return null;
}

/**
 * Expand allocations into leaf holdings. Nested portfolios contribute their
 * own leaves, scaled so the child's internal mix is re-normalised to the
 * weight given to the child here.
 */
export function flattenAllocations(
  allocations: Allocation[],
  getPortfolio: PortfolioLookup,
  visited: ReadonlySet<string> = new Set(),
): Leaf[] {
  const out: Leaf[] = [];
  for (const a of allocations) {
    const pct = a.percentage || 0;
    if (pct <= 0) continue;
    const kind = allocationKind(a);
    if (kind === "portfolio") {
      const id = a.portfolioId;
      if (!id || visited.has(id)) continue; // missing ref or cycle — skip
      const child = getPortfolio(id);
      if (!child || !Array.isArray(child.allocations)) continue;
      const childLeaves = flattenAllocations(
        child.allocations,
        getPortfolio,
        new Set([...visited, id]),
      );
      const childSum = childLeaves.reduce((s, l) => s + l.percentage, 0);
      if (childSum <= 0) continue;
      for (const l of childLeaves) {
        out.push({
          kind: l.kind,
          ticker: l.ticker,
          percentage: pct * (l.percentage / childSum),
        });
      }
    } else if (kind === "stock" || kind === "etf") {
      if (!a.ticker) continue;
      out.push({ kind, ticker: a.ticker, percentage: pct });
    }
  }
  return out;
}

/** Merge leaves that share the same kind+ticker, summing their weight. */
export function combineLeaves(leaves: Leaf[]): Leaf[] {
  const byKey = new Map<string, Leaf>();
  for (const l of leaves) {
    const key = `${l.kind}:${l.ticker}`;
    const existing = byKey.get(key);
    if (existing) existing.percentage += l.percentage;
    else byKey.set(key, { ...l });
  }
  return Array.from(byKey.values());
}

/** Convenience: fully resolved, de-duplicated leaves for a portfolio. */
export function resolveLeaves(
  allocations: Allocation[],
  getPortfolio: PortfolioLookup,
): Leaf[] {
  return combineLeaves(flattenAllocations(allocations, getPortfolio));
}

/**
 * Fraction of the whole that resolves to ETFs vs individual stocks
 * (0..1 each). Useful for "60% funds · 40% stocks" badges. Returns zeros
 * when there are no resolvable holdings.
 */
export function composition(leaves: Leaf[]): { etf: number; stock: number } {
  let etf = 0;
  let stock = 0;
  for (const l of leaves) {
    if (l.kind === "etf") etf += l.percentage;
    else stock += l.percentage;
  }
  const total = etf + stock;
  if (total <= 0) return { etf: 0, stock: 0 };
  return { etf: etf / total, stock: stock / total };
}

/**
 * Would nesting `candidateId` inside the portfolio identified by `targetId`
 * create a cycle? True if the candidate's subtree already references the
 * target (directly or transitively), or if they're the same portfolio.
 */
export function wouldCreateCycle(
  candidateId: string,
  targetId: string,
  getPortfolio: PortfolioLookup,
): boolean {
  if (candidateId === targetId) return true;
  const seen = new Set<string>();
  function refs(id: string): boolean {
    if (id === targetId) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    const p = getPortfolio(id);
    if (!p || !Array.isArray(p.allocations)) return false;
    for (const a of p.allocations) {
      if (allocationKind(a) === "portfolio" && a.portfolioId) {
        if (refs(a.portfolioId)) return true;
      }
    }
    return false;
  }
  return refs(candidateId);
}
