/**
 * Beginner-friendly editorial content for each ETF.
 *
 * - `shortDescription`: 2–3 sentences in plain English. No jargon, no ticker
 *   codes, no unexplained index names. Written as if explaining to a friend
 *   who has never invested before.
 * - `pros`: 3 short bullets (≤ 12 words each) on what's good about owning it.
 * - `cons`: 3 short bullets (≤ 12 words each) on the downsides and risks.
 */

export interface EtfEditorial {
  shortDescription: string;
  pros: string[];
  cons: string[];
}

export const EDITORIAL: Record<string, EtfEditorial> = {
  // ─── New themes (luxury, real estate, dividends) ──────────────────────
  "LUXG.L": {
    shortDescription:
      "The luxury industry in one fund — LVMH, Hermès, Kering, Richemont, Estée Lauder, Ferrari. The thesis is that the wealthy keep getting richer and keep spending on premium brands. Heavily weighted toward European houses but includes US and Asian luxury too.",
    pros: [
      "Owns iconic brands with strong pricing power",
      "Diversified across European, US and Asian luxury",
      "Tends to do well in wealth bull markets",
    ],
    cons: [
      "Heavily sensitive to Chinese consumer spending",
      "Can drop 30%+ when luxury demand cools",
      "Higher fees (0.25%) than broad-market funds",
    ],
  },
  "IWDP.L": {
    shortDescription:
      "Buy a tiny piece of shopping malls, office buildings, warehouses, data centres and apartment buildings worldwide. These companies (called REITs) collect rent and pay most of it out to you as dividends — usually 3-4% per year in cash.",
    pros: [
      "Regular dividend income from rental cash flow",
      "Diversifies away from pure stock-market risk",
      "Real assets — bricks, land, data centres",
    ],
    cons: [
      "Falls hard when interest rates rise (2022: -25%)",
      "Tax on dividends in some accounts (less efficient)",
      "Office / mall segments under structural pressure",
    ],
  },
  "VHYL.L": {
    shortDescription:
      "About 1,800 companies worldwide that pay above-average dividends — banks, oil majors, pharma giants, utilities. Built for steady cash income (around 3-4% per year) rather than fast growth. Skips most fast-growing tech that pays little in dividends.",
    pros: [
      "Steady ~3-4% cash yield paid each quarter",
      "Lower volatility than the broad market",
      "Tilted to boring profitable companies",
    ],
    cons: [
      "Misses out when growth stocks rally hard",
      "Heavily weighted to old-economy sectors",
      "Dividend taxation can hurt long-term return",
    ],
  },

  // ─── Broad market ──────────────────────────────────────────────────────
  "CSPX.L": {
    shortDescription:
      "When people talk about 'the US stock market', this is basically what they mean. You own tiny slices of the 500 biggest US companies — Apple, Microsoft, Nvidia, Google, Amazon. Around a quarter of your money goes to the top 10 names alone, so the fund leans heavily into US tech.",
    pros: [
      "Rock-bottom fees (0.07%/year) for owning 500 US giants",
      "Most-traded version on IBKR — easy to buy and sell",
      "Long, well-understood track record going back decades",
    ],
    cons: [
      "Top 10 stocks make up roughly 30% of the fund",
      "Zero exposure outside the US — no Europe, no Asia",
      "Past 15 years were unusually strong; don't bank on a repeat",
    ],
  },
  "IWDA.L": {
    shortDescription:
      "One fund that owns about 1,500 large companies across 23 wealthy countries — the US, Europe, Japan, Australia and others. The US still dominates at roughly 70% of the fund because American companies are by far the most valuable. A solid 'one and done' core for a long-term portfolio.",
    pros: [
      "Owns 1,500+ companies across the developed world",
      "Most popular single-fund core for IBKR Singapore investors",
      "Auto-reinvests dividends — no admin on your side",
    ],
    cons: [
      "Still 70% US-weighted, so not as diversified as it looks",
      "Skips emerging markets entirely — no China, India, Brazil",
      "Slightly pricier than the SPDR version (0.20% vs 0.12%)",
    ],
  },
  "SWRD.L": {
    shortDescription:
      "Exactly the same idea as the iShares developed-world fund above — about 1,500 companies across 23 wealthy countries — just from a different provider (SPDR) and with a cheaper fee. Fewer years of trading history because it only launched in 2019.",
    pros: [
      "Cheaper fee than the iShares equivalent (0.12% vs 0.20%)",
      "Identical underlying holdings — same diversification benefit",
      "Reinvests dividends automatically for compounding",
    ],
    cons: [
      "Shorter track record — only listed in 2019",
      "Slightly less liquid than the iShares version",
      "Still 70% US — same concentration as IWDA",
    ],
  },
  "VWCE.DE": {
    shortDescription:
      "The most diversified single equity fund you can buy on IBKR — about 3,700 companies across both wealthy AND emerging countries (China, India, Brazil and others included). One fund that genuinely covers 'the global stock market'. Trades in euros on the German exchange.",
    pros: [
      "Owns ~3,700 stocks across developed AND emerging markets",
      "True 'one fund for life' — set and forget",
      "Vanguard reputation for low fees and honest products",
    ],
    cons: [
      "Trades in euros — adds a small FX layer for SGD investors",
      "Slightly higher fee than US-only or developed-only funds",
      "Still ~60% US-weighted — you can't escape American concentration",
    ],
  },
  "SSAC.L": {
    shortDescription:
      "Same idea as the Vanguard all-world fund — every major listed company on the planet, including both wealthy and emerging countries. This is the iShares version, on the London exchange in pence. Holdings overlap almost entirely with VWCE.",
    pros: [
      "Genuinely global — developed plus emerging in one fund",
      "iShares is the largest ETF provider, deep liquidity",
      "Trades in London during European hours",
    ],
    cons: [
      "Quoted in GBp (pence) — extra FX hop from SGD",
      "Slightly less popular than the Vanguard version",
      "Still heavily US-weighted at ~60% of the fund",
    ],
  },
  "EIMI.L": {
    shortDescription:
      "Owns roughly 3,000 companies across 24 emerging-market countries — China, Taiwan, India and Korea make up most of it, with smaller slices of Brazil, Saudi, Mexico and others. Higher growth potential than developed markets, but also bigger ups and downs.",
    pros: [
      "Broad exposure to ~3,000 emerging-market companies",
      "Includes small caps for extra diversification",
      "Low fee for an emerging-markets fund (0.18%)",
    ],
    cons: [
      "China + Taiwan = ~45% of the fund (geopolitical risk)",
      "Can drop 30%+ in bad years (e.g. 2022)",
      "Currency swings can amplify losses in SGD terms",
    ],
  },
  "EMXC.L": {
    shortDescription:
      "Like the emerging-markets fund above, but with China and Hong Kong stripped out. Useful if you want exposure to growing economies but feel uneasy about Chinese political risk. India and Taiwan become much bigger pieces of the pie as a result.",
    pros: [
      "Sidesteps China risk while keeping emerging-market growth",
      "India and Taiwan get larger weights — both growing fast",
      "Cheap for an EM fund at 0.18%/year",
    ],
    cons: [
      "Missing China = missing the second-largest economy",
      "Still volatile — Brazil, Saudi, Mexico add their own swings",
      "Smaller fund, slightly less liquid than EIMI",
    ],
  },

  // ─── Regions ──────────────────────────────────────────────────────────
  "LCCN.L": {
    shortDescription:
      "A bet on Chinese companies — Tencent, Alibaba, Meituan, BYD and others. Includes Chinese firms listed in Hong Kong, New York, and mainland China all together. Volatile and heavily influenced by Beijing's policy decisions.",
    pros: [
      "One-stop fund for the whole Chinese stock market",
      "Includes tech giants like Tencent, Alibaba and BYD",
      "Can rally hard when Beijing eases policy",
    ],
    cons: [
      "Policy crackdowns can wipe out 50%+ in a year",
      "Geopolitical risk — US-China tensions, Taiwan, sanctions",
      "Accounting and governance concerns at some firms",
    ],
  },
  "IASH.L": {
    shortDescription:
      "Only mainland-listed Chinese stocks — the ones traded in Shanghai and Shenzhen, mostly bought by domestic investors. Very different mix from the Hong Kong-listed Chinese stocks: more state-owned banks, liquor brands like Kweichow Moutai, and industrials.",
    pros: [
      "Access to mainland-listed firms unavailable to most foreigners",
      "Different sector mix to HK-listed China — diversifies",
      "Strong domestic-consumption tilt (Moutai, appliances, healthcare)",
    ],
    cons: [
      "Mainland market is retail-driven and prone to bubbles",
      "Capital controls and policy changes can hit hard",
      "Quoted in pence — adds an FX layer for SGD investors",
    ],
  },
  "IMEU.L": {
    shortDescription:
      "About 430 large and medium-sized European companies including UK names — Nestlé, ASML, LVMH, Novo Nordisk, AstraZeneca, Shell. A broad bet on Europe that mixes industrial powerhouses, luxury brands, pharma and energy.",
    pros: [
      "Cheap (0.12%) for broad European exposure",
      "Owns top European companies like ASML and LVMH",
      "Diversifies away from US tech concentration",
    ],
    cons: [
      "Europe has lagged the US for over a decade",
      "Pays dividends rather than reinvesting (manual hassle)",
      "Quoted in pence — extra FX step from SGD",
    ],
  },
  "IEUX.L": {
    shortDescription:
      "Continental Europe only — same big companies as the broader Europe fund but with all UK names removed. Germany, France and Switzerland dominate. Useful if you want to control your UK weighting separately.",
    pros: [
      "Pure continental Europe — no UK overlap",
      "Heavy in quality industrials and pharma",
      "Pairs well with a separate UK fund for fine control",
    ],
    cons: [
      "Slightly pricier (0.40%) than the all-Europe version",
      "Pays dividends out — no auto-reinvest",
      "Europe's growth has been sluggish for years",
    ],
  },
  "ISF.L": {
    shortDescription:
      "The 100 biggest companies listed in London — Shell, BP, HSBC, AstraZeneca, Unilever and similar. Heavy in oil, banks and pharma. The UK market is generally seen as cheap but slow-growing, and pays out chunky dividends.",
    pros: [
      "Very low fee (0.07%) and highly liquid",
      "Generous dividend yield versus US or world stocks",
      "Cheaper valuations than the US market right now",
    ],
    cons: [
      "Dominated by old-economy sectors — limited growth upside",
      "Heavy oil and bank exposure — cyclical and rate-sensitive",
      "UK economy has been a laggard for over a decade",
    ],
  },
  "SJPA.L": {
    shortDescription:
      "Roughly 200 Japanese companies — Toyota, Sony, Mitsubishi UFJ, Keyence, Tokyo Electron. Japan is a wealthy, well-run market that spent decades going nowhere but has been waking up lately as companies improve shareholder returns.",
    pros: [
      "Exposure to world-class exporters like Toyota and Sony",
      "Japanese companies sitting on huge cash piles",
      "Auto-reinvests dividends for compounding",
    ],
    cons: [
      "Yen weakness can erode returns in SGD terms",
      "Aging population is a long-term economic headwind",
      "Quoted in pence — extra FX hop from SGD",
    ],
  },
  "NDIA.L": {
    shortDescription:
      "A bet on India's biggest companies — Reliance, HDFC Bank, Infosys, Tata. India is one of the fastest-growing big economies, but the stock market is expensive by global standards and the rupee tends to weaken over time.",
    pros: [
      "Exposure to a fast-growing 1.4-billion-person economy",
      "Strong tech services sector (Infosys, TCS)",
      "Long runway as middle class expands",
    ],
    cons: [
      "Indian stocks trade at high valuations vs the world",
      "Rupee tends to weaken over time, hurting SGD returns",
      "Higher fee than other regional funds (0.65%)",
    ],
  },
  "CPXJ.L": {
    shortDescription:
      "Wealthy Asia-Pacific countries minus Japan — mainly Australia, Hong Kong, Singapore and New Zealand. Heavy in Australian banks and miners (BHP, CBA), plus Hong Kong financials. A more stable slice of Asia than emerging markets.",
    pros: [
      "Pairs cleanly with a Japan fund for full Asia coverage",
      "Includes Singapore — your home market",
      "More stable than EM Asia (China, India)",
    ],
    cons: [
      "Heavy in Australian banks and iron-ore miners",
      "Hong Kong slice carries China-policy risk",
      "Limited tech exposure — mostly old-economy sectors",
    ],
  },
  "AEJL.L": {
    shortDescription:
      "Asia-Pacific without Japan, but combining BOTH wealthy markets (Australia, HK, Singapore) AND emerging ones (China, India, Korea, Taiwan). A single fund for 'all of Asia minus Japan' — useful if you want broad Asia exposure without picking countries individually.",
    pros: [
      "One-stop Asia ex-Japan fund — developed plus emerging",
      "Captures Indian and Korean growth in one wrapper",
      "Reinvests dividends for compounding",
    ],
    cons: [
      "Heavy China weighting brings policy risk",
      "Overlaps with EM funds if you own both",
      "Higher fee (0.45%) than country-specific options",
    ],
  },
  "CSKR.L": {
    shortDescription:
      "Korean stocks — dominated by Samsung Electronics, plus SK Hynix, Hyundai Motor and LG Energy Solution. Essentially a concentrated bet on Korean tech, memory chips and global manufacturing demand. Tied closely to the global tech cycle.",
    pros: [
      "Direct exposure to Samsung and SK Hynix (memory chips)",
      "Hyundai and Kia are world-class car makers",
      "Korea benefits from AI-driven chip demand",
    ],
    cons: [
      "Samsung alone is ~25% of the fund — single-stock risk",
      "Memory chip market is famously cyclical",
      "Korean won can move sharply versus SGD",
    ],
  },
  "XMTW.L": {
    shortDescription:
      "Taiwanese stocks — and that mostly means TSMC, the chipmaker that makes about 90% of the world's cutting-edge processors. TSMC alone is nearly half the fund. Owning this is essentially a concentrated bet on global semiconductor demand and Taiwan staying out of conflict.",
    pros: [
      "Direct ownership of the world's most important chipmaker",
      "Rides global AI and chip-demand growth",
      "Taiwan industrials and tech ecosystem alongside TSMC",
    ],
    cons: [
      "TSMC = ~half the fund. Extreme single-stock risk",
      "Taiwan-China geopolitical risk is real and ongoing",
      "Quoted in pence — extra FX hop from SGD",
    ],
  },
  "XVTD.L": {
    shortDescription:
      "Vietnamese stocks — Vingroup, Vinhomes, Hoa Phat steel, Vietcombank, Masan consumer goods. Vietnam restricts foreign ownership, so this fund uses derivatives to track the market rather than holding the shares directly. That means extra counterparty risk on top of the usual frontier-market risks.",
    pros: [
      "Rare way to access Vietnam's fast-growing economy",
      "Vietnam benefits from manufacturing leaving China",
      "Reinvests dividends automatically",
    ],
    cons: [
      "Uses derivatives (swaps) — extra counterparty risk",
      "Frontier market: illiquid, governance concerns",
      "High fee (0.85%) and can drop 30%+ in bad years",
    ],
  },
  "XMBR.L": {
    shortDescription:
      "Brazilian stocks — mostly Vale (iron ore miner), Petrobras (oil), Itaú Unibanco and B3 (the Brazilian stock exchange). Performance rises and falls with commodity prices, particularly iron ore and oil. Big political swings can move it sharply too.",
    pros: [
      "Rides commodity cycles — strong in iron-ore and oil rallies",
      "Vale and Petrobras pay big dividends when commodities boom",
      "Cheap valuations versus US stocks",
    ],
    cons: [
      "Brazilian real can swing 20%+ in a year",
      "Political instability moves the market dramatically",
      "Pure commodity exposure — drops hard in downturns",
    ],
  },
  "XMES.L": {
    shortDescription:
      "Mexican stocks — América Móvil (telecoms), Walmart de México, FEMSA (Coca-Cola bottler and convenience stores), Banorte. Often pitched as a 'nearshoring' play: as US companies move factories out of China, Mexico is the natural beneficiary.",
    pros: [
      "Benefits from manufacturing moving from China to Mexico",
      "Solid consumer brands like Walmex and FEMSA",
      "Mexican peso has been surprisingly stable lately",
    ],
    cons: [
      "Tariff threats from US administrations can hit hard",
      "Smaller fund and less liquid than big-market ETFs",
      "Heavy in a handful of names — concentrated bet",
    ],
  },
  "IKSA.L": {
    shortDescription:
      "Saudi Arabian stocks — Saudi Aramco (the world's biggest oil company, capped at 20% of the fund), Al Rajhi Bank, STC, SABIC. Closely tied to oil prices and Saudi reform plans. The riyal is pegged to the US dollar, so currency-wise it behaves like USD for you.",
    pros: [
      "Direct oil exposure via Aramco, the world's largest producer",
      "Riyal is pegged to USD — predictable currency",
      "Diversifies away from US/Europe with Middle East exposure",
    ],
    cons: [
      "Heavily tied to oil price — falls hard when oil drops",
      "Concentrated: Aramco and banks dominate",
      "Geopolitical risk (regional tensions, sanctions threats)",
    ],
  },

  // ─── Sectors ──────────────────────────────────────────────────────────
  "CNDX.L": {
    shortDescription:
      "The 100 biggest companies on the US tech-heavy Nasdaq exchange — Apple, Microsoft, Nvidia, Amazon, Meta, Google, Tesla. A more concentrated, more volatile, more growth-tilted bet than the S&P 500. Big winner in good years, brutal in tech downturns.",
    pros: [
      "Concentrated bet on America's biggest tech winners",
      "Has historically beaten the S&P 500 over long periods",
      "Auto-reinvests dividends for compounding",
    ],
    cons: [
      "Can drop 30-50% in a bad year (2000, 2022)",
      "Very tech-heavy — falls hard when tech is out of favour",
      "Top 7 stocks dominate — limited diversification",
    ],
  },
  "EQQQ.L": {
    shortDescription:
      "Same 100 US tech-and-growth giants as the iShares Nasdaq fund — Apple, Microsoft, Nvidia, etc. The difference: this version pays the dividends out to you in cash rather than reinvesting them. Slightly less convenient if you're holding for the long term.",
    pros: [
      "Same big-tech holdings as the iShares Nasdaq fund",
      "Cash dividends if you want regular income",
      "Highly liquid — easy to buy and sell",
    ],
    cons: [
      "Pays dividends out — extra admin and tax-drag",
      "Same 30-50% drawdown risk as any tech-heavy fund",
      "Quoted in pence — extra FX hop from SGD",
    ],
  },
  "WITS.L": {
    shortDescription:
      "Pure tech sector — the IT companies inside the developed-world index. Microsoft, Apple and Nvidia alone are about half the fund. Even more tech-concentrated than the Nasdaq 100. Launched in 2024, so very little price history.",
    pros: [
      "Pure-play developed-world tech exposure",
      "Very low fee (0.18%) for a sector fund",
      "Excludes Tesla, Amazon — only 'real' IT companies",
    ],
    cons: [
      "Less than 2 years of price history — unknown in downturns",
      "Microsoft + Apple + Nvidia = roughly half the fund",
      "Quoted in pence — extra FX hop from SGD",
    ],
  },
  "WHEA.L": {
    shortDescription:
      "Drug makers, biotech, medical-device companies and hospital chains across wealthy countries — Eli Lilly, Novo Nordisk, Johnson & Johnson, UnitedHealth, Roche. Healthcare is generally considered a defensive sector: people need medicine in good times and bad.",
    pros: [
      "Defensive — people need healthcare in any economy",
      "Aging populations drive long-term demand",
      "Less volatile than tech or financials",
    ],
    cons: [
      "Political risk — drug-pricing reform can hit valuations",
      "Patent expiries can hurt individual companies",
      "Has lagged the broader market in recent years",
    ],
  },
  "WFIN.L": {
    shortDescription:
      "Banks, insurance companies and asset managers across wealthy countries — JPMorgan, Berkshire Hathaway, Bank of America, HSBC, Visa, Mastercard. Tends to do well when interest rates are rising (banks earn more on loans) and badly in recessions.",
    pros: [
      "Benefits when interest rates rise — banks earn more",
      "Pays decent dividends from steady cash flows",
      "Diversifies away from tech-heavy core funds",
    ],
    cons: [
      "Falls hard in recessions — credit losses pile up",
      "Banking crises can wipe out 40%+ (2008)",
      "Heavy regulation limits growth versus tech",
    ],
  },
  "WCOD.L": {
    shortDescription:
      "Companies selling things people want but don't need — cars (Tesla, Toyota), online retail (Amazon), luxury (LVMH), restaurants (McDonald's), home improvement (Home Depot). Does well in good times and badly in recessions when people cut back.",
    pros: [
      "Owns dominant consumer brands like LVMH and Amazon",
      "Performs well in economic expansions",
      "Reinvests dividends automatically",
    ],
    cons: [
      "Cyclical — falls hard in recessions",
      "Tesla and Amazon make up large chunks of the fund",
      "Sensitive to consumer confidence and rates",
    ],
  },
  "WENS.L": {
    shortDescription:
      "Oil and gas companies in wealthy countries — ExxonMobil, Chevron, Shell, TotalEnergies, BP. Performance follows the oil price up and down. Pays out dividends rather than reinvesting them.",
    pros: [
      "Big winner in oil-price rallies and inflation spikes",
      "Pays generous dividends from oil cash flows",
      "Hedge against energy-price inflation",
    ],
    cons: [
      "Can fall 50%+ when oil prices crash (2020)",
      "Long-term decline as world shifts off fossil fuels",
      "Pays dividends out — extra tax/admin",
    ],
  },

  // ─── Thematic tech ────────────────────────────────────────────────────
  "SMGB.L": {
    shortDescription:
      "Companies that design or manufacture computer chips — Nvidia, TSMC, ASML (makes the machines that make chips), Broadcom, AMD. Pure bet on the semiconductor industry, which powers everything from phones to AI. Spectacularly cyclical: massive gains in boom years, big drawdowns in busts.",
    pros: [
      "Direct exposure to the AI and chip boom",
      "Owns industry essentials like Nvidia, TSMC, ASML",
      "Has been one of the best-performing themes recently",
    ],
    cons: [
      "Can drop 40-50% in a chip downturn",
      "Top 5 names dominate — concentrated bet",
      "Geopolitical risk: US-China chip war, Taiwan tensions",
    ],
  },
  "WTAI.L": {
    shortDescription:
      "A mix of companies involved in artificial intelligence — chipmakers like Nvidia, AI-software firms, and companies using AI in their products. Less focused than a pure chip fund. Volatile and prone to hype cycles.",
    pros: [
      "Broader AI exposure than just chip stocks",
      "Captures both hardware and software sides of AI",
      "Riding one of the biggest tech themes in decades",
    ],
    cons: [
      "Can drop 50%+ in a bad year — narrow theme",
      "Hype-driven — valuations can disconnect from reality",
      "Higher fee (0.40%) than broad-market funds",
    ],
  },
  "RBOT.L": {
    shortDescription:
      "Companies building industrial robots, factory automation systems, and the software running them — Keyence, Fanuc, ABB, Intuitive Surgical (surgical robots), plus AI-adjacent industrials. Less concentrated and less hype-driven than pure AI funds.",
    pros: [
      "Broader and less concentrated than pure AI funds",
      "Owns real industrial businesses, not just hype",
      "Rides aging-population labour-shortage trend",
    ],
    cons: [
      "Still a narrow theme — can underperform for years",
      "Cyclical: factory spending falls in recessions",
      "Higher fee (0.40%) than broad-market funds",
    ],
  },
  "WCLD.L": {
    shortDescription:
      "Cloud-software companies — but specifically the smaller, faster-growing ones like Snowflake, Datadog, CrowdStrike, MongoDB. NOT the mega-caps like Microsoft or Amazon (those are in the broad indexes). Much more volatile because smaller cloud names trade on growth expectations.",
    pros: [
      "Pure-play exposure to high-growth cloud software",
      "Avoids overlap with mega-cap tech you already own",
      "Cloud spending is a long-term structural trend",
    ],
    cons: [
      "Can drop 50%+ in tech downturns (2022 was brutal)",
      "Small-cap heavy — much more volatile than CSPX",
      "Many holdings still unprofitable — sentiment-driven",
    ],
  },

  // ─── Cybersecurity ────────────────────────────────────────────────────
  "WCBR.L": {
    shortDescription:
      "Companies protecting governments and businesses from cyber attacks — CrowdStrike, Palo Alto Networks, Zscaler, Fortinet, Cloudflare. Narrower and more pure-play than the older cyber fund. Cybersecurity demand keeps growing because the bad guys keep getting more sophisticated.",
    pros: [
      "Structural growth — cyber budgets keep rising every year",
      "Tight focus on real cybersecurity pure-plays",
      "Reinvests dividends automatically",
    ],
    cons: [
      "Can fall 40%+ in tech-sentiment downturns",
      "Limited history — fund launched in 2021",
      "Sub-30 holdings — heavy stock-specific risk",
    ],
  },
  "ISPY.L": {
    shortDescription:
      "Same theme as the WisdomTree cyber fund — companies that defend against hacking — but with about 10 years of price history versus the newer alternative. Slightly broader holdings, higher fee, and pays dividends out rather than reinvesting.",
    pros: [
      "Longest track record among UCITS cyber funds",
      "Slightly broader holdings than WCBR",
      "Cyber demand is structurally rising regardless of cycles",
    ],
    cons: [
      "Higher fee than newer cyber funds (0.69%)",
      "Pays dividends out — extra tax/admin friction",
      "Still 40%+ drawdown risk in tech downturns",
    ],
  },

  // ─── Defence ──────────────────────────────────────────────────────────
  "NATO.L": {
    shortDescription:
      "Weapons makers and defence contractors based in NATO countries — Lockheed Martin, RTX (Raytheon), Northrop Grumman, BAE Systems, Rheinmetall. Has surged since the Russia-Ukraine war as European countries rebuild their militaries. Launched in 2023, so limited history through tough times.",
    pros: [
      "Beneficiary of rising NATO defence budgets",
      "Owns top US and European defence primes",
      "Less correlated with consumer/tech swings",
    ],
    cons: [
      "Launched 2023 — no track record in calm times",
      "Highly concentrated — top names dominate the fund",
      "Ethical concerns may matter to you",
    ],
  },

  // ─── Energy / commodity ──────────────────────────────────────────────
  "INRG.L": {
    shortDescription:
      "Companies in solar, wind, hydrogen and energy storage — First Solar, Enphase, Vestas, Orsted. Was a darling in 2020 and crashed hard in 2022-23 as interest rates rose (high rates hurt long-payback infrastructure projects). Volatile and rate-sensitive.",
    pros: [
      "Direct exposure to the energy-transition theme",
      "Will benefit if interest rates fall meaningfully",
      "Diversifies away from fossil-fuel risk",
    ],
    cons: [
      "Already crashed 60%+ from 2021 peak — could drop more",
      "Very rate-sensitive — gets hammered when rates rise",
      "Pays dividends out — extra admin",
    ],
  },
  "URNM.L": {
    shortDescription:
      "Mining companies that dig up uranium for nuclear power plants — Cameco, Kazatomprom, NexGen Energy. Pure commodity-cycle exposure: prices and stocks have surged as nuclear power gets back into political favour. Tiny industry, big swings.",
    pros: [
      "Nuclear renaissance theme — politically back in favour",
      "Small industry, big upside if uranium price keeps rising",
      "Reinvests dividends automatically",
    ],
    cons: [
      "Extremely volatile — can drop 40%+ in months",
      "Tiny sector — few companies, lots of concentration",
      "Higher fee (0.85%) than broad-market funds",
    ],
  },
  "NUCL.L": {
    shortDescription:
      "Broader take on the nuclear theme than pure uranium miners — includes utilities that run nuclear plants (Constellation, EDF) and companies making reactors and nuclear tech. Less of a pure commodity bet, slightly less volatile.",
    pros: [
      "Broader and less volatile than pure uranium miners",
      "Includes nuclear utilities with steady cash flows",
      "Rides nuclear renaissance without pure commodity risk",
    ],
    cons: [
      "Still a narrow theme — can underperform for years",
      "Public sentiment can swing against nuclear quickly",
      "Newer fund — limited history through downturns",
    ],
  },
  "SGLN.L": {
    shortDescription:
      "Backed by real gold bars sitting in London vaults. The price moves with the gold price. Gold tends to hold up or even rise during stock-market crashes and inflation scares, which is why people use it as portfolio insurance. Doesn't pay any dividends — gold just sits there.",
    pros: [
      "Defensive — often rises when stocks crash",
      "Hedge against inflation and currency debasement",
      "Very low fee (0.12%) for a gold product",
    ],
    cons: [
      "No dividends or income — gold doesn't 'earn'",
      "Can underperform stocks for a decade at a time",
      "Quoted in pence — extra FX hop from SGD",
    ],
  },

  // ─── Other thematics ──────────────────────────────────────────────────
  "DH2O.L": {
    shortDescription:
      "Water utilities and infrastructure companies — Veolia (waste and water services), American Water Works (US utility), Xylem (water-treatment equipment). Mix of boring-but-steady utilities and more volatile industrials. Water demand is a slow, structural growth story.",
    pros: [
      "Defensive utility exposure with growth tilt",
      "Long-term theme — water scarcity is structural",
      "Less volatile than tech or commodity themes",
    ],
    cons: [
      "Pays dividends out — extra admin",
      "Niche theme — can underperform broad markets",
      "Higher fee (0.65%) than broad funds",
    ],
  },
  "AGED.L": {
    shortDescription:
      "Companies whose business benefits from the world getting older — drug makers, retirement-home operators, financial services for retirees, and consumer brands geared to older shoppers. Slow, demographic-driven theme rather than a hype trade.",
    pros: [
      "Rides a guaranteed demographic megatrend",
      "Diversified across pharma, services, consumer",
      "Less hype-driven than tech themes",
    ],
    cons: [
      "Has lagged broad markets for years",
      "Slow-moving theme — needs patience",
      "Higher fee (0.40%) than broad-market funds",
    ],
  },
  "LITU.L": {
    shortDescription:
      "Lithium miners (Albemarle, SQM) and battery makers (CATL, BYD, LG Energy Solution, Samsung SDI). Performance follows lithium prices and electric-vehicle demand. Crashed brutally in 2023-24 as lithium prices collapsed; has yet to recover.",
    pros: [
      "Direct exposure to EV and battery-storage growth",
      "Owns the biggest battery makers worldwide",
      "Will benefit when lithium prices recover",
    ],
    cons: [
      "Lithium prices crashed 80%+ from 2022 peak",
      "Highly cyclical — can drop 50%+ in bad years",
      "Concentrated in a few miners and battery firms",
    ],
  },

  // ─── ESG / Sustainability ─────────────────────────────────────────────
  "SUSW.L": {
    shortDescription:
      "A 'sustainable' version of the developed-world stock fund. It keeps only the companies with the best environmental and social ratings, while excluding weapons makers, tobacco, gambling, fossil fuels and other low-rated firms. Around 380 companies versus 1,500 in the standard world fund — so more concentrated.",
    pros: [
      "One fund to align global investing with your values",
      "Auto-reinvests dividends for compounding",
      "Keeps the best-rated companies from the developed world",
    ],
    cons: [
      "Smaller, more concentrated than the full world fund",
      "Performance can diverge from broad markets for years",
      "Higher fee (0.20%) than the cheapest world trackers",
    ],
  },
  "SUUS.L": {
    shortDescription:
      "Like an 'ethical S&P 500' — owns only the US companies with the best environmental and social ratings, while screening out weapons, tobacco, gambling, fossil fuels and similar. About 190 companies versus 500 in the standard S&P fund, so more concentrated.",
    pros: [
      "Ethical version of US large-cap exposure",
      "Reinvests dividends for compounding",
      "Excludes fossil fuels, weapons, tobacco, gambling",
    ],
    cons: [
      "Much more concentrated than the regular S&P 500",
      "Can lag the standard index in oil-and-defence rallies",
      "Higher fee than the basic US trackers",
    ],
  },
  "SUSM.L": {
    shortDescription:
      "The sustainable version of the emerging-markets fund. Excludes oil giants like Aramco and PetroChina, plus weapons, tobacco, gambling and low-rated companies — keeping only the best environmental and social performers across emerging countries. Much smaller holding list than the standard EM fund.",
    pros: [
      "Ethical EM exposure — no Aramco, PetroChina, tobacco",
      "Diversifies your sustainable portfolio into EM growth",
      "Reinvests dividends automatically",
    ],
    cons: [
      "Much more concentrated than the standard EM fund",
      "Smaller fund — less liquid than EIMI",
      "Higher fee than the basic emerging-market trackers",
    ],
  },

  // ─── Bonds ────────────────────────────────────────────────────────────
  "AGGG.L": {
    shortDescription:
      "Bonds, not stocks. When you own this, you're lending money to thousands of governments and big companies around the world, who pay you back with interest. Lower expected return than stocks, but also smaller ups and downs — typically used to smooth out a portfolio. Pays out the interest as cash quarterly.",
    pros: [
      "Cushions losses when stocks fall — diversifier",
      "Steady interest income from thousands of borrowers",
      "Very cheap (0.10%) for a global bond fund",
    ],
    cons: [
      "Lower long-term returns than stocks",
      "Bonds fell hard in 2022 when rates jumped — not risk-free",
      "Pays interest out — extra admin (Acc sister is AGGU.L)",
    ],
  },
};
