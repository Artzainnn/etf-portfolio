// Server-side only (used by API routes + CLI scripts).
import YahooFinance from "yahoo-finance2";

// v3 exports a class; instantiate once and reuse.
const yahooFinance = new YahooFinance();

export interface YahooPricePoint {
  date: Date;
  close: number; // in native currency (the listing currency of the ticker)
}

export interface YahooHistoryResult {
  /** Currency Yahoo reports for the listing (e.g. "USD", "GBP", "GBp", "EUR"). */
  currency: string;
  prices: YahooPricePoint[];
}

/**
 * Fetch daily close prices from Yahoo Finance for `ticker` between two dates.
 * Throws on network failure or invalid ticker. Caller should fall back to
 * cached prices if available.
 */
export async function fetchYahooHistory(
  ticker: string,
  fromDate: Date,
  toDate: Date = new Date(),
): Promise<YahooHistoryResult> {
  const result = await yahooFinance.chart(ticker, {
    period1: fromDate,
    period2: toDate,
    interval: "1d",
  });

  const currency = result.meta?.currency ?? "USD";
  const prices: YahooPricePoint[] = (result.quotes ?? [])
    .filter((q): q is typeof q & { date: Date; close: number } =>
      q.close != null && q.date != null,
    )
    .map((q) => ({
      date: q.date,
      close: q.close,
    }));

  return { currency, prices };
}
