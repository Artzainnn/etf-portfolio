/**
 * Curated list of individual stocks to track, organised by industry tags.
 * Each stock can belong to multiple industries (e.g. NVDA = AI + Chips).
 * Yahoo Finance tickers — verify each one fetches before relying on it.
 *
 * Keep this list reasonably tight (~70 names). The goal is "stocks worth
 * having on your radar", not full market coverage.
 */

export interface SeedStock {
  ticker: string;
  name: string;
  friendlyName: string;
  shortDescription: string;
  industries: string[];
  country: string; // ISO-ish, for flag emoji
  emoji?: string; // optional override; otherwise derived from first industry
}

export const SEED_STOCKS: SeedStock[] = [
  // ─── Big Tech ──────────────────────────────────────────────────
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    friendlyName: "Apple",
    shortDescription:
      "iPhone maker. The world's most valuable consumer hardware company, increasingly a services + AI play too.",
    industries: ["big_tech", "ai"],
    country: "US",
    emoji: "🍎",
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    friendlyName: "Microsoft",
    shortDescription:
      "Cloud (Azure), enterprise software, AI partner of OpenAI. One of the biggest beneficiaries of the AI build-out.",
    industries: ["big_tech", "ai", "saas"],
    country: "US",
    emoji: "🪟",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc. (Class A)",
    friendlyName: "Alphabet (Google)",
    shortDescription:
      "Google Search, YouTube, Android, Google Cloud, Gemini AI, Waymo (self-driving). Cash machine + AI giant.",
    industries: ["big_tech", "ai"],
    country: "US",
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    friendlyName: "Amazon",
    shortDescription:
      "Largest online retailer + AWS (the biggest cloud provider). Two very different businesses in one.",
    industries: ["big_tech", "ecommerce", "saas"],
    country: "US",
    emoji: "📦",
  },
  {
    ticker: "META",
    name: "Meta Platforms Inc.",
    friendlyName: "Meta (Facebook)",
    shortDescription:
      "Facebook, Instagram, WhatsApp, Threads. Heavy spender on AI and VR. Ad-driven revenue.",
    industries: ["big_tech", "ai"],
    country: "US",
  },
  {
    ticker: "NFLX",
    name: "Netflix Inc.",
    friendlyName: "Netflix",
    shortDescription:
      "Streaming pioneer. Now with ads, gaming, and live sports as growth bets.",
    industries: ["big_tech"],
    country: "US",
    emoji: "🎬",
  },
  {
    ticker: "ORCL",
    name: "Oracle Corporation",
    friendlyName: "Oracle",
    shortDescription:
      "Enterprise databases pivoting to cloud (OCI). Major AI-infrastructure partner for OpenAI and others.",
    industries: ["big_tech", "saas", "ai"],
    country: "US",
  },

  // ─── AI pure-ish plays ─────────────────────────────────────────
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    friendlyName: "Nvidia",
    shortDescription:
      "The chip maker powering the AI boom. Their GPUs are the picks-and-shovels of the AI build-out.",
    industries: ["ai", "chips"],
    country: "US",
  },
  {
    ticker: "AMD",
    name: "Advanced Micro Devices Inc.",
    friendlyName: "AMD",
    shortDescription:
      "CPU and GPU maker — the main competitor to Intel and Nvidia. Trying to catch up in AI chips.",
    industries: ["chips", "ai"],
    country: "US",
  },
  {
    ticker: "PLTR",
    name: "Palantir Technologies Inc.",
    friendlyName: "Palantir",
    shortDescription:
      "Defence and enterprise AI/data analytics. Used by US military, intelligence agencies, and large corporations.",
    industries: ["ai", "defense", "saas"],
    country: "US",
  },

  // ─── Chips & semis ─────────────────────────────────────────────
  {
    ticker: "TSM",
    name: "Taiwan Semiconductor Manufacturing Co.",
    friendlyName: "TSMC",
    shortDescription:
      "The world's biggest chip foundry. Makes the most advanced chips for Apple, Nvidia, AMD and others.",
    industries: ["chips", "ai"],
    country: "TW",
  },
  {
    ticker: "ASML",
    name: "ASML Holding N.V.",
    friendlyName: "ASML",
    shortDescription:
      "Dutch monopoly on EUV lithography machines — the equipment needed to make the most advanced chips.",
    industries: ["chips"],
    country: "NL",
  },
  {
    ticker: "AVGO",
    name: "Broadcom Inc.",
    friendlyName: "Broadcom",
    shortDescription:
      "Designs custom chips for hyperscalers (Google, Meta) and networking gear. Major AI infrastructure player.",
    industries: ["chips", "ai"],
    country: "US",
  },
  {
    ticker: "QCOM",
    name: "Qualcomm Incorporated",
    friendlyName: "Qualcomm",
    shortDescription:
      "Designs Snapdragon mobile chips and modems. Most smartphones outside Apple use their tech.",
    industries: ["chips"],
    country: "US",
  },
  {
    ticker: "MU",
    name: "Micron Technology Inc.",
    friendlyName: "Micron",
    shortDescription:
      "Memory chips (DRAM, NAND, HBM). Cyclical but the AI HBM boom has been transformative.",
    industries: ["chips", "ai"],
    country: "US",
  },
  {
    ticker: "INTC",
    name: "Intel Corporation",
    friendlyName: "Intel",
    shortDescription:
      "The legacy x86 leader. Trying a multi-year turnaround focused on foundry services and PC chips.",
    industries: ["chips"],
    country: "US",
  },

  // ─── Cloud / SaaS ──────────────────────────────────────────────
  {
    ticker: "CRM",
    name: "Salesforce Inc.",
    friendlyName: "Salesforce",
    shortDescription:
      "The biggest CRM software company. Pushing hard into AI agents for sales and customer support.",
    industries: ["saas", "ai"],
    country: "US",
  },
  {
    ticker: "ADBE",
    name: "Adobe Inc.",
    friendlyName: "Adobe",
    shortDescription:
      "Creative software (Photoshop, Premiere). Trying to defend its turf against AI image/video generators.",
    industries: ["saas", "ai"],
    country: "US",
  },
  {
    ticker: "NOW",
    name: "ServiceNow Inc.",
    friendlyName: "ServiceNow",
    shortDescription:
      "Enterprise workflow automation platform. Strong AI agent narrative for IT and HR.",
    industries: ["saas", "ai"],
    country: "US",
  },
  {
    ticker: "SNOW",
    name: "Snowflake Inc.",
    friendlyName: "Snowflake",
    shortDescription:
      "Cloud data warehouse. The 'data layer' a lot of enterprise AI workloads run on.",
    industries: ["saas", "ai"],
    country: "US",
  },
  {
    ticker: "DDOG",
    name: "Datadog Inc.",
    friendlyName: "Datadog",
    shortDescription:
      "Observability platform — monitors cloud apps. Benefits when cloud spending grows.",
    industries: ["saas"],
    country: "US",
  },
  {
    ticker: "CRWD",
    name: "CrowdStrike Holdings Inc.",
    friendlyName: "CrowdStrike",
    shortDescription:
      "Cybersecurity platform (endpoint protection). Premium valuation but consistent growth.",
    industries: ["saas"],
    country: "US",
  },
  {
    ticker: "MDB",
    name: "MongoDB Inc.",
    friendlyName: "MongoDB",
    shortDescription:
      "Document database platform — popular alternative to traditional SQL databases.",
    industries: ["saas"],
    country: "US",
  },

  // ─── Cars & EV ─────────────────────────────────────────────────
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    friendlyName: "Tesla",
    shortDescription:
      "EV maker turned AI / robotaxi / robot / energy company depending on how you squint. Wildly volatile.",
    industries: ["cars", "ai"],
    country: "US",
  },
  {
    ticker: "F",
    name: "Ford Motor Company",
    friendlyName: "Ford",
    shortDescription:
      "Classic Detroit automaker. Truck-heavy, struggling with EV transition costs.",
    industries: ["cars"],
    country: "US",
  },
  {
    ticker: "GM",
    name: "General Motors Company",
    friendlyName: "General Motors",
    shortDescription:
      "Largest US automaker by sales. Slow EV pivot but profitable ICE business.",
    industries: ["cars"],
    country: "US",
  },
  {
    ticker: "STLA",
    name: "Stellantis N.V.",
    friendlyName: "Stellantis",
    shortDescription:
      "Owns Jeep, Chrysler, Peugeot, Fiat, Maserati. European-American combo, currently under pressure.",
    industries: ["cars"],
    country: "NL",
  },
  {
    ticker: "RIVN",
    name: "Rivian Automotive Inc.",
    friendlyName: "Rivian",
    shortDescription:
      "US electric truck/SUV startup. Loss-making but with Amazon as a big customer.",
    industries: ["cars"],
    country: "US",
  },
  {
    ticker: "TM",
    name: "Toyota Motor Corporation",
    friendlyName: "Toyota",
    shortDescription:
      "World's biggest car company by volume. Cautious on full EVs, leans hybrid — has been a winning strategy lately.",
    industries: ["cars"],
    country: "JP",
  },
  {
    ticker: "BYDDY",
    name: "BYD Company Limited",
    friendlyName: "BYD",
    shortDescription:
      "Chinese EV + battery giant. Outsells Tesla in many markets. Hugely vertically integrated.",
    industries: ["cars"],
    country: "CN",
  },
  {
    ticker: "MBG.DE",
    name: "Mercedes-Benz Group AG",
    friendlyName: "Mercedes-Benz",
    shortDescription:
      "German luxury automaker. Premium pricing but slower in EV transition than Tesla/BYD.",
    industries: ["cars", "luxury"],
    country: "DE",
  },

  // ─── Defense ───────────────────────────────────────────────────
  {
    ticker: "LMT",
    name: "Lockheed Martin Corporation",
    friendlyName: "Lockheed Martin",
    shortDescription:
      "F-35 fighter jet maker, missiles, helicopters. The biggest US defence contractor.",
    industries: ["defense"],
    country: "US",
  },
  {
    ticker: "RTX",
    name: "RTX Corporation",
    friendlyName: "RTX (Raytheon)",
    shortDescription:
      "Missiles, radars, jet engines (Pratt & Whitney). Diversified defence + commercial aerospace.",
    industries: ["defense"],
    country: "US",
  },
  {
    ticker: "NOC",
    name: "Northrop Grumman Corporation",
    friendlyName: "Northrop Grumman",
    shortDescription:
      "Stealth bombers (B-21), nuclear missiles, satellites. Heavy on classified contracts.",
    industries: ["defense"],
    country: "US",
  },
  {
    ticker: "GD",
    name: "General Dynamics Corporation",
    friendlyName: "General Dynamics",
    shortDescription:
      "Tanks (Abrams), submarines, business jets (Gulfstream). Mix of defence + private aviation.",
    industries: ["defense"],
    country: "US",
  },
  {
    ticker: "BA",
    name: "The Boeing Company",
    friendlyName: "Boeing",
    shortDescription:
      "Commercial planes + defence. Multi-year struggle with 737 MAX safety issues and labour disputes.",
    industries: ["defense"],
    country: "US",
  },
  {
    ticker: "RHM.DE",
    name: "Rheinmetall AG",
    friendlyName: "Rheinmetall",
    shortDescription:
      "German defence champion. Tanks, artillery, ammunition. Massive beneficiary of European rearmament.",
    industries: ["defense"],
    country: "DE",
  },

  // ─── Energy (oil & gas) ────────────────────────────────────────
  {
    ticker: "XOM",
    name: "Exxon Mobil Corporation",
    friendlyName: "ExxonMobil",
    shortDescription:
      "Largest US oil major. Big buybacks, leaning into LNG and chemicals.",
    industries: ["energy"],
    country: "US",
  },
  {
    ticker: "CVX",
    name: "Chevron Corporation",
    friendlyName: "Chevron",
    shortDescription:
      "Second-largest US oil major. Dividend-focused.",
    industries: ["energy"],
    country: "US",
  },
  {
    ticker: "SHEL",
    name: "Shell plc",
    friendlyName: "Shell",
    shortDescription:
      "UK-headquartered oil major. Cash-generative but climate transition is a slow-burn issue.",
    industries: ["energy"],
    country: "GB",
  },
  {
    ticker: "BP",
    name: "BP p.l.c.",
    friendlyName: "BP",
    shortDescription:
      "British oil major. Recently scaled back its renewable energy push to focus back on hydrocarbons.",
    industries: ["energy"],
    country: "GB",
  },
  {
    ticker: "TTE",
    name: "TotalEnergies SE",
    friendlyName: "TotalEnergies",
    shortDescription:
      "French oil major with a more substantial renewable energy bet than peers.",
    industries: ["energy", "clean_energy"],
    country: "FR",
  },

  // ─── Clean energy ──────────────────────────────────────────────
  {
    ticker: "ENPH",
    name: "Enphase Energy Inc.",
    friendlyName: "Enphase",
    shortDescription:
      "Solar microinverters + home batteries. Hit hard by high interest rates; recovery still uncertain.",
    industries: ["clean_energy"],
    country: "US",
  },
  {
    ticker: "FSLR",
    name: "First Solar Inc.",
    friendlyName: "First Solar",
    shortDescription:
      "US-based utility-scale solar panel maker. Benefits from Inflation Reduction Act subsidies.",
    industries: ["clean_energy"],
    country: "US",
  },
  {
    ticker: "NEE",
    name: "NextEra Energy Inc.",
    friendlyName: "NextEra Energy",
    shortDescription:
      "Largest US renewable energy producer + Florida utility. Steady dividend grower.",
    industries: ["clean_energy", "energy"],
    country: "US",
  },
  {
    ticker: "PLUG",
    name: "Plug Power Inc.",
    friendlyName: "Plug Power",
    shortDescription:
      "Hydrogen fuel cells. Highly speculative — has consistently lost money but still a hydrogen pure-play.",
    industries: ["clean_energy"],
    country: "US",
  },

  // ─── Travel & hospitality ──────────────────────────────────────
  {
    ticker: "BKNG",
    name: "Booking Holdings Inc.",
    friendlyName: "Booking.com",
    shortDescription:
      "Owns Booking.com, Priceline, Kayak. Cash-generative online travel agency.",
    industries: ["travel", "ecommerce"],
    country: "US",
  },
  {
    ticker: "ABNB",
    name: "Airbnb Inc.",
    friendlyName: "Airbnb",
    shortDescription:
      "Global short-term rentals marketplace. Strong brand, regulatory headwinds in major cities.",
    industries: ["travel", "ecommerce"],
    country: "US",
  },
  {
    ticker: "MAR",
    name: "Marriott International Inc.",
    friendlyName: "Marriott",
    shortDescription:
      "World's largest hotel chain (Sheraton, Westin, St. Regis, Ritz-Carlton…). Asset-light franchise model.",
    industries: ["travel"],
    country: "US",
  },
  {
    ticker: "DAL",
    name: "Delta Air Lines Inc.",
    friendlyName: "Delta Air Lines",
    shortDescription:
      "Big US airline. Premium-focused strategy is paying off.",
    industries: ["travel"],
    country: "US",
  },

  // ─── Robotics ──────────────────────────────────────────────────
  {
    ticker: "ISRG",
    name: "Intuitive Surgical Inc.",
    friendlyName: "Intuitive Surgical",
    shortDescription:
      "Makers of the da Vinci surgical robot system. Effectively a monopoly in robotic surgery.",
    industries: ["robotics", "pharma"],
    country: "US",
  },
  {
    ticker: "ABBN.SW",
    name: "ABB Ltd",
    friendlyName: "ABB",
    shortDescription:
      "Swiss industrial automation + robotics + electrification. Big in factory automation.",
    industries: ["robotics"],
    country: "CH",
  },

  // ─── Quantum (speculative) ─────────────────────────────────────
  {
    ticker: "IONQ",
    name: "IonQ Inc.",
    friendlyName: "IonQ",
    shortDescription:
      "Trapped-ion quantum computing pure-play. Highly speculative, not profitable. Big swings.",
    industries: ["quantum"],
    country: "US",
  },
  {
    ticker: "RGTI",
    name: "Rigetti Computing Inc.",
    friendlyName: "Rigetti",
    shortDescription:
      "Superconducting quantum computing. Tiny revenue, big narrative. Trade with caution.",
    industries: ["quantum"],
    country: "US",
  },
  {
    ticker: "QBTS",
    name: "D-Wave Quantum Inc.",
    friendlyName: "D-Wave",
    shortDescription:
      "Quantum annealing (different approach from gate-based). Niche use cases, very speculative.",
    industries: ["quantum"],
    country: "US",
  },

  // ─── Pharma & biotech ──────────────────────────────────────────
  {
    ticker: "LLY",
    name: "Eli Lilly and Company",
    friendlyName: "Eli Lilly",
    shortDescription:
      "Maker of Mounjaro/Zepbound (GLP-1 weight loss drugs). Generational growth story unfolding.",
    industries: ["pharma"],
    country: "US",
  },
  {
    ticker: "NVO",
    name: "Novo Nordisk A/S",
    friendlyName: "Novo Nordisk",
    shortDescription:
      "Danish maker of Ozempic/Wegovy — the original GLP-1 weight-loss drugs. Worldwide demand.",
    industries: ["pharma"],
    country: "DK",
  },
  {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    friendlyName: "Johnson & Johnson",
    shortDescription:
      "Diversified pharma/medical devices giant. Slow steady grower with a strong dividend.",
    industries: ["pharma"],
    country: "US",
  },
  {
    ticker: "AZN",
    name: "AstraZeneca PLC",
    friendlyName: "AstraZeneca",
    shortDescription:
      "UK/Swedish pharma giant. Strong oncology pipeline.",
    industries: ["pharma"],
    country: "GB",
  },
  {
    ticker: "ABBV",
    name: "AbbVie Inc.",
    friendlyName: "AbbVie",
    shortDescription:
      "Maker of Humira (long the world's best-selling drug) plus Skyrizi and Botox. Strong cash flows.",
    industries: ["pharma"],
    country: "US",
  },

  // ─── Luxury ────────────────────────────────────────────────────
  {
    ticker: "MC.PA",
    name: "LVMH Moët Hennessy Louis Vuitton",
    friendlyName: "LVMH",
    shortDescription:
      "Louis Vuitton, Dior, Tiffany, Sephora, Moët, Hennessy… The luxury empire. Sensitive to Chinese spending.",
    industries: ["luxury"],
    country: "FR",
  },
  {
    ticker: "RMS.PA",
    name: "Hermès International",
    friendlyName: "Hermès",
    shortDescription:
      "Birkin and Kelly bags. The ultra-premium of the luxury world — outperforms because their pricing power is unique.",
    industries: ["luxury"],
    country: "FR",
  },
  {
    ticker: "CFR.SW",
    name: "Compagnie Financière Richemont SA",
    friendlyName: "Richemont",
    shortDescription:
      "Cartier, Van Cleef & Arpels, IWC, Piaget. Swiss watches + jewellery focused.",
    industries: ["luxury"],
    country: "CH",
  },
  {
    ticker: "RACE",
    name: "Ferrari N.V.",
    friendlyName: "Ferrari",
    shortDescription:
      "The supercar maker. Tiny production volumes + insane pricing power = a luxury business not really a carmaker.",
    industries: ["luxury", "cars"],
    country: "IT",
  },

  // ─── E-commerce / Internet (not US Big Tech) ──────────────────
  {
    ticker: "MELI",
    name: "MercadoLibre Inc.",
    friendlyName: "MercadoLibre",
    shortDescription:
      "The 'Amazon of Latin America' — e-commerce + payments (Mercado Pago). Strong growth in Brazil/Argentina/Mexico.",
    industries: ["ecommerce"],
    country: "AR",
  },
  {
    ticker: "BABA",
    name: "Alibaba Group Holding Ltd",
    friendlyName: "Alibaba",
    shortDescription:
      "Chinese e-commerce giant (Taobao, Tmall) + cloud + Ant Group. Hammered by regulatory crackdowns 2021-23.",
    industries: ["ecommerce"],
    country: "CN",
  },
  {
    ticker: "JD",
    name: "JD.com Inc.",
    friendlyName: "JD.com",
    shortDescription:
      "Chinese e-commerce with a focus on logistics and authentic-goods supply chain. Alibaba competitor.",
    industries: ["ecommerce"],
    country: "CN",
  },

  // ─── Finance & banks ──────────────────────────────────────────
  {
    ticker: "JPM",
    name: "JPMorgan Chase & Co.",
    friendlyName: "JPMorgan Chase",
    shortDescription:
      "Largest US bank. Diversified — consumer banking, investment banking, asset management.",
    industries: ["finance"],
    country: "US",
  },
  {
    ticker: "BAC",
    name: "Bank of America Corporation",
    friendlyName: "Bank of America",
    shortDescription:
      "Big US consumer + commercial bank. Closely tied to US economic cycle.",
    industries: ["finance"],
    country: "US",
  },
  {
    ticker: "GS",
    name: "The Goldman Sachs Group Inc.",
    friendlyName: "Goldman Sachs",
    shortDescription:
      "Top investment bank — trading, M&A advisory, asset management. Cyclical earnings.",
    industries: ["finance"],
    country: "US",
  },
  {
    ticker: "HSBC",
    name: "HSBC Holdings plc",
    friendlyName: "HSBC",
    shortDescription:
      "Global bank with heavy Asia exposure (HK, China, Singapore). Pivoting back toward Asia.",
    industries: ["finance"],
    country: "GB",
  },

  // ─── Singapore ────────────────────────────────────────────────
  {
    ticker: "D05.SI",
    name: "DBS Group Holdings Ltd",
    friendlyName: "DBS Bank",
    shortDescription:
      "Singapore's biggest bank. Consistent dividend payer, well-managed, regional Asia exposure.",
    industries: ["finance", "singapore"],
    country: "SG",
  },
  {
    ticker: "C6L.SI",
    name: "Singapore Airlines Ltd",
    friendlyName: "Singapore Airlines",
    shortDescription:
      "Premium long-haul carrier. Cyclical but Singapore's flag carrier with iconic service.",
    industries: ["travel", "singapore"],
    country: "SG",
  },
  {
    ticker: "Z74.SI",
    name: "Singapore Telecommunications Ltd",
    friendlyName: "Singtel",
    shortDescription:
      "Singapore telecom incumbent + stakes in regional telcos (Optus, Airtel). Dividend-focused.",
    industries: ["singapore"],
    country: "SG",
  },
  {
    ticker: "SE",
    name: "Sea Limited",
    friendlyName: "Sea (Shopee, Garena)",
    shortDescription:
      "Singapore-headquartered: Shopee (e-commerce in SEA), Garena (gaming), SeaMoney (fintech). High growth, volatile.",
    industries: ["ecommerce", "big_tech", "singapore"],
    country: "SG",
  },
];
