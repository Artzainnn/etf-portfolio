import { NextRequest, NextResponse } from "next/server";
import { getPriceSeries, type Period } from "@/lib/marketData/prices";

const VALID_PERIODS: Period[] = ["1M", "3M", "6M", "1Y", "3Y", "5Y", "Max"];

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await ctx.params;
  const decoded = decodeURIComponent(ticker);

  const periodParam = request.nextUrl.searchParams.get("period") ?? "1Y";
  const period = VALID_PERIODS.includes(periodParam as Period)
    ? (periodParam as Period)
    : "1Y";

  const series = await getPriceSeries(decoded, period);
  if (!series) {
    return NextResponse.json(
      { error: "No data available", ticker: decoded },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ticker: series.ticker,
    period,
    nativeCurrency: series.nativeCurrency,
    baseCurrency: "SGD",
    points: series.pointsNormalized,
    stats: series.stats,
    firstPriceSgd: series.pointsSgd[0]?.sgd ?? null,
    lastPriceSgd: series.pointsSgd[series.pointsSgd.length - 1]?.sgd ?? null,
  });
}
