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
  // ─── Additions (round 2) ───────────────────────────────────
  // More Big Tech / Internet
  UBER: "uber.com",
  SPOT: "spotify.com",
  NET: "cloudflare.com",
  SHOP: "shopify.com",
  DELL: "dell.com",
  RBLX: "roblox.com",
  DIS: "disney.com",
  ROKU: "roku.com",
  // AI / networking
  ANET: "arista.com",
  // Chips
  ARM: "arm.com",
  MRVL: "marvell.com",
  LRCX: "lamresearch.com",
  KLAC: "kla.com",
  AMAT: "appliedmaterials.com",
  // SaaS
  TEAM: "atlassian.com",
  HUBS: "hubspot.com",
  ZS: "zscaler.com",
  OKTA: "okta.com",
  WDAY: "workday.com",
  IBM: "ibm.com",
  // Cars
  NIO: "nio.com",
  XPEV: "heyxpeng.com",
  LI: "lixiang.com",
  // Defense
  HII: "huntingtoningalls.com",
  // Energy
  OXY: "oxy.com",
  EOG: "eogresources.com",
  EQNR: "equinor.com",
  // Clean energy
  RUN: "sunrun.com",
  SEDG: "solaredge.com",
  // Travel
  HLT: "hilton.com",
  RCL: "royalcaribbean.com",
  CCL: "carnival.com",
  // Robotics
  ROK: "rockwellautomation.com",
  // Pharma
  PFE: "pfizer.com",
  MRK: "merck.com",
  NVS: "novartis.com",
  BMY: "bms.com",
  GILD: "gilead.com",
  // Luxury
  EL: "elcompanies.com",
  "KER.PA": "kering.com",
  // E-commerce
  ETSY: "etsy.com",
  PYPL: "paypal.com",
  // Finance / payments
  V: "visa.com",
  MA: "mastercard.com",
  BLK: "blackrock.com",
  AXP: "americanexpress.com",
  MS: "morganstanley.com",
  SCHW: "schwab.com",
  // Singapore
  "U11.SI": "uobgroup.com",
  "O39.SI": "ocbc.com",
  "F34.SI": "wilmar-international.com",
  "9CI.SI": "capitaland.com",
  "S63.SI": "stengg.com",
  "J36.SI": "jardines.com",
  // Retail
  WMT: "walmart.com",
  COST: "costco.com",
  HD: "homedepot.com",
  NKE: "nike.com",
  SBUX: "starbucks.com",
  MCD: "mcdonalds.com",
  LULU: "lululemon.com",
  // Telecom
  VZ: "verizon.com",
  TMUS: "t-mobile.com",
  VOD: "vodafone.com",
  // Industrials
  CAT: "caterpillar.com",
  DE: "deere.com",
  GE: "geaerospace.com",
  HON: "honeywell.com",
  // Crypto-adjacent
  COIN: "coinbase.com",
  MSTR: "strategy.com",

  // ─── France large-caps (CAC 40) ───────────────────────────
  "AIR.PA": "airbus.com",
  "SAF.PA": "safran-group.com",
  "HO.PA": "thalesgroup.com",
  "SU.PA": "se.com", // Schneider Electric
  "AI.PA": "airliquide.com",
  "DG.PA": "vinci.com",
  "OR.PA": "loreal.com",
  "RI.PA": "pernod-ricard.com",
  "SAN.PA": "sanofi.com",
  "DSY.PA": "3ds.com", // Dassault Systèmes
  "CAP.PA": "capgemini.com",
  "BNP.PA": "group.bnpparibas",
  "CS.PA": "axa.com", // AXA

  // ─── ETF benchmarks (mapped to the index brand or issuer) ──
  "CACC.PA": "amundi.com", // Amundi CAC 40
  "CSPX.L": "spglobal.com", // S&P 500
  "IWDA.L": "msci.com", // MSCI World
  "SWRD.L": "msci.com",
  "VWCE.DE": "ftserussell.com", // FTSE All-World
  "SSAC.L": "msci.com", // MSCI ACWI
  "EIMI.L": "msci.com", // MSCI EM
  "IMEU.L": "msci.com", // MSCI Europe
  "SJPA.L": "msci.com", // MSCI Japan
  "CPXJ.L": "msci.com", // MSCI Pacific
  "CNDX.L": "nasdaq.com", // Nasdaq 100
  "AGGG.L": "bloomberg.com", // Bloomberg Global Aggregate
  "SGLN.L": "lbma.org.uk", // Gold (LBMA)
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
