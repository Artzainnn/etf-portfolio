# ETF Portfolio Ticker Verification — v2 (Emerging Markets country-specific themes)

Date: 2026-05-23
Source data: Yahoo Finance chart API (`query1.finance.yahoo.com/v8/finance/chart`) and search API (`query2.finance.yahoo.com/v1/finance/search`). TERs cross-checked against published Xtrackers/iShares/Amundi/HANetf documentation where available. ISINs taken from Yahoo metadata where present and from issuer naming conventions otherwise; flagged as "verify against KIID" where uncertain.

Yahoo currency note (same as v1): Yahoo reports `GBp` (pence) for any LSE line that trades in pence even when the fund's reporting currency is USD. The "Currency" field is the **trading currency on that line**, not the fund's reporting/NAV currency. For Singapore investors with SGD base on IBKR, USD-denominated LSE lines reduce one FX hop versus GBp lines.

Xtrackers note: Xtrackers (DWS) uses share-class suffix `1C` = capitalising = accumulating. All `XMTW.L`, `XKS2.L`, `XMBR.L`, `XMEX.L`, `XMES.L`, `XVTD.L`, `XFVT.L`, `XFVT.DE` referenced below are accumulating share classes.

---

## Per-ticker results

### South Korea

**Ticker:** CSKR.L (recommended primary)
- **Status:** VERIFIED
- **Yahoo:** works (10y of daily data, ~2527 points; firstTradeDate 2010-09-17 — fund inception 2010)
- **Actual UCITS?:** yes (iShares VII PLC — Irish ICAV)
- **Real TER:** 0.74%
- **Acc/Dist:** Acc (Yahoo longName confirms "USD (Acc)")
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes (mainstream iShares product on LSE)
- **Notes:** ISIN IE00B0M63391. The clean accumulating-USD-on-LSE choice for MSCI Korea exposure (Samsung Electronics ~22%, SK Hynix ~9%, Hyundai Motor, LG Energy Solution, Naver). The Dist sister is IKOR.L (GBp line on LSE, 10y data, USD reporting). Xtrackers alternative is XKS2.L (Xtrackers MSCI Korea UCITS ETF 1C, GBp on LSE, also 10y data, TER ~0.65% — slightly cheaper but GBp trading).

**Ticker:** IKOR.L (alternative)
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.74%
- **Acc/Dist:** **Dist** (Yahoo longName: "iShares MSCI Korea UCITS ETF USD (Dist)")
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBp (fund reports in USD)
- **Notes:** ISIN IE00B0M63391 same underlying as CSKR.L but distributing.

**Ticker:** XKS2.L (alternative — Xtrackers)
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points; fund inception 2007)
- **Actual UCITS?:** yes
- **Real TER:** ~0.65% (unverified — confirm against current Xtrackers KIID)
- **Acc/Dist:** Acc (1C suffix)
- **Domicile:** Luxembourg (Xtrackers)
- **Exchange:** LSE
- **Currency:** GBp
- **Notes:** ISIN LU0292100046. Cheaper than CSKR.L but GBp trading line.

---

### Taiwan

**Ticker:** XMTW.L (recommended primary)
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points; fund inception 2007)
- **Actual UCITS?:** yes (Xtrackers Luxembourg)
- **Real TER:** ~0.65% (unverified — confirm KIID)
- **Acc/Dist:** Acc (1C = capitalising)
- **Domicile:** Luxembourg
- **Exchange:** LSE
- **Currency:** GBp
- **IBKR likely available:** yes
- **Notes:** ISIN LU0292109187. **No USD trading line on LSE.** The iShares MSCI Taiwan UCITS ETF is distributing-only on LSE (ITWN.L), so for an accumulating MSCI Taiwan exposure XMTW.L is the natural Acc choice. TSMC dominates the index (~50%); also Hon Hai, MediaTek, Foxconn. Swiss line XMTW.SW exists in CHF.

**Ticker:** ITWN.L (alternative — iShares Dist)
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.74%
- **Acc/Dist:** **Dist** (Yahoo longName: "USD (Dist)")
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBp
- **Notes:** ISIN IE00B0M63623. The iShares Taiwan ETF — no Acc share class exists on LSE for this fund. Use only if you want iShares brand and don't mind dividends.

