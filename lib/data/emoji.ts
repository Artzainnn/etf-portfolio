/**
 * Hand-picked emoji for each ETF — the "what" of the fund at a glance.
 * Used as the primary visual identifier on the friendly name line.
 *
 * Distinct from the geo emoji (geo.ts), which conveys "where" the fund
 * invests. For broad-market and country-specific funds they're often
 * the same flag; for sectors and themes they differ (e.g. 🤖 AI fund
 * with 🌍 Global geographic exposure).
 */
const ETF_EMOJIS: Record<string, string> = {
  // ─── Broad market ──────────────────────────────────────────────
  "CSPX.L": "🇺🇸", // S&P 500 — the iconic US large-cap index
  "IWDA.L": "🌍", // MSCI World (developed)
  "SWRD.L": "🌍", // MSCI World (cheaper)
  "VWCE.DE": "🌐", // FTSE All-World incl. emerging
  "SSAC.L": "🌐", // MSCI ACWI incl. emerging
  "EIMI.L": "📈", // Emerging markets growth

  // ─── Regions / countries ───────────────────────────────────────
  "LCCN.L": "🇨🇳",
  "IASH.L": "🇨🇳",
  "IMEU.L": "🇪🇺",
  "IEUX.L": "🇪🇺",
  "ISF.L": "🇬🇧",
  "SJPA.L": "🇯🇵",
  "NDIA.L": "🇮🇳",
  "CPXJ.L": "🌏",
  "AEJL.L": "🌏",

  // ─── US tech indexes ───────────────────────────────────────────
  "CNDX.L": "💻", // Nasdaq 100 (iShares)
  "EQQQ.L": "💻", // Nasdaq 100 (Invesco)

  // ─── World sectors ─────────────────────────────────────────────
  "WITS.L": "💻", // Information technology
  "WHEA.L": "🏥", // Health care
  "WFIN.L": "🏦", // Financials
  "WCOD.L": "🛍️", // Consumer discretionary
  "WENS.L": "🛢️", // Energy (oil & gas)

  // ─── Thematic tech ─────────────────────────────────────────────
  "SMGB.L": "💾", // Semiconductors
  "WTAI.L": "🤖", // AI
  "RBOT.L": "🦾", // Robotics
  "WCLD.L": "☁️", // Cloud / SaaS

  // ─── Cybersecurity ─────────────────────────────────────────────
  "WCBR.L": "🔒",
  "ISPY.L": "🔒",

  // ─── Defence ───────────────────────────────────────────────────
  "NATO.L": "🪖",

  // ─── Energy / commodities ──────────────────────────────────────
  "INRG.L": "☀️", // Clean energy (solar / wind)
  "URNM.L": "⚛️", // Uranium miners
  "NUCL.L": "☢️", // Nuclear broad
  "SGLN.L": "🥇", // Physical gold

  // ─── Other thematics ───────────────────────────────────────────
  "DH2O.L": "💧", // Water
  "AGED.L": "👴", // Aging population
  "LITU.L": "🔋", // Lithium & batteries

  // ─── Bonds ─────────────────────────────────────────────────────
  "AGGG.L": "🛡️", // Defensive bonds

  // ─── New themes ────────────────────────────────────────────────
  "LUXG.L": "💎", // Luxury brands
  "IWDP.L": "🏢", // Real estate / REITs
  "VHYL.L": "💰", // High-dividend stocks
  "HSTC.L": "🇨🇳", // Chinese tech
  "HEAL.L": "🧬", // Biotech / medical innovation
  "YODA.L": "🚀", // Space economy
  "ESPO.L": "🎮", // Video games / esports
  "EBIZ.L": "🛒", // Online retail / e-commerce

  // ─── Sustainable / SRI ─────────────────────────────────────────
  "SUSW.L": "🌱", // World SRI
  "SUUS.L": "🌱", // US SRI
  "SUSM.L": "🌱", // Emerging markets SRI

  // ─── Additional emerging-market regions ────────────────────────
  "CSKR.L": "🇰🇷", // Korea
  "XMTW.L": "🇹🇼", // Taiwan
  "EMXC.L": "🌐", // EM ex-China
  "XVTD.L": "🇻🇳", // Vietnam
  "XMBR.L": "🇧🇷", // Brazil
  "XMES.L": "🇲🇽", // Mexico
  "IKSA.L": "🇸🇦", // Saudi Arabia
};

/** Return the curated emoji for an ETF ticker, falling back to a neutral chart icon. */
export function getEtfEmoji(ticker: string): string {
  return ETF_EMOJIS[ticker] ?? "📊";
}
