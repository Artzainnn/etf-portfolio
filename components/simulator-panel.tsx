"use client";

import { useMemo } from "react";
import { Info } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
import {
  allocationTotal,
  formatMoney,
  projectScenarios,
  weightedReturn,
  type AllocationInput,
} from "@/lib/simulation/calculator";

interface Allocation extends AllocationInput {
  ticker: string;
  friendlyName: string;
}

interface Props {
  allocations: Allocation[];
  initialInvestment: number;
  monthlyContribution: number;
  durationYears: number;
  inflationRate: number;
  onInitialChange: (v: number) => void;
  onMonthlyChange: (v: number) => void;
  onDurationChange: (v: number) => void;
  onInflationChange: (v: number) => void;
}

export function SimulatorPanel(props: Props) {
  const {
    allocations,
    initialInvestment,
    monthlyContribution,
    durationYears,
    inflationRate,
    onInitialChange,
    onMonthlyChange,
    onDurationChange,
    onInflationChange,
  } = props;

  const total = allocationTotal(allocations);
  const weightedR = useMemo(() => weightedReturn(allocations), [allocations]);

  const canSimulate = total > 0 && weightedR != null;

  const projection = useMemo(() => {
    if (!canSimulate || weightedR == null) return [];
    return projectScenarios({
      initialInvestment,
      monthlyContribution,
      durationYears,
      expectedAnnualReturn: weightedR,
      inflationRate,
    });
  }, [
    canSimulate,
    weightedR,
    initialInvestment,
    monthlyContribution,
    durationYears,
    inflationRate,
  ]);

  const final = projection[projection.length - 1];
  const realistic = final?.realistic ?? 0;
  const optimistic = final?.optimistic ?? 0;
  const conservative = final?.conservative ?? 0;
  const contributed = final?.contributed ?? 0;
  const realisticGains = realistic - contributed;
  const realisticReal = final?.realisticReal ?? 0;

  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        How it could grow
      </h2>

      {/* Inputs card */}
      <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Starting amount"
            suffix="SGD"
            value={initialInvestment}
            onChange={onInitialChange}
            step={1000}
          />
          <NumberInput
            label="Monthly top-up"
            suffix="SGD"
            value={monthlyContribution}
            onChange={onMonthlyChange}
            step={100}
          />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              For how many years?
            </label>
            <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {durationYears} {durationYears === 1 ? "year" : "years"}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={40}
            step={1}
            value={durationYears}
            onChange={(e) => onDurationChange(parseInt(e.target.value, 10))}
            className="w-full accent-zinc-900 dark:accent-zinc-100"
            aria-label="Duration in years"
          />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Inflation assumption
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={(inflationRate * 100).toFixed(1)}
              onChange={(e) =>
                onInflationChange((parseFloat(e.target.value) || 0) / 100)
              }
              min={0}
              max={10}
              step={0.1}
              className="w-16 rounded-md border border-zinc-300 bg-white px-2 py-1 text-right text-sm tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
            />
            <span className="text-xs text-zinc-500">% / year</span>
          </div>
        </div>
      </div>

      {/* Outputs */}
      {!canSimulate ? (
        <div className="mt-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          Add at least one fund with available return data to see a projection.
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Realistic estimate after {durationYears} years
            </div>
            <div className="mt-1 text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatMoney(realistic)}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <Tile label="You'll have put in" value={formatMoney(contributed)} />
              <Tile
                label="Capital gains"
                value={formatMoney(realisticGains)}
                positive={realisticGains > 0}
              />
              <Tile
                label="In today's money"
                value={formatMoney(realisticReal)}
                hint={`Adjusted for ${(inflationRate * 100).toFixed(1)}% inflation`}
              />
              <Tile
                label="Expected return"
                value={`${((weightedR ?? 0) * 100).toFixed(1)}%/yr`}
                hint="Weighted average across your funds (haircut 25% for realism)"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 text-xs dark:border-zinc-800">
              <Tile
                label="Optimistic"
                value={formatMoney(optimistic)}
                muted
                hint="If returns continue at historical pace"
              />
              <Tile
                label="Conservative"
                value={formatMoney(conservative)}
                muted
                hint="If returns are half the historical pace"
              />
            </div>
          </div>

          {/* Projection chart */}
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Projected value over time
              </div>
              <div className="flex items-center gap-3 text-[10px] text-zinc-500 dark:text-zinc-400">
                <LegendDot color="#10b981" label="Optimistic" />
                <LegendDot color="#0ea5e9" label="Realistic" />
                <LegendDot color="#a1a1aa" label="Conservative" />
                <LegendDot color="#71717a" label="Contributed" dashed />
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={projection}
                  margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="text-zinc-200 dark:text-zinc-800"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "currentColor" }}
                    className="text-zinc-500"
                    label={{
                      value: "years",
                      position: "insideBottomRight",
                      offset: -5,
                      style: { fontSize: 10, fill: "currentColor" },
                    }}
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      formatMoney(v, "SGD", { compact: true }).replace("SGD", "")
                    }
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "currentColor" }}
                    className="text-zinc-500"
                    width={50}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const d = payload[0].payload as (typeof projection)[number];
                      return (
                        <div className="rounded-md border border-zinc-200 bg-white p-2.5 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            Year {d.year}
                          </div>
                          <Row label="Optimistic" value={d.optimistic} color="#10b981" />
                          <Row label="Realistic" value={d.realistic} color="#0ea5e9" />
                          <Row label="Conservative" value={d.conservative} color="#a1a1aa" />
                          <Row label="Contributed" value={d.contributed} color="#71717a" dashed />
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="optimistic"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    fill="#10b981"
                    fillOpacity={0.08}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="realistic"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="#0ea5e9"
                    fillOpacity={0.12}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="conservative"
                    stroke="#a1a1aa"
                    strokeWidth={1.5}
                    fill="#a1a1aa"
                    fillOpacity={0.05}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="contributed"
                    stroke="#71717a"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    dot={false}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="mt-3 flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Info className="h-3.5 w-3.5 shrink-0 translate-y-0.5" />
            <span>
              The realistic line uses 75% of your funds' historical annualized
              return as a haircut — past performance was unusually strong for
              tech-heavy funds. Projections are estimates, not promises.
            </span>
          </p>
        </>
      )}
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  suffix,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <div className="mt-1.5 flex items-center rounded-md border border-zinc-300 bg-white focus-within:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          min={0}
          className="w-full bg-transparent px-3 py-2 text-sm tabular-nums focus:outline-none"
        />
        {suffix && (
          <span className="shrink-0 px-3 text-xs text-zinc-500">{suffix}</span>
        )}
      </div>
    </label>
  );
}