**Ticker:** FLXT.L (alternative — Franklin FTSE Taiwan)
- **Status:** VERIFIED with caveat
- **Yahoo:** works (~3.2y, 1052 points; listed Mar 2022)
- **Actual UCITS?:** yes
- **Real TER:** 0.19% (much cheaper)
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **Notes:** ISIN IE000XOOEW63. **Tracks FTSE Taiwan, not MSCI Taiwan** — similar but not identical exposure. Cheaper by ~50bps. Shorter history (just over 3y) but clears the 2y minimum. If TER matters more than index methodology, this is the better choice; otherwise XMTW.L for the longer history and standard MSCI methodology.

---

### Emerging markets excluding China

**Ticker:** EMXC.L (recommended primary)
- **Status:** VERIFIED
- **Yahoo:** works (~6.9y, 1749 points; listed Jun 2019)
- **Actual UCITS?:** yes (Amundi)
- **Real TER:** 0.18%
- **Acc/Dist:** Acc (Yahoo longName confirms "Acc")
- **Domicile:** Luxembourg
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN LU1681045370. Amundi MSCI Emerging Markets ex China UCITS ETF Acc. The longest-history, cheapest EM-ex-China UCITS on LSE in USD. Same fund trades as EMXC.DE (EUR Xetra) and EMXC.MI (Milan).

**Ticker:** EXCS.L (alternative — iShares)
- **Status:** VERIFIED with caveat
- **Yahoo:** works (~4.1y, 1280 points; listed Apr 2021)
- **Actual UCITS?:** yes
- **Real TER:** 0.18%
- **Acc/Dist:** Acc (Yahoo longName: "USD Acc")
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBP
- **Notes:** ISIN IE00BMG6Z448. iShares MSCI EM ex China UCITS ETF USD Acc. Shorter history than EMXC.L by ~2 years, and GBP trading rather than USD — Amundi's EMXC.L is the better primary pick for SG investors on IBKR. Keep EXCS.L as a backup option for users who prefer the iShares brand.

---

### Vietnam

**Ticker:** XVTD.L (recommended primary)
- **Status:** VERIFIED
- **Yahoo:** works (10y of daily data, 2527 points back to May 2016; the underlying fund launched 2008)
- **Actual UCITS?:** yes (Xtrackers Luxembourg)
- **Real TER:** 0.85%
- **Acc/Dist:** Acc (1C suffix)
- **Domicile:** Luxembourg
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN LU0322252924. Xtrackers FTSE Vietnam Swap UCITS ETF — the standard UCITS Vietnam ETF, **synthetic/swap-based** because direct foreign ownership of Vietnamese equities is restricted. Tracks FTSE Vietnam index (Vinhomes, Hoa Phat Group, Vingroup, Masan, Vietcombank). XFVT.L is the GBp line, XFVT.DE is the EUR Xetra line — same fund. **Flag for the user that this is swap-based**, which adds counterparty risk vs physical replication.

**Note on XFVT.DE:** Although the user mentioned `XFVT.DE`, the Xetra line shows Yahoo firstTrade 2023-11-13 — that's when DWS relisted/repurposed the share class on Xetra; the underlying fund has been running since 2008. The LSE USD line XVTD.L gives the longest continuous Yahoo daily history (10y+) and is preferable for back-testing.

---

### Brazil

**Ticker:** XMBR.L (recommended primary)
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points; fund inception 2007)
- **Actual UCITS?:** yes (Xtrackers Luxembourg)
- **Real TER:** 0.65%
- **Acc/Dist:** Acc (1C)
- **Domicile:** Luxembourg
- **Exchange:** LSE
- **Currency:** GBp
- **IBKR likely available:** yes
- **Notes:** ISIN LU0292109344. Xtrackers MSCI Brazil UCITS ETF 1C — accumulating, well-established (since 2007), MSCI Brazil exposure (Vale, Petrobras, Itaú, B3, Ambev). No USD trading line on LSE that I can find; XMBR.DE (Xetra EUR) and XMBR.MI (Milan EUR) are sister listings.

**Ticker:** IBZL.L (alternative — iShares Dist)
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.74%
- **Acc/Dist:** **Dist** (Yahoo longName: "USD (Dist)")
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBp (USD reporting)
- **Notes:** ISIN IE00B0M63516. Standard iShares MSCI Brazil — distributing. If user prefers iShares brand over Xtrackers, this is the closest equivalent but loses the accumulation benefit for portfolio sim.

