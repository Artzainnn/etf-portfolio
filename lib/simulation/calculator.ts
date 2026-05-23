/**
 * Portfolio simulation math. Pure functions, no external deps,
 * safe to import from client components (no DB / no server-only).
 *
 * All monetary values are in the user's base currency (SGD).
 * Returns are decimal fractions (0.08 = 8% per year).
 */

export interface AllocationInput {
  /** Percentage of the portfolio (0-100). */
  percentage: number;
  /**
   * Expected annual return for this allocation (decimal). May be null
   * if the ETF has insufficient history — caller decides how to handle.
   */
  expectedReturn: number | null;
  /**
   * Annualised volatility (decimal). Optional — used only for Monte Carlo.
   */
  volatility?: number | null;
  /**
   * Total Expense Ratio (TER) as a decimal (e.g. 0.0025 = 0.25%/year).
   * Used to compute the portfolio's weighted average fee.
   */
  ter?: number | null;
}

export interface ScenarioInputs {
  /** Starting lump sum in SGD. */
  initialInvestment: number;
  /** Monthly top-up in SGD. */
  monthlyContribution: number;
  /** Holding horizon in years (typically 1–40). */
  durationYears: number;
  /** Expected return on the portfolio per year (decimal). */
  expectedAnnualReturn: number;
  /** Assumed annual inflation rate (decimal). 0 disables real-value calc. */
  inflationRate: number;
}

export interface ProjectionPoint {
  year: number;
  /** Money you've put in by this year (cumulative). */
  contributed: number;
  /** Optimistic projection — full expected return. */
  optimistic: number;
  /** Realistic — 75% of expected (haircut against recency bias). */
  realistic: number;
  /** Conservative — 50% of expected. */
  conservative: number;
  /** Realistic in today's money (after inflation). */
  realisticReal: number;
}

const SCENARIO_FACTORS = {
  optimistic: 1.0,
  realistic: 0.75,
  conservative: 0.5,
};

/**
 * Future value of an investment with monthly contributions, compounded monthly.
 *
 *   FV = P × (1+r)^n + M × ((1+r)^n − 1) / r
 *
 * where P = initial, M = monthly contribution, r = monthly rate, n = months.
 */
export function futureValue(
  initial: number,
  monthlyContribution: number,
  annualRate: number,
  years: number,
): number {
  if (years === 0) return initial;
  const r = annualRate / 12;
  const n = years * 12;
  if (Math.abs(r) < 1e-9) {
    // Zero (or near-zero) return — closed-form would divide by zero
    return initial + monthlyContribution * n;
  }
  const growthFactor = Math.pow(1 + r, n);
  const futureInitial = initial * growthFactor;
  const futureMonthly = monthlyContribution * ((growthFactor - 1) / r);
  return futureInitial + futureMonthly;
}

/**
 * Compute yearly snapshots for all three scenarios (optimistic, realistic,
 * conservative) over the holding horizon.
 */
export function projectScenarios(inputs: ScenarioInputs): ProjectionPoint[] {
  const years = Math.max(0, Math.round(inputs.durationYears));
  const points: ProjectionPoint[] = [];

  for (let y = 0; y <= years; y++) {
    const contributed =
      inputs.initialInvestment + inputs.monthlyContribution * 12 * y;
    const opt = futureValue(
      inputs.initialInvestment,
      inputs.monthlyContribution,
      inputs.expectedAnnualReturn * SCENARIO_FACTORS.optimistic,
      y,
    );
    const real = futureValue(
      inputs.initialInvestment,
      inputs.monthlyContribution,
      inputs.expectedAnnualReturn * SCENARIO_FACTORS.realistic,
      y,
    );
    const cons = futureValue(
      inputs.initialInvestment,
      inputs.monthlyContribution,
      inputs.expectedAnnualReturn * SCENARIO_FACTORS.conservative,
      y,
    );

    const realReal =
      inputs.inflationRate > 0
        ? real / Math.pow(1 + inputs.inflationRate, y)
        : real;

    points.push({
      year: y,
      contributed,
      optimistic: opt,
      realistic: real,
      conservative: cons,
      realisticReal: realReal,
    });
  }

  return points;
}

/**
 * Weighted expected return for a portfolio. Allocations without a known
 * expected return are excluded from the weighting (the weights are
 * re-normalised over the known-return slice).
 *
 * Returns null if no allocation has a known return.
 */
export function weightedReturn(allocations: AllocationInput[]): number | null {
  let weightedSum = 0;
  let weightSum = 0;
  for (const a of allocations) {
    if (a.expectedReturn != null && a.percentage > 0) {
      const w = a.percentage / 100;
      weightedSum += w * a.expectedReturn;
      weightSum += w;
    }
  }
  if (weightSum === 0) return null;
  return weightedSum / weightSum;
}

/**
 * Sum of allocation percentages — used to show "Total: 100%" or warn the user.
 */
export function allocationTotal(
  allocations: Pick<AllocationInput, "percentage">[],
): number {
  return allocations.reduce((sum, a) => sum + (a.percentage ?? 0), 0);
}

/**
 * Weighted average annual fee across the allocation. Funds without a known
 * TER are excluded from both numerator and denominator (so the result
 * reflects the actual cost of the known-fee slice).
 *
 * Returns null if no allocation has a known TER.
 */
export function weightedAnnualFee(
  allocations: Pick<AllocationInput, "percentage" | "ter">[],
): number | null {
  let weighted = 0;
  let weightSum = 0;
  for (const a of allocations) {
    if (a.ter != null && a.percentage > 0) {
      const w = a.percentage / 100;
      weighted += w * a.ter;
      weightSum += w;
    }
  }
  if (weightSum === 0) return null;
  return weighted / weightSum;
}

/**
 * Estimate total fees paid over the holding horizon, in SGD.
 * Uses the realistic projection path (75% of expected return) and applies
 * the fee on the average portfolio value each year. This is the standard
 * "annual fee × average AUM" approximation.
 */
export function totalFeesPaid(
  inputs: ScenarioInputs,
  annualFee: number,
): number {
  if (annualFee <= 0 || inputs.durationYears <= 0) return 0;
  const realisticRate = inputs.expectedAnnualReturn * 0.75;
  let value = inputs.initialInvestment;
  let totalFees = 0;
  for (let y = 1; y <= inputs.durationYears; y++) {
    const startOfYear = value;
    const grown = futureValue(
      startOfYear,
      inputs.monthlyContribution,
      realisticRate,
      1,
    );
    const endOfYear = grown;
    const avg = (startOfYear + endOfYear) / 2;
    totalFees += avg * annualFee;
    value = endOfYear;
  }
  return totalFees;
}

/**
 * Currency formatter that picks compact notation for large numbers
 * (e.g. "$2.1M") but full digits for small ones.
 */
export function formatMoney(
  value: number,
  currency: string = "SGD",
  opts: { compact?: boolean } = {},
): string {
  const compact = opts.compact ?? Math.abs(value) >= 100_000;
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 2 : 0,
  }).format(value);
}