function Tile({
  label,
  value,
  hint,
  positive,
  muted,
}: {
  label: string;
  value: string;
  hint?: string;
  positive?: boolean;
  muted?: boolean;
}) {
  const valCls = muted
    ? "text-zinc-700 dark:text-zinc-300"
    : positive
      ? "text-emerald-700 dark:text-emerald-400"
      : "text-zinc-900 dark:text-zinc-50";
  return (
    <div title={hint}>
      <div className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className={`mt-0.5 text-sm font-semibold tabular-nums ${valCls}`}>
        {value}
      </div>
    </div>
  );
}

function LegendDot({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block h-2 w-3"
        style={{
          backgroundColor: dashed ? "transparent" : color,
          borderTop: dashed ? `1.5px dashed ${color}` : "none",
        }}
      />
      {label}
    </span>
  );
}

function Row({
  label,
  value,
  color,
  dashed,
}: {
  label: string;
  value: number;
  color: string;
  dashed?: boolean;
}) {
  return (
    <div className="mt-1 flex items-center justify-between gap-3">
      <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
        <span
          className="inline-block h-1.5 w-3"
          style={{
            backgroundColor: dashed ? "transparent" : color,
            borderTop: dashed ? `1.5px dashed ${color}` : "none",
          }}
        />
        {label}
      </span>
      <span className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
        {formatMoney(value)}
      </span>
    </div>
  );
}
