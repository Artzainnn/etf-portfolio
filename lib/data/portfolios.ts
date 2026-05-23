import "server-only";
import { db } from "@/lib/db/client";
import { portfolios, portfolioAllocations, etfs } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface PortfolioWithAllocations {
  id: number;
  name: string;
  description: string | null;
  baseCurrency: string;
  initialInvestment: string | null;
  monthlyContribution: string | null;
  durationYears: number | null;
  reinvestDividends: boolean;
  inflationRate: string | null;
  createdAt: Date;
  updatedAt: Date;
  allocations: {
    id: number;
    etfId: number;
    percentage: string;
    notes: string | null;
    // Joined ETF data needed for the editor
    ticker: string;
    friendlyName: string | null;
    name: string;
    shortDescription: string | null;
    riskScore: number | null;
    return1Y: string | null;
    return3YAnnualized: string | null;
    return5YAnnualized: string | null;
  }[];
}

/** List all portfolios (most-recent first). No allocations — light query for the index page. */
export async function listPortfolios() {
  const rows = await db
    .select({
      id: portfolios.id,
      name: portfolios.name,
      description: portfolios.description,
      durationYears: portfolios.durationYears,
      initialInvestment: portfolios.initialInvestment,
      monthlyContribution: portfolios.monthlyContribution,
      createdAt: portfolios.createdAt,
      updatedAt: portfolios.updatedAt,
      allocationCount: sql<number>`(
        SELECT COUNT(*) FROM ${portfolioAllocations}
        WHERE ${portfolioAllocations.portfolioId} = ${portfolios.id}
      )`,
    })
    .from(portfolios)
    .orderBy(desc(portfolios.updatedAt));
  return rows;
}

/** Fetch one portfolio with its allocations (and joined ETF data for each). */
export async function getPortfolio(
  id: number,
): Promise<PortfolioWithAllocations | null> {
  const rows = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, id))
    .limit(1);
  if (rows.length === 0) return null;
  const p = rows[0];

  const allocs = await db
    .select({
      id: portfolioAllocations.id,
      etfId: portfolioAllocations.etfId,
      percentage: portfolioAllocations.allocationPercentage,
      notes: portfolioAllocations.notes,
      ticker: etfs.ticker,
      friendlyName: etfs.friendlyName,
      name: etfs.name,
      shortDescription: etfs.shortDescription,
      riskScore: etfs.riskScore,
      return1Y: etfs.return1Y,
      return3YAnnualized: etfs.return3YAnnualized,
      return5YAnnualized: etfs.return5YAnnualized,
    })
    .from(portfolioAllocations)
    .innerJoin(etfs, eq(portfolioAllocations.etfId, etfs.id))
    .where(eq(portfolioAllocations.portfolioId, id));

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    baseCurrency: p.baseCurrency,
    initialInvestment: p.initialInvestment,
    monthlyContribution: p.monthlyContribution,
    durationYears: p.durationYears,
    reinvestDividends: p.reinvestDividends,
    inflationRate: p.inflationRate,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    allocations: allocs,
  };
}

/** Create a new portfolio with sensible defaults; returns the new id. */
export async function createPortfolio(name: string = "Untitled portfolio"): Promise<number> {
  const [row] = await db
    .insert(portfolios)
    .values({
      name,
      description: null,
      baseCurrency: "SGD",
      initialInvestment: "50000",
      monthlyContribution: "5000",
      durationYears: 10,
      reinvestDividends: true,
      inflationRate: "0.0200",
    })
    .returning({ id: portfolios.id });
  return row.id;
}

export interface UpdatePortfolioInput {
  name?: string;
  description?: string | null;
  initialInvestment?: number;
  monthlyContribution?: number;
  durationYears?: number;
  reinvestDividends?: boolean;
  inflationRate?: number;
  allocations?: { etfId: number; percentage: number; notes?: string | null }[];
}

/**
 * Update a portfolio. If `allocations` is supplied, the existing allocations
 * are deleted and replaced — simplest semantics for the auto-save flow.
 */
export async function updatePortfolio(
  id: number,
  input: UpdatePortfolioInput,
): Promise<void> {
  const fields: Record<string, unknown> = {
    updatedAt: sql`NOW()`,
  };
  if (input.name !== undefined) fields.name = input.name;
  if (input.description !== undefined) fields.description = input.description;
  if (input.initialInvestment !== undefined)
    fields.initialInvestment = input.initialInvestment.toString();
  if (input.monthlyContribution !== undefined)
    fields.monthlyContribution = input.monthlyContribution.toString();
  if (input.durationYears !== undefined)
    fields.durationYears = input.durationYears;
  if (input.reinvestDividends !== undefined)
    fields.reinvestDividends = input.reinvestDividends;
  if (input.inflationRate !== undefined)
    fields.inflationRate = input.inflationRate.toFixed(4);

  await db.update(portfolios).set(fields).where(eq(portfolios.id, id));

  if (input.allocations !== undefined) {
    await db
      .delete(portfolioAllocations)
      .where(eq(portfolioAllocations.portfolioId, id));
    if (input.allocations.length > 0) {
      await db.insert(portfolioAllocations).values(
        input.allocations.map((a) => ({
          portfolioId: id,
          etfId: a.etfId,
          allocationPercentage: a.percentage.toFixed(2),
          notes: a.notes ?? null,
        })),
      );
    }
  }
}

export async function deletePortfolio(id: number): Promise<void> {
  await db.delete(portfolios).where(eq(portfolios.id, id));
}
