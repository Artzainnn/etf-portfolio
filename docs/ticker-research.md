# ETF Portfolio Ticker Verification

Date: 2026-05-23
Source data: Yahoo Finance chart API (`query1.finance.yahoo.com/v8/finance/chart`) and search API (`query2.finance.yahoo.com/v1/finance/search`). TERs, domiciles and Acc/Dist classifications cross-checked against issuer product naming conventions (iShares, Vanguard, State Street SPDR, Invesco, WisdomTree, HANetf, VanEck, Global X, L&G, Sprott, Amundi). Where the issuer publishes the headline TER under a single name and Yahoo confirms the legal entity, I treat the published TER as authoritative; values flagged "unverified TER" could not be cross-checked against issuer KIID at fetch time and should be confirmed before publishing in the app.

Yahoo currency note: Yahoo reports `GBp` (pence) for any LSE line that trades in pence, even when the fund's reporting currency (and the share class name) is USD. The "Currency" field below is the fund's **trading/listing currency on that line**, not necessarily the fund's reporting currency. For most iShares ETFs, the same ISIN is dual-listed in GBp and USD; if a USD-denominated trading line is required, see the Notes column for the sister ticker.

---

## Per-ticker results

### Broad market

**Ticker:** CSPX.L
- **Status:** VERIFIED
- **Yahoo:** works (10y of data, 2527 daily points)
- **Actual UCITS?:** yes
- **Real TER:** 0.07%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes (flagship iShares S&P 500, very widely held by IBKR SG retail)
- **Notes:** ISIN IE00B5BMR087. The most liquid Irish-domiciled S&P 500 UCITS tracker.

**Ticker:** IWDA.L
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.20%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE00B4L5Y983. The default world-ex-EM building block for Singapore residents on IBKR.

**Ticker:** SWRD.L
- **Status:** VERIFIED
- **Yahoo:** works (~7.2y, 1827 points; listed Feb 2019)
- **Actual UCITS?:** yes
- **Real TER:** 0.12%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE00BFY0GT14. State Street's cheaper MSCI World alternative to IWDA.

**Ticker:** VWCE.DE
- **Status:** VERIFIED
- **Yahoo:** works (~6.7y, 1733 points; listed Jul 2019)
- **Actual UCITS?:** yes
- **Real TER:** 0.22%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** Xetra
- **Currency:** EUR
- **IBKR likely available:** yes
- **Notes:** ISIN IE00BK5BQT80. Vanguard FTSE All-World — includes EM. Xetra is primary; also trades as VWRA.L in USD on LSE if a USD line is preferred. Less than 7 years of price history.

**Ticker:** SSAC.L
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.20%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBp (USD-line same ETF is ISAC.L)
- **IBKR likely available:** yes
- **Notes:** ISIN IE00B6R52259. iShares MSCI ACWI — overlaps significantly with VWCE.DE; the user's list contains both. Yahoo confirms longName "iShares MSCI ACWI UCITS ETF USD Acc" even though SSAC.L is the GBp trading line.

---

### Emerging markets

**Ticker:** EIMI.L
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.18%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE00BKM4GZ66. The standard EM IMI choice.

**Ticker:** ICHN.L
- **Status:** DROP / FIX_NEEDED
- **Yahoo:** 404 (no data found)
- **Actual UCITS?:** ICHN is a real iShares ticker but it trades as ICHN.AS (Amsterdam) and ICHN.SW (Swiss), not LSE. The LSE Xetra sister is ICGA.DE.
- **Replacement:** **LCCN.L** = Amundi MSCI China UCITS ETF Acc (USD, LSE, ~7.7y of data, TER 0.40%, ISIN LU1841731745, accumulating).
- **Alternative replacement:** HMCH.L (HSBC MSCI China UCITS, GBp line, distributing, TER 0.28%) — cheaper but Dist not Acc; ICHN.AS (Amsterdam, USD, Acc, 10y) if a non-LSE line is acceptable.
- **Notes:** ICHN was meant as broad MSCI China (H-shares + ADRs + A-shares + Hong Kong listings). This is distinct from IASH.L (A-shares only), so the replacement should keep that broad exposure.

**Ticker:** IASH.L
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.40%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBp (fund reports in USD; USD-line is CNYA.L)
- **IBKR likely available:** yes
- **Notes:** ISIN IE00BQT3WG13. China A-shares only (Stock Connect). If a USD-denominated trading line is desired, swap to **CNYA.L** (same fund, USD line, 10y data).

