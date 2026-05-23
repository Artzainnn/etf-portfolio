import type { Etf } from "@/lib/db/schema";

/**
 * Maps an ETF to a geography badge (emoji + short label) for at-a-glance
 * identification. Derived from sub_category + category — no DB column needed.
 *
 * Country-specific funds get a flag. Regions get a regional indicator.
 * Sectors/themes default to 🌍 Global since the underlying indexes are
 * world-spanning (even if heavily US-tilted in practice).
 */
export function geoBadge(etf: {
  category: string | null;
  subCategory: string | null;
}): { emoji: string; label: string } {
  const sub = etf.subCategory ?? "";

  // Single-country funds
  switch (sub) {
    case "us_large_cap":
    case "us_nasdaq":
      return { emoji: "🇺🇸", label: "US" };
    case "china":
    case "china_a_shares":
      return { emoji: "🇨🇳", label: "China" };
    case "uk_large_cap":
      return { emoji: "🇬🇧", label: "UK" };
    case "japan":
      return { emoji: "🇯🇵", label: "Japan" };
    case "india":
      return { emoji: "🇮🇳", label: "India" };
    case "korea":
      return { emoji: "🇰🇷", label: "South Korea" };
    case "taiwan":
      return { emoji: "🇹🇼", label: "Taiwan" };
    case "vietnam":
      return { emoji: "🇻🇳", label: "Vietnam" };
    case "brazil":
      return { emoji: "🇧🇷", label: "Brazil" };
    case "mexico":
      return { emoji: "🇲🇽", label: "Mexico" };
    case "saudi_arabia":
      return { emoji: "🇸🇦", label: "Saudi Arabia" };
  }

  // Regions
  if (sub === "europe_developed" || sub === "europe_ex_uk") {
    return { emoji: "🇪🇺", label: "Europe" };
  }
  if (
    sub === "asia_pacific_ex_japan" ||
    sub === "asia_pacific_all_country"
  ) {
    return { emoji: "🌏", label: "Asia-Pacific" };
  }
  if (sub === "emerging_markets") {
    return { emoji: "🌐", label: "Emerging markets" };
  }
  if (sub === "emerging_markets_ex_china") {
    return { emoji: "🌐", label: "EM ex-China" };
  }
  if (sub === "world_developed" || sub === "world_all_country") {
    return { emoji: "🌍", label: "Global" };
  }

  // Gold ETC — not really geographic
  if (etf.category === "commodity") return { emoji: "🪙", label: "Commodity" };

  // Sectors / thematics / global bonds — index is global
  return { emoji: "🌍", label: "Global" };
}

export type GeoKey =
  | "us"
  | "china"
  | "uk"
  | "japan"
  | "india"
  | "europe"
  | "asia_pacific"
  | "emerging"
  | "global"
  | "commodity";

/** Returns a coarse geo key for filtering — folds sub-categories into buckets. */
export function geoKey(etf: Pick<Etf, "category" | "subCategory">): GeoKey {
  const sub = etf.subCategory ?? "";
  if (sub === "us_large_cap" || sub === "us_nasdaq") return "us";
  if (sub === "china" || sub === "china_a_shares") return "china";
  if (sub === "uk_large_cap") return "uk";
  if (sub === "japan") return "japan";
  if (sub === "india") return "india";
  if (sub === "europe_developed" || sub === "europe_ex_uk") return "europe";
  if (sub === "asia_pacific_ex_japan" || sub === "asia_pacific_all_country")
    return "asia_pacific";
  if (sub === "emerging_markets") return "emerging";
  if (etf.category === "commodity") return "commodity";
  return "global";
}
