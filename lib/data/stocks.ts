import stocksData from "@/data/stocks.json";

export type PeriodKey = "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y" | "Max";

export interface Stock {
  ticker: string;
  name: string;
  friendlyName: string;
  shortDescription: string;
  industries: string[];
  country: string;
  emoji?: string;
  nativeCurrency: string;
  periodReturns: Partial<Record<PeriodKey, number>>;
  periodSparklines: Partial<Record<PeriodKey, number[]>>;
}

const STOCKS = stocksData as unknown as Stock[];

export function listStocks(): Stock[] {
  return STOCKS;
}

// Country code → flag emoji
export const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  CN: "🇨🇳",
  JP: "🇯🇵",
  DE: "🇩🇪",
  FR: "🇫🇷",
  GB: "🇬🇧",
  CH: "🇨🇭",
  NL: "🇳🇱",
  DK: "🇩🇰",
  IT: "🇮🇹",
  AR: "🇦🇷",
  TW: "🇹🇼",
  SG: "🇸🇬",
};

export function flagFor(country: string): string {
  return COUNTRY_FLAGS[country] ?? "🌐";
}