**Ticker:** RIOL.L (alternative — Amundi Acc)
- **Status:** VERIFIED with caveat
- **Yahoo:** works (~7.2y, 1814 points; listed Mar 2019)
- **Actual UCITS?:** yes
- **Real TER:** 0.55% (cheapest)
- **Acc/Dist:** Acc
- **Domicile:** Luxembourg
- **Exchange:** LSE
- **Currency:** GBp
- **Notes:** Amundi MSCI Brazil UCITS ETF Acc. Cheaper than Xtrackers by ~10bps and Amundi-Lyxor merger means it's robust, but shorter history than XMBR.L. Prefer XMBR.L for the longer back-test window.

---

### Mexico

**Ticker:** XMES.L (recommended primary)
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points; fund inception 2010)
- **Actual UCITS?:** yes (Xtrackers Luxembourg)
- **Real TER:** 0.65%
- **Acc/Dist:** Acc (1C)
- **Domicile:** Luxembourg
- **Exchange:** LSE
- **Currency:** **USD**
- **IBKR likely available:** yes
- **Notes:** ISIN LU0476289466. Xtrackers MSCI Mexico UCITS ETF 1C — the USD trading line on LSE (XMEX.L is the same fund in GBp). Tracks MSCI Mexico (América Móvil, Walmart de México, FEMSA, Banorte, Cemex). Cleanest UCITS Mexico choice for SG investors on IBKR thanks to the USD line.

**Ticker:** CMXC.L (alternative — iShares Capped Acc)
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points; fund inception 2010)
- **Actual UCITS?:** yes (iShares VII PLC, Ireland)
- **Real TER:** 0.65%
- **Acc/Dist:** Acc (Yahoo longName: "USD Acc")
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **Notes:** ISIN IE00B5WHFQ43. iShares MSCI Mexico Capped UCITS ETF USD Acc. "Capped" version applies single-issuer cap (vs uncapped Xtrackers). Same TER, same currency, very similar profile. CMX1.L is the GBp line of the same fund. Either CMXC.L or XMES.L is fine — CMXC.L is more conservative (capped), XMES.L is more representative of unconstrained MSCI Mexico.

**Ticker:** XMEX.L (alternative — Xtrackers GBp line)
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Notes:** Same fund as XMES.L but GBp trading line. Use XMES.L for USD.

---

### Saudi Arabia

**Ticker:** IKSA.L (recommended primary)
- **Status:** VERIFIED
- **Yahoo:** works (~7.1y, 1796 points; listed Apr 2019)
- **Actual UCITS?:** yes (iShares Ireland)
- **Real TER:** 0.50%
- **Acc/Dist:** Acc (Yahoo longName: "USD (Acc)")
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE00BYYR0489. iShares MSCI Saudi Arabia Capped UCITS ETF USD Acc. Tracks Saudi large/mid caps (Saudi Aramco — capped, Al Rajhi Bank, STC, SABIC, Saudi National Bank). "Capped" applies a 20% single-issuer cap to avoid Aramco dominating. ~7y of history clears the 2y minimum comfortably. **The only well-established UCITS Saudi/MENA ETF** — no Qatar/UAE single-country UCITS funds with comparable history exist. IKSD.L is the Dist sister, IUSW.DE is the Xetra EUR line.

---

## Summary of corrections vs initial assumptions

| User-suggested ticker | Verdict | Recommendation |
|---|---|---|
| `EXCS.L` for EM ex-China | Real, Acc, but only 4y data and GBP trading | **Prefer EMXC.L** (Amundi, ~7y data, USD trading) |
| `XFVT.DE` for Vietnam | Real but Yahoo shows Nov 2023 inception for the Xetra line (under-2y) | **Use XVTD.L instead** — same fund, USD on LSE, 10y of daily Yahoo history |
| `IBZL.L` for Brazil | Real, but **Dist** not Acc | **Prefer XMBR.L** (Xtrackers Acc, 10y) or RIOL.L (Amundi Acc, cheaper but shorter history) |
| `IMXX.L` for Mexico | **Does not exist** on Yahoo | **Use XMES.L** (Xtrackers USD Acc, LSE) or CMXC.L (iShares Capped USD Acc, LSE) |
| Saudi optional | IKSA.L is a real, established 7y+ UCITS — include it | **IKSA.L** confirmed |