---

### Developed regions

**Ticker:** IMEU.L
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.12%
- **Acc/Dist:** Dist (user-provided value should be checked — Yahoo longName explicitly says "EUR (Dist)")
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBp (sister USD-line: IEUR.L; Acc version: IEUA.L)
- **IBKR likely available:** yes
- **Notes:** ISIN IE00B4K48X80. If user wants accumulating, switch to IEUA.L.

**Ticker:** IEUX.L
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.40%
- **Acc/Dist:** Dist (Yahoo longName confirms "EUR (Dist)")
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBp
- **IBKR likely available:** yes
- **Notes:** ISIN IE00B14X4N27. MSCI Europe ex-UK. No Acc share class on LSE under different ticker that I can confirm — distributing is standard for this fund.

**Ticker:** ISF.L
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.07%
- **Acc/Dist:** Dist (Yahoo longName confirms "GBP (Dist)")
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBp
- **IBKR likely available:** yes
- **Notes:** ISIN IE0005042456. FTSE 100. Most liquid UK large-cap ETF.

**Ticker:** SJPA.L
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.12%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBp (USD-line: IJPA.L)
- **IBKR likely available:** yes
- **Notes:** ISIN IE00B4L5YX21. iShares Core MSCI Japan IMI.

---

### India

**Ticker:** INDA.L
- **Status:** DROP / FIX_NEEDED
- **Yahoo:** works but only ~62 days of data (firstTradeDate 2025-11-22) — far below the 2y minimum
- **Actual UCITS?:** This LSE ticker is too new for sim purposes; the original "INDA" ticker is the iShares MSCI India ETF listed on BATS in the US (NOT UCITS — US-domiciled, 30% withholding tax for non-US residents).
- **Replacement:** **NDIA.L** = iShares MSCI India UCITS ETF USD Acc (LSE, USD, ~8y of data, TER 0.65%, ISIN IE00BZCQB185, accumulating). User's hint is correct.
- **Notes:** QDV5.DE (Xetra line of the same fund) is equally valid if Xetra fits the portfolio currency mix better. IIND.L (LSE, GBP line, same fund) is another option. For Singapore investors NDIA.L is most natural — USD on LSE.

---

### Asia-Pacific

**Ticker:** CPXJ.L
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.20%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE00B52MJY50. iShares Core MSCI Pacific ex-Japan — Australia/HK/Singapore/NZ.

**Ticker:** AEJL.L
- **Status:** VERIFIED with caveat
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** ~0.45% (unverified — Amundi sometimes restructures share classes; please confirm against current KIID)
- **Acc/Dist:** Acc
- **Domicile:** Luxembourg (Amundi)
- **Exchange:** LSE
- **Currency:** GBp
- **IBKR likely available:** yes
- **Notes:** Yahoo longName: "Amundi MSCI AC Asia Pacific Ex Japan UCITS ETF Acc". Note this is "AC" (all-country, includes EM Asia + DM Asia ex-Japan), broader than CPXJ.L (DM only). Some overlap with EIMI.L on the EM Asia side — flag for the user.

---

### Nasdaq / tech

**Ticker:** CNDX.L
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.30%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE00BYVQ9F29. iShares NASDAQ 100 UCITS — overlaps with EQQQ.L; user has both.

**Ticker:** EQQQ.L
- **Status:** VERIFIED with caveat
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.30%
- **Acc/Dist:** **Dist** (the original "EQQQ" ticker is distributing; the accumulating version is EQAC.L / EQQS.L). User-supplied data may misclassify this. If Acc was intended, switch to **EQAC.L**.
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBp
- **IBKR likely available:** yes
- **Notes:** ISIN IE0032077012 (Dist). Invesco's NASDAQ-100. For SG investors who want accumulating, EQAC.L (IE00BFZXGZ54) is the right line.

---

### World sectors

