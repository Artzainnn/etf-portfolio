/**
 * Maps each stock ticker to its corporate domain for logo lookup.
 * Logos are fetched at runtime via icon.horse (primary) with a Google
 * favicon fallback — no API keys, no auth.
 */

export const STOCK_DOMAINS: Record<string, string> = {
  // Big Tech
  AAPL: "apple.com",
  MSFT: "microsoft.com",
  GOOGL: "google.com",
  AMZN: "amazon.com",
  META: "meta.com",
  NFLX: "netflix.com",
  ORCL: "oracle.com",
  // AI / Chips
  NVDA: "nvidia.com",
  AMD: "amd.com",
  PLTR: "palantir.com",
  TSM: "tsmc.com",
  ASML: "asml.com",
  AVGO: "broadcom.com",
  QCOM: "qualcomm.com",
  MU: "micron.com",
  INTC: "intel.com",
  // SaaS
  CRM: "salesforce.com",
  ADBE: "adobe.com",
  NOW: "servicenow.com",
  SNOW: "snowflake.com",
  DDOG: "datadoghq.com",
  CRWD: "crowdstrike.com",
  MDB: "mongodb.com",
  // Cars & EV
  TSLA: "tesla.com",
  F: "ford.com",
  GM: "gm.com",
  STLA: "stellantis.com",
  RIVN: "rivian.com",
  TM: "toyota.com",
  BYDDY: "bydglobal.com",
  "MBG.DE": "mercedes-benz.com",
  // Defense
  LMT: "lockheedmartin.com",
  RTX: "rtx.com",
  NOC: "northropgrumman.com",
  GD: "gd.com",
  BA: "boeing.com",
  "RHM.DE": "rheinmetall.com",
  // Energy
  XOM: "exxonmobil.com",
  CVX: "chevron.com",
  SHEL: "shell.com",
  BP: "bp.com",
  TTE: "totalenergies.com",
  // Clean energy
  ENPH: "enphase.com",
  FSLR: "firstsolar.com",
  NEE: "nexteraenergy.com",
  PLUG: "plugpower.com",
  // Travel
  BKNG: "booking.com",
  ABNB: "airbnb.com",
  MAR: "marriott.com",
  DAL: "delta.com",
  // Robotics
  ISRG: "intuitive.com",
  "ABBN.SW": "abb.com",
  // Quantum
  IONQ: "ionq.com",
  RGTI: "rigetti.com",
  QBTS: "dwavequantum.com",
  // Pharma
  LLY: "lilly.com",
  NVO: "novonordisk.com",
  JNJ: "jnj.com",
  AZN: "astrazeneca.com",
  ABBV: "abbvie.com",
  // Luxury
  "MC.PA": "lvmh.com",
  "RMS.PA": "hermes.com",
  "CFR.SW": "richemont.com",
  RACE: "ferrari.com",
  // E-commerce
  MELI: "mercadolibre.com",
  BABA: "alibabagroup.com",
  JD: "jd.com",
  // Finance
  JPM: "jpmorganchase.com",
  BAC: "bankofamerica.com",
  GS: "goldmansachs.com",
  HSBC: "hsbc.com",
  // Singapore
  "D05.SI": "dbs.com",
  "C6L.SI": "singaporeair.com",
  "Z74.SI": "singtel.com",
  SE: "seagroup.com",
};

export function primaryLogoUrl(ticker: string): string | null {
  const domain = STOCK_DOMAINS[ticker];
  if (!domain) return null;
  return `https://icon.horse/icon/${domain}`;
}

export function fallbackLogoUrl(ticker: string): string | null {
  const domain = STOCK_DOMAINS[ticker];
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}