Tickers checked that **do not exist** as UCITS on LSE/Xetra (don't fabricate): IKRA.L, IKRE.L, IKOR.DE, ITKA.L, ITWA.L, ITWN.DE, IBZA.L, IBZL.DE, IMXX.L, IMEX.DE, MEXX.L, ISAU.L, IGSA.L, EMXS.L, EXCH.L.

---

## Ready to seed

Recommended primary ticker per theme, with metadata for the seed file. All Acc, all UCITS, all on LSE in USD where available, all with 2+ years of Yahoo data.

| # | Ticker | Nickname | Short description | Theme / category | Risk | Emoji | Acc/Dist | Domicile | Exchange | Currency | TER | Yahoo history |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | CSKR.L | Korean stocks (Samsung, Hyundai) | Tracks MSCI Korea — Samsung Electronics, SK Hynix, Hyundai Motor, LG Energy Solution and other large Korean companies. | region | 5 | 🇰🇷 | Acc | Ireland | LSE | USD | 0.74% | 10y |
| 2 | XMTW.L | Taiwanese stocks (TSMC-heavy) | Tracks MSCI Taiwan — dominated by TSMC (~50%), plus Hon Hai, MediaTek and other Taiwanese tech and industrials. | region | 5 | 🇹🇼 | Acc | Luxembourg | LSE | GBp | 0.65% | 10y |
| 3 | EMXC.L | Emerging markets, without China | Broad emerging-market exposure (India, Korea, Taiwan, Brazil, Saudi, Mexico…) with mainland China and Hong Kong excluded. | broad_market | 4 | 🌐 | Acc | Luxembourg | LSE | USD | 0.18% | 6.9y |
| 4 | XVTD.L | Vietnamese stocks (swap-based) | Tracks FTSE Vietnam via a synthetic swap (Vinhomes, Hoa Phat, Vingroup, Masan, Vietcombank) — direct foreign ownership of Vietnam equities is restricted, so this fund uses derivatives. | region | 5 | 🇻🇳 | Acc | Luxembourg | LSE | USD | 0.85% | 10y |
| 5 | XMBR.L | Brazilian stocks (Vale, Petrobras) | Tracks MSCI Brazil — Vale, Petrobras, Itaú, B3 and other large Brazilian companies; commodity-heavy. | region | 5 | 🇧🇷 | Acc | Luxembourg | LSE | GBp | 0.65% | 10y |
| 6 | XMES.L | Mexican stocks (América Móvil, Walmex) | Tracks MSCI Mexico — América Móvil, Walmart de México, FEMSA, Banorte and other large Mexican companies. | region | 5 | 🇲🇽 | Acc | Luxembourg | LSE | USD | 0.65% | 10y |
| 7 | IKSA.L | Saudi Arabian stocks (Aramco capped) | Tracks MSCI Saudi Arabia Capped — Saudi Aramco (capped at 20%), Al Rajhi Bank, STC, SABIC and other Saudi large caps. | region | 5 | 🇸🇦 | Acc | Ireland | LSE | USD | 0.50% | 7.1y |

### Seed-file ready snippet (suggested fields)

```jsonc
[
  {
    "ticker": "CSKR.L",
    "nickname": "Korean stocks (Samsung, Hyundai)",
    "short_description": "Tracks MSCI Korea — Samsung Electronics, SK Hynix, Hyundai Motor, LG Energy Solution and other large Korean companies.",
    "category": "region",
    "risk": 5,
    "emoji": "🇰🇷",
    "acc_dist": "Acc",
    "domicile": "Ireland",
    "exchange": "LSE",
    "currency": "USD",
    "ter": 0.0074,
    "isin": "IE00B0M63391"
  },
  {
    "ticker": "XMTW.L",
    "nickname": "Taiwanese stocks (TSMC-heavy)",
    "short_description": "Tracks MSCI Taiwan — dominated by TSMC (~50%), plus Hon Hai, MediaTek and other Taiwanese tech and industrials.",
    "category": "region",
    "risk": 5,
    "emoji": "🇹🇼",
    "acc_dist": "Acc",
    "domicile": "Luxembourg",
    "exchange": "LSE",
    "currency": "GBp",
    "ter": 0.0065,
    "isin": "LU0292109187"
  },
  {
    "ticker": "EMXC.L",
    "nickname": "Emerging markets, without China",
    "short_description": "Broad emerging-market exposure (India, Korea, Taiwan, Brazil, Saudi, Mexico…) with mainland China and Hong Kong excluded.",
    "category": "broad_market",
    "risk": 4,
    "emoji": "🌐",
    "acc_dist": "Acc",
    "domicile": "Luxembourg",
    "exchange": "LSE",
    "currency": "USD",
    "ter": 0.0018,
    "isin": "LU1681045370"
  },
  {
    "ticker": "XVTD.L",
    "nickname": "Vietnamese stocks (swap-based)",
    "short_description": "Tracks FTSE Vietnam via a synthetic swap (Vinhomes, Hoa Phat, Vingroup, Masan, Vietcombank) — direct foreign ownership of Vietnam equities is restricted, so this fund uses derivatives.",
    "category": "region",
    "risk": 5,
    "emoji": "🇻🇳",
    "acc_dist": "Acc",
    "domicile": "Luxembourg",
    "exchange": "LSE",
    "currency": "USD",
    "ter": 0.0085,
    "isin": "LU0322252924"
  },
  {
    "ticker": "XMBR.L",
    "nickname": "Brazilian stocks (Vale, Petrobras)",
    "short_description": "Tracks MSCI Brazil — Vale, Petrobras, Itaú, B3 and other large Brazilian companies; commodity-heavy.",
    "category": "region",
    "risk": 5,
    "emoji": "🇧🇷",
    "acc_dist": "Acc",
    "domicile": "Luxembourg",
    "exchange": "LSE",
    "currency": "GBp",
    "ter": 0.0065,
    "isin": "LU0292109344"
  },
  {
    "ticker": "XMES.L",
    "nickname": "Mexican stocks (América Móvil, Walmex)",
    "short_description": "Tracks MSCI Mexico — América Móvil, Walmart de México, FEMSA, Banorte and other large Mexican companies.",
    "category": "region",
    "risk": 5,
    "emoji": "🇲🇽",
    "acc_dist": "Acc",
    "domicile": "Luxembourg",
    "exchange": "LSE",
    "currency": "USD",
    "ter": 0.0065,
    "isin": "LU0476289466"
  },
  {
    "ticker": "IKSA.L",
    "nickname": "Saudi Arabian stocks (Aramco capped)",
    "short_description": "Tracks MSCI Saudi Arabia Capped — Saudi Aramco (capped at 20%), Al Rajhi Bank, STC, SABIC and other Saudi large caps.",
    "category": "region",
    "risk": 5,
    "emoji": "🇸🇦",
    "acc_dist": "Acc",
    "domicile": "Ireland",
    "exchange": "LSE",
    "currency": "USD",
    "ter": 0.0050,
    "isin": "IE00BYYR0489"
  }
]
```

---

## Open flags / things to confirm before publishing

1. **TERs:** The Xtrackers TERs (XMTW.L 0.65%, XKS2.L ~0.65%, XMBR.L 0.65%, XMES.L 0.65%, XVTD.L 0.85%) are based on long-standing published levels but Xtrackers has cut fees on several country ETFs in recent years — confirm against current KIIDs. Same for Amundi EMXC.L (0.18% is the published headline). iShares CSKR.L 0.74% and IKSA.L 0.50% are from recent issuer pages.
2. **GBp trading lines:** XMTW.L (Taiwan) and XMBR.L (Brazil) only trade in GBp on LSE — no USD line. For an SGD-base investor on IBKR this adds a GBP↔SGD FX hop on each trade. If that's unacceptable, alternatives: Franklin FTSE Taiwan FLXT.L (USD, ~3y history, FTSE methodology not MSCI) for Taiwan; Amundi RIOL.L for Brazil is also GBp. Brazil USD-on-LSE simply does not exist among UCITS funds in 2026. Mexico is fine — XMES.L is in USD.
3. **Vietnam swap-based:** XVTD.L uses a swap to replicate FTSE Vietnam exposure due to Vietnamese ownership restrictions. This adds counterparty risk (DWS posts collateral, but it's not physical replication). Flag prominently in the UI ("synthetic / swap-based") and in the risk explainer.
4. **Saudi geopolitical/concentration risk:** IKSA.L is "Capped" because Aramco would otherwise dominate. Even capped, the index is heavily financial-services + energy weighted. Mention in the description.
5. **Korea ticker name on Yahoo:** CSKR.L shows up as "iShares VII PLC — iShares MSCI Korea UCITS ETF USD (Acc)" — the "VII PLC" is the umbrella ICAV name; the actual product is "iShares MSCI Korea UCITS ETF USD Acc". Use the cleaner name in the UI.
6. **All Xtrackers funds in this set are synthetic/swap-replicated by default** for tax-efficiency reasons (no withholding tax leakage on dividends). For most users this is a feature, not a bug, but it's worth flagging that XMTW.L, XKS2.L, XMBR.L, XMES.L, XVTD.L use derivative replication. iShares funds (CSKR.L, IKSA.L, CMXC.L) use physical replication.