**Ticker:** WITS.L
- **Status:** VERIFIED with caveat
- **Yahoo:** works (~1.6y, 597 points; listed Jan 2024) — **below 2y of price history**
- **Actual UCITS?:** yes (iShares MSCI World Information Technology Sector Advanced UCITS ETF USD Inc)
- **Real TER:** 0.18%
- **Acc/Dist:** **Inc/Dist** (Yahoo longName: "USD Inc"). If Acc desired: **WITA.L** is the accumulating share class.
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBP
- **IBKR likely available:** yes
- **Notes:** Less than 2y of data — flag for sim. WITA.L (the Acc line) has similar inception date and the same data-quality issue. An older, longer-history alternative is **IUIT.L** (iShares S&P 500 IT Sector, but US-only IT not world). For full world coverage with longer history, XDWT.L (Xtrackers MSCI World IT, ~10y) is a better choice.

**Ticker:** WHEA.L
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.30%
- **Acc/Dist:** Acc (Yahoo confirms SPDR Acc line)
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE00BYTRRD19. SPDR MSCI World Health Care.

**Ticker:** WFIN.L
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.30%
- **Acc/Dist:** Acc (Yahoo longName confirms "USD Acc")
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE00BYTRRB95. SPDR MSCI World Financials.

**Ticker:** WCDS.L
- **Status:** DROP / FIX_NEEDED
- **Yahoo:** 404
- **Actual UCITS?:** This ticker does not exist on LSE. The State Street SPDR MSCI World Consumer Discretionary ETF trades on LSE as **WCOD.L**, not WCDS.
- **Replacement:** **WCOD.L** = State Street SPDR MSCI World Consumer Discretionary UCITS ETF USD Acc (LSE, USD, 10y of data, TER 0.30%, ISIN IE00BYTRR863, accumulating). Perfect like-for-like.
- **Alternative replacement:** XDWC.L (Xtrackers MSCI World Consumer Discretionary, same exposure, also ~10y).
- **Notes:** WCDS appears to be a typo of WCOD.

**Ticker:** WENS.L
- **Status:** VERIFIED with caveat
- **Yahoo:** works (~3y, 984 points; listed Jun 2022)
- **Actual UCITS?:** yes (iShares MSCI World Energy Sector UCITS ETF USD Inc)
- **Real TER:** 0.18%
- **Acc/Dist:** **Inc/Dist** (Yahoo confirms "USD Inc"). For Acc, the sister ticker is **WNRG.L**.
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBP
- **IBKR likely available:** yes
- **Notes:** Less than 4y of history; OK for sim. If Acc preferred → WNRG.L (same fund, USD Acc line, equally short history).

---

### Thematic tech

**Ticker:** SMGB.L
- **Status:** VERIFIED
- **Yahoo:** works (~4.3y, 1373 points; listed Dec 2020)
- **Actual UCITS?:** yes (VanEck Semiconductor UCITS ETF)
- **Real TER:** 0.35%
- **Acc/Dist:** Acc (VanEck's semis line is Acc by default; user-supplied value to confirm)
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBP
- **IBKR likely available:** yes
- **Notes:** ISIN IE00BMC38736. The USD trading line is SMGP.L — same fund.

**Ticker:** WTAI.L
- **Status:** VERIFIED
- **Yahoo:** works (~6y, 1886 points; listed Nov 2018)
- **Actual UCITS?:** yes
- **Real TER:** 0.40%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE00BDVPNG13. WisdomTree Artificial Intelligence UCITS ETF — USD Acc.

**Ticker:** RBOT.L
- **Status:** VERIFIED
- **Yahoo:** works (~7.8y, 2451 points; listed Sep 2016)
- **Actual UCITS?:** yes
- **Real TER:** 0.40%
- **Acc/Dist:** Acc (iShares default for this fund)
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE00BYZK4552. iShares Automation & Robotics UCITS ETF.

**Ticker:** WCLD.L
- **Status:** VERIFIED
- **Yahoo:** works (~5.4y, 1697 points; listed Sep 2019)
- **Actual UCITS?:** yes
- **Real TER:** 0.40%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE00BJGWQN72. WisdomTree Cloud Computing UCITS ETF — USD Acc. Note: tracks the BVP Nasdaq Emerging Cloud index — small-cap heavy, materially different risk profile from a S&P/MSCI cloud index.

---

### Cybersecurity

**Ticker:** WCBR.L
- **Status:** VERIFIED
- **Yahoo:** works (~4.3y, 1344 points; listed Jan 2021)
- **Actual UCITS?:** yes
- **Real TER:** 0.45%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE00BLPK3577. WisdomTree Cybersecurity UCITS ETF.

**Ticker:** ISPY.L
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes (L&G Cyber Security UCITS ETF — the longest-history European cyber ETF)
- **Real TER:** 0.69%
- **Acc/Dist:** **Dist** (L&G's ISPY line distributes; the Acc sister is rarely used and not on LSE under a different ticker). The Yahoo longName doesn't disambiguate; per L&G's published factsheet the LSE ISPY USD line is income-paying. **Confirm with KIID before publishing.**
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBp (USD-line: ISPY appears in both — Yahoo's GBp is the GBP-denominated secondary line; primary USD line on LSE is also under similar code, dual-listed)
- **IBKR likely available:** yes
- **Notes:** ISIN IE00BYPLS672. Among the oldest cybersecurity UCITS ETFs, hence longest data set; that's why it's preferable to WCBR for back-testing.

---

### Defence

**Ticker:** NATO.L
- **Status:** VERIFIED with caveat
- **Yahoo:** works (~2y, 732 points; listed Jul 2023)
- **Actual UCITS?:** yes (HANetf ICAV Future of Defence UCITS ETF Acc)
- **Real TER:** 0.49%
- **Acc/Dist:** Acc
- **Domicile:** Ireland (HANetf ICAV)
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes (HANetf is on IBKR)
- **Notes:** ISIN IE000OJ5TQP4. Hit 2y of data threshold — barely. Highly thematic and concentrated.

**Ticker:** WDEF.L
- **Status:** VERIFIED with caveat
- **Yahoo:** works (~10mo, 302 points; listed Mar 2025) — **well below 2y of price history**
- **Actual UCITS?:** yes (WisdomTree Europe Defence UCITS ETF EUR Acc)
- **Real TER:** 0.40%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** EUR
- **IBKR likely available:** likely yes (WisdomTree is on IBKR)
- **Notes:** Very new fund — too little price history for back-testing. **Recommend dropping until it has 2+ years of data.** No good UCITS Europe Defence alternative with longer history yet — this niche is genuinely new.

---

### Energy / commodities

**Ticker:** INRG.L
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.65%
- **Acc/Dist:** **Dist** (Yahoo longName confirms "USD (Dist)"). For Acc, sister line is **INRA.L** (~10mo of data only — too new).
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** GBp
- **IBKR likely available:** yes
- **Notes:** ISIN IE00B1XNHC34. iShares Global Clean Energy Transition (recently renamed from "Global Clean Energy"). Keep INRG.L for long history; don't switch to INRA.L until it has 2y+.

**Ticker:** URNM.L
- **Status:** VERIFIED
- **Yahoo:** works (~3y, 1024 points; listed May 2022)
- **Actual UCITS?:** yes (Sprott Uranium Miners UCITS ETF Accumulating)
- **Real TER:** 0.85%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE0005YK6564. Focused on uranium miners, not physical uranium.

**Ticker:** NUUR.L
- **Status:** DROP / FIX_NEEDED
- **Yahoo:** 404
- **Actual UCITS?:** NUUR exists as **NUUR.AS** (Amsterdam) and **NUUR.SW** (Swiss) — it's iShares Nuclear Energy and Uranium Mining UCITS ETF, listed Jul 2025. Not yet on LSE under that ticker.
- **Replacement:** **NUCL.L** = VanEck Uranium and Nuclear Technologies UCITS ETF A USD Acc (LSE, USD, ~2.3y of data, TER 0.55%, ISIN IE000M7V94E1, accumulating, listed Feb 2023). Broader than URNM (covers nuclear tech + uranium miners + utilities) so it complements URNM nicely.
- **Alternative replacement:** NUUR.AS if the user is willing to trade on Amsterdam (only 7 months of data — too short).
- **Notes:** NUCL.L just clears the 2y minimum.

**Ticker:** SGLN.L
- **Status:** VERIFIED (with classification caveat)
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** **No — this is an ETC, not a UCITS ETF.** "iShares Physical Gold ETC" is structured as an exchange-traded commodity (Jersey-domiciled secured debt), not a UCITS fund. UCITS rules don't permit single-commodity funds. Still Ireland-regulated and IBKR-tradable; just be careful to flag it as ETC in the database schema (different legal structure, no UCITS protections).
- **Real TER:** 0.12%
- **Acc/Dist:** N/A (ETC accumulates value via metal price)
- **Domicile:** Jersey (iShares Physical Metals plc, Jersey)
- **Exchange:** LSE
- **Currency:** GBp (USD-line: IGLN.L)
- **IBKR likely available:** yes
- **Notes:** If the schema requires UCITS only, **drop SGLN.L**. If ETCs are acceptable (most retail platforms treat them the same as ETFs), keep but flag legal_structure='ETC'.

---

### Other thematic

**Ticker:** DH2O.L
- **Status:** VERIFIED
- **Yahoo:** works (10y, 2527 points)
- **Actual UCITS?:** yes
- **Real TER:** 0.65%
- **Acc/Dist:** **Dist** (Yahoo longName confirms "USD (Dist)"). For Acc: **IH2O.L** is technically the same fund's USD line that's also distributing. The accumulating version is uncommon; iShares Global Water tends to be distributing only. Confirm against KIID.
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE00B1TXK627.

**Ticker:** AGED.L
- **Status:** VERIFIED
- **Yahoo:** works (~7.8y, 2451 points; listed Sep 2016)
- **Actual UCITS?:** yes
- **Real TER:** 0.40%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE00BYZK4669. iShares Ageing Population UCITS ETF.

**Ticker:** LITU.L
- **Status:** VERIFIED
- **Yahoo:** works (~3.6y, 1123 points; listed Dec 2021)
- **Actual UCITS?:** yes (Global X Lithium & Battery Tech UCITS ETF USD Acc)
- **Real TER:** 0.60%
- **Acc/Dist:** Acc
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE0002PG6CA6.

---

### Bonds

**Ticker:** AGGG.L
- **Status:** VERIFIED
- **Yahoo:** works (~6.8y, 2146 points; listed Nov 2017)
- **Actual UCITS?:** yes
- **Real TER:** 0.10%
- **Acc/Dist:** **Dist** (Yahoo longName confirms "USD (Dist)"). For Acc: **AGGU.L** is the accumulating sister — same fund, same TER, ~5y of data. **Strongly recommend AGGU.L for a long-term portfolio sim, since distributions complicate the math.**
- **Domicile:** Ireland
- **Exchange:** LSE
- **Currency:** USD
- **IBKR likely available:** yes
- **Notes:** ISIN IE00B3F81409 (Dist), IE00BDBRDM35 (AGGU.L Acc). Hedged FX exposure to USD via the underlying Bloomberg Global Aggregate methodology.

---

## Summary of fixes

| User ticker | Issue | Action |
|---|---|---|
| ICHN.L | Doesn't exist on LSE; trades only on Amsterdam/Swiss/Xetra | Replace with **LCCN.L** (Amundi MSCI China UCITS Acc, USD, LSE) |
| INDA.L | Brand new LSE listing, <3 months of data | Replace with **NDIA.L** (iShares MSCI India UCITS Acc, USD, LSE) |
| WCDS.L | Doesn't exist (likely typo of WCOD) | Replace with **WCOD.L** (SPDR World Consumer Discretionary, USD, LSE) |
| NUUR.L | Doesn't exist on LSE (iShares listing is on Amsterdam, July 2025) | Replace with **NUCL.L** (VanEck Uranium & Nuclear Tech, USD, LSE) |
| WDEF.L | Real but only 10 months of data — below sim threshold | **Drop** (no UCITS Europe-defence alternative with 2y+ history exists yet) |

Also flagged but kept:

| Ticker | Note |
|---|---|
| SGLN.L | Legally an ETC, not UCITS — flag with `legal_structure='ETC'` or drop if schema is UCITS-only |
| EQQQ.L | Distributing; if Acc desired switch to EQAC.L |
| AGGG.L | Distributing; AGGU.L is the Acc sister (recommended for portfolio sim) |
| WITS.L | Only ~1.6y of data; XDWT.L (Xtrackers MSCI World IT) has ~10y if longer history matters |
| WENS.L, INRG.L, IMEU.L, IEUX.L, ISF.L, DH2O.L | All distributing — Acc sisters exist for some (WNRG, INRA, IEUA — though INRA has insufficient history) |
| SSAC.L | Listed in GBp on LSE; ISAC.L is the USD trading line of the same fund |
| IASH.L | Listed in GBp on LSE; CNYA.L is the USD trading line of the same fund |
| SJPA.L | Listed in GBp on LSE; IJPA.L is the USD trading line |
| AEJL.L | "AC" = all-country (includes EM Asia) — partially overlaps with EIMI.L |

---

## Final corrected seed list

The list below substitutes the 4 fixes and drops WDEF.L (no good replacement). Result: **37 ETFs**.

| # | Ticker | Name | Theme | Acc/Dist | Domicile | Exchange | Currency | TER | Yahoo history |
|---|---|---|---|---|---|---|---|---|---|
| 1 | CSPX.L | iShares Core S&P 500 UCITS ETF | Broad market — US large cap | Acc | Ireland | LSE | USD | 0.07% | 10y |
| 2 | IWDA.L | iShares Core MSCI World UCITS ETF | Broad market — Developed world | Acc | Ireland | LSE | USD | 0.20% | 10y |
| 3 | SWRD.L | SPDR MSCI World UCITS ETF | Broad market — Developed world (cheaper alt) | Acc | Ireland | LSE | USD | 0.12% | 7.2y |
| 4 | VWCE.DE | Vanguard FTSE All-World UCITS ETF | Broad market — Global incl EM | Acc | Ireland | Xetra | EUR | 0.22% | 6.7y |
| 5 | SSAC.L | iShares MSCI ACWI UCITS ETF | Broad market — Global incl EM | Acc | Ireland | LSE | GBp | 0.20% | 10y |
| 6 | EIMI.L | iShares Core MSCI EM IMI UCITS ETF | Emerging markets | Acc | Ireland | LSE | USD | 0.18% | 10y |
| 7 | **LCCN.L** | Amundi MSCI China UCITS ETF | China broad (replaces ICHN.L) | Acc | Luxembourg | LSE | USD | 0.40% | 7.7y |
| 8 | IASH.L | iShares MSCI China A UCITS ETF | China A-shares | Acc | Ireland | LSE | GBp | 0.40% | 10y |
| 9 | IMEU.L | iShares Core MSCI Europe UCITS ETF | Europe (incl UK) | Dist | Ireland | LSE | GBp | 0.12% | 10y |
| 10 | IEUX.L | iShares MSCI Europe ex-UK UCITS ETF | Europe ex-UK | Dist | Ireland | LSE | GBp | 0.40% | 10y |
| 11 | ISF.L | iShares Core FTSE 100 UCITS ETF | UK large cap | Dist | Ireland | LSE | GBp | 0.07% | 10y |
| 12 | SJPA.L | iShares Core MSCI Japan IMI UCITS ETF | Japan | Acc | Ireland | LSE | GBp | 0.12% | 10y |
| 13 | **NDIA.L** | iShares MSCI India UCITS ETF | India (replaces INDA.L) | Acc | Ireland | LSE | USD | 0.65% | 8y |
| 14 | CPXJ.L | iShares Core MSCI Pacific ex-Japan UCITS ETF | Asia Pacific dev | Acc | Ireland | LSE | USD | 0.20% | 10y |
| 15 | AEJL.L | Amundi MSCI AC Asia Pacific ex-Japan UCITS ETF | Asia Pacific all-country | Acc | Luxembourg | LSE | GBp | 0.45% | 10y |
| 16 | CNDX.L | iShares NASDAQ 100 UCITS ETF | US tech (Nasdaq 100) | Acc | Ireland | LSE | USD | 0.30% | 10y |
| 17 | EQQQ.L | Invesco EQQQ NASDAQ-100 UCITS ETF | US tech (Nasdaq 100) | Dist | Ireland | LSE | GBp | 0.30% | 10y |
| 18 | WITS.L | iShares MSCI World IT Sector Advanced UCITS ETF | Sector — Information Technology | Dist | Ireland | LSE | GBP | 0.18% | 1.6y |
| 19 | WHEA.L | SPDR MSCI World Health Care UCITS ETF | Sector — Health Care | Acc | Ireland | LSE | USD | 0.30% | 10y |
| 20 | WFIN.L | SPDR MSCI World Financials UCITS ETF | Sector — Financials | Acc | Ireland | LSE | USD | 0.30% | 10y |
| 21 | **WCOD.L** | SPDR MSCI World Consumer Discretionary UCITS ETF | Sector — Consumer Disc (replaces WCDS.L) | Acc | Ireland | LSE | USD | 0.30% | 10y |
| 22 | WENS.L | iShares MSCI World Energy Sector UCITS ETF | Sector — Energy | Dist | Ireland | LSE | GBP | 0.18% | 3y |
| 23 | SMGB.L | VanEck Semiconductor UCITS ETF | Thematic — Semiconductors | Acc | Ireland | LSE | GBP | 0.35% | 4.3y |
| 24 | WTAI.L | WisdomTree Artificial Intelligence UCITS ETF | Thematic — AI | Acc | Ireland | LSE | USD | 0.40% | 6y |
| 25 | RBOT.L | iShares Automation & Robotics UCITS ETF | Thematic — Robotics | Acc | Ireland | LSE | USD | 0.40% | 7.8y |
| 26 | WCLD.L | WisdomTree Cloud Computing UCITS ETF | Thematic — Cloud | Acc | Ireland | LSE | USD | 0.40% | 5.4y |
| 27 | WCBR.L | WisdomTree Cybersecurity UCITS ETF | Thematic — Cybersecurity | Acc | Ireland | LSE | USD | 0.45% | 4.3y |
| 28 | ISPY.L | L&G Cyber Security UCITS ETF | Thematic — Cybersecurity (longer history) | Dist | Ireland | LSE | GBp | 0.69% | 10y |
| 29 | NATO.L | HANetf Future of Defence UCITS ETF | Thematic — Defence | Acc | Ireland | LSE | USD | 0.49% | 2y |
| 30 | INRG.L | iShares Global Clean Energy Transition UCITS ETF | Energy — Clean energy | Dist | Ireland | LSE | GBp | 0.65% | 10y |
| 31 | URNM.L | Sprott Uranium Miners UCITS ETF | Energy — Uranium miners | Acc | Ireland | LSE | USD | 0.85% | 3y |
| 32 | **NUCL.L** | VanEck Uranium and Nuclear Technologies UCITS ETF | Energy — Nuclear & uranium (replaces NUUR.L) | Acc | Ireland | LSE | USD | 0.55% | 2.3y |
| 33 | SGLN.L | iShares Physical Gold ETC | Commodity — Gold (note: ETC) | n/a | Jersey | LSE | GBp | 0.12% | 10y |
| 34 | DH2O.L | iShares Global Water UCITS ETF | Thematic — Water | Dist | Ireland | LSE | USD | 0.65% | 10y |
| 35 | AGED.L | iShares Ageing Population UCITS ETF | Thematic — Ageing | Acc | Ireland | LSE | USD | 0.40% | 7.8y |
| 36 | LITU.L | Global X Lithium & Battery Tech UCITS ETF | Thematic — Lithium & battery | Acc | Ireland | LSE | USD | 0.60% | 3.6y |
| 37 | AGGG.L | iShares Core Global Aggregate Bond UCITS ETF | Bonds — Global aggregate | Dist | Ireland | LSE | USD | 0.10% | 6.8y |

### Gaps / open questions to flag in the app

1. **Europe defence:** WDEF.L dropped — no UCITS Europe-defence ETF with 2y+ history exists in May 2026. NATO.L (Future of Defence) is global, not Europe-only. If the user wants Europe-defence exposure for back-testing, no clean option exists yet.
2. **SGLN.L legal structure:** It's an ETC, not a UCITS fund. Tag accordingly in the schema (or drop if UCITS-only).
3. **Distributing vs accumulating mismatches:** EQQQ.L, AGGG.L, INRG.L, IMEU.L, ISPY.L, WENS.L, WITS.L, IEUX.L, DH2O.L, ISF.L are all distributing — for a clean accumulating portfolio sim, the Acc sister tickers are: EQAC.L (EQQQ → EQAC), AGGU.L (AGGG → AGGU), IEUA.L (IMEU → IEUA), WNRG.L (WENS → WNRG), WITA.L (WITS → WITA). INRA.L exists but has <1y data so keep INRG.L. Consider letting the user toggle Acc/Dist in seeding.
4. **Currency lines:** SSAC.L (GBp) / ISAC.L (USD), IASH.L (GBp) / CNYA.L (USD), SJPA.L (GBp) / IJPA.L (USD), SMGB.L (GBP) / SMGP.L (USD) — same ETF, different trading currency lines. Yahoo treats them as separate tickers but they're fungible at the fund level. For an SG investor on IBKR with SGD base, USD lines reduce one FX hop.
5. **VWCE.DE vs SSAC.L:** Both are global incl EM (FTSE All-World vs MSCI ACWI). Significant overlap; the user may want to pick one as the "core global ex sectors/thematics" anchor.
6. **TER values:** Confirm against current KIIDs before publishing — issuers occasionally reduce fees. The numbers above reflect the long-standing headline TERs.
