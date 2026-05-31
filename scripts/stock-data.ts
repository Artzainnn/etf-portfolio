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
  {
    ticker: "AIR.PA",
    name: "Airbus SE",
    friendlyName: "Airbus",
    shortDescription:
      "Europe's aerospace giant and Boeing's main rival. Commercial jets (A320/A350), plus defence, helicopters and space.",
    industries: ["defense", "industrials"],
    country: "FR",
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

  // ─── More Big Tech / Internet ──────────────────────────────────
  {
    ticker: "UBER",
    name: "Uber Technologies Inc.",
    friendlyName: "Uber",
    shortDescription:
      "Ride-hailing + food delivery (Uber Eats) + freight. Finally consistently profitable after years of cash burn.",
    industries: ["big_tech", "travel"],
    country: "US",
  },
  {
    ticker: "SPOT",
    name: "Spotify Technology S.A.",
    friendlyName: "Spotify",
    shortDescription:
      "Music streaming leader globally. Heavy investment in podcasts and audiobooks. Margins are slowly improving.",
    industries: ["big_tech", "media"],
    country: "SE",
  },
  {
    ticker: "NET",
    name: "Cloudflare Inc.",
    friendlyName: "Cloudflare",
    shortDescription:
      "Internet infrastructure: CDN, DDoS protection, edge compute. Quietly becoming an AI inference platform.",
    industries: ["big_tech", "saas", "ai"],
    country: "US",
  },
  {
    ticker: "SHOP",
    name: "Shopify Inc.",
    friendlyName: "Shopify",
    shortDescription:
      "E-commerce platform for small/medium merchants. The main alternative to selling on Amazon.",
    industries: ["ecommerce", "saas"],
    country: "CA",
  },
  {
    ticker: "DELL",
    name: "Dell Technologies Inc.",
    friendlyName: "Dell",
    shortDescription:
      "PC maker, but the AI-server business (selling Nvidia-powered servers) has been the growth driver lately.",
    industries: ["big_tech", "ai"],
    country: "US",
  },
  {
    ticker: "RBLX",
    name: "Roblox Corporation",
    friendlyName: "Roblox",
    shortDescription:
      "User-generated games platform mainly for kids/teens. Often pitched as a metaverse play.",
    industries: ["big_tech", "media"],
    country: "US",
  },
  {
    ticker: "DIS",
    name: "The Walt Disney Company",
    friendlyName: "Disney",
    shortDescription:
      "Theme parks, Disney+ streaming, ESPN, movies (Marvel, Pixar, Star Wars). Multi-year transition challenge.",
    industries: ["media", "travel"],
    country: "US",
  },
  {
    ticker: "ROKU",
    name: "Roku Inc.",
    friendlyName: "Roku",
    shortDescription:
      "Streaming-TV OS + ad platform. Cyclical with advertising spend.",
    industries: ["media", "big_tech"],
    country: "US",
  },

  // ─── More AI / networking ──────────────────────────────────────
  {
    ticker: "ANET",
    name: "Arista Networks Inc.",
    friendlyName: "Arista Networks",
    shortDescription:
      "High-end data-centre switches. Major beneficiary of the AI build-out — Meta and Microsoft are huge customers.",
    industries: ["ai", "chips"],
    country: "US",
  },

  // ─── More chips ────────────────────────────────────────────────
  {
    ticker: "ARM",
    name: "Arm Holdings plc",
    friendlyName: "Arm",
    shortDescription:
      "UK chip designer. Owns the architecture used in nearly every smartphone. Pushing into AI/data-centre CPUs.",
    industries: ["chips", "ai"],
    country: "GB",
  },
  {
    ticker: "MRVL",
    name: "Marvell Technology Inc.",
    friendlyName: "Marvell",
    shortDescription:
      "Custom chips for hyperscalers + storage/networking silicon. Big AI infrastructure exposure.",
    industries: ["chips", "ai"],
    country: "US",
  },
  {
    ticker: "LRCX",
    name: "Lam Research Corporation",
    friendlyName: "Lam Research",
    shortDescription:
      "Wafer-fabrication equipment. Sells to TSMC, Samsung, Intel. Cyclical with chip-fab capex.",
    industries: ["chips"],
    country: "US",
  },
  {
    ticker: "KLAC",
    name: "KLA Corporation",
    friendlyName: "KLA",
    shortDescription:
      "Inspection/metrology equipment for chip fabs. Less talked-about than ASML but similarly entrenched.",
    industries: ["chips"],
    country: "US",
  },
  {
    ticker: "AMAT",
    name: "Applied Materials Inc.",
    friendlyName: "Applied Materials",
    shortDescription:
      "Largest US chip-equipment maker. Sells deposition and etching gear to every major foundry.",
    industries: ["chips"],
    country: "US",
  },

  // ─── More SaaS ─────────────────────────────────────────────────
  {
    ticker: "TEAM",
    name: "Atlassian Corporation",
    friendlyName: "Atlassian",
    shortDescription:
      "Jira, Confluence, Bitbucket — developer productivity tools. Most software teams use at least one of their products.",
    industries: ["saas"],
    country: "AU",
  },
  {
    ticker: "HUBS",
    name: "HubSpot Inc.",
    friendlyName: "HubSpot",
    shortDescription:
      "Marketing + sales CRM software for SMBs. Less enterprise-y than Salesforce.",
    industries: ["saas"],
    country: "US",
  },
  {
    ticker: "ZS",
    name: "Zscaler Inc.",
    friendlyName: "Zscaler",
    shortDescription:
      "Cloud-based security (SASE/zero-trust). Premium-priced but hot in enterprise security.",
    industries: ["saas"],
    country: "US",
  },
  {
    ticker: "OKTA",
    name: "Okta Inc.",
    friendlyName: "Okta",
    shortDescription:
      "Identity-as-a-service — single sign-on for the enterprise. Has had high-profile breaches.",
    industries: ["saas"],
    country: "US",
  },
  {
    ticker: "WDAY",
    name: "Workday Inc.",
    friendlyName: "Workday",
    shortDescription:
      "Cloud HR and finance software for large enterprises. Steady enterprise grower.",
    industries: ["saas"],
    country: "US",
  },
  {
    ticker: "IBM",
    name: "IBM Corporation",
    friendlyName: "IBM",
    shortDescription:
      "Legacy enterprise tech now focused on hybrid cloud (Red Hat) and consulting. Decent dividend.",
    industries: ["saas", "big_tech"],
    country: "US",
  },

  // ─── More Cars / EV ───────────────────────────────────────────
  {
    ticker: "NIO",
    name: "NIO Inc.",
    friendlyName: "NIO",
    shortDescription:
      "Chinese EV maker. Premium positioning, battery-swap network. Loss-making, competitive Chinese EV market.",
    industries: ["cars"],
    country: "CN",
  },
  {
    ticker: "XPEV",
    name: "XPeng Inc.",
    friendlyName: "XPeng",
    shortDescription:
      "Chinese EV maker with a focus on autonomous-driving tech. Competing in a brutal Chinese price war.",
    industries: ["cars", "ai"],
    country: "CN",
  },
  {
    ticker: "LI",
    name: "Li Auto Inc.",
    friendlyName: "Li Auto",
    shortDescription:
      "Chinese EV maker focused on range-extender SUVs for families. Profitable, unusual for a new EV brand.",
    industries: ["cars"],
    country: "CN",
  },

  // ─── More Defense ─────────────────────────────────────────────
  {
    ticker: "HII",
    name: "Huntington Ingalls Industries Inc.",
    friendlyName: "Huntington Ingalls",
    shortDescription:
      "Largest US shipbuilder. Builds Navy aircraft carriers and submarines. Hard to disrupt — gov contracts.",
    industries: ["defense", "industrials"],
    country: "US",
  },

  // ─── More Energy ──────────────────────────────────────────────
  {
    ticker: "OXY",
    name: "Occidental Petroleum Corporation",
    friendlyName: "Occidental Petroleum",
    shortDescription:
      "US oil + chemicals. Famously a Warren Buffett favourite. Big carbon-capture ambitions.",
    industries: ["energy"],
    country: "US",
  },
  {
    ticker: "EOG",
    name: "EOG Resources Inc.",
    friendlyName: "EOG Resources",
    shortDescription:
      "US shale oil/gas producer. Lower-cost than peers, disciplined capital returns.",
    industries: ["energy"],
    country: "US",
  },
  {
    ticker: "EQNR",
    name: "Equinor ASA",
    friendlyName: "Equinor",
    shortDescription:
      "Norwegian state-controlled energy giant. Oil/gas + meaningful renewables push (offshore wind).",
    industries: ["energy", "clean_energy"],
    country: "NO",
  },

  // ─── More Clean Energy ────────────────────────────────────────
  {
    ticker: "RUN",
    name: "Sunrun Inc.",
    friendlyName: "Sunrun",
    shortDescription:
      "Largest US residential solar installer. Subscription model — like a utility but with rooftop solar.",
    industries: ["clean_energy"],
    country: "US",
  },
  {
    ticker: "SEDG",
    name: "SolarEdge Technologies Inc.",
    friendlyName: "SolarEdge",
    shortDescription:
      "Solar inverters + storage. Israeli-headquartered. Hit hard by the 2022-23 solar downturn.",
    industries: ["clean_energy"],
    country: "IL",
  },

  // ─── More Travel ──────────────────────────────────────────────
  {
    ticker: "HLT",
    name: "Hilton Worldwide Holdings Inc.",
    friendlyName: "Hilton",
    shortDescription:
      "Hilton, Conrad, Waldorf Astoria, Hampton Inn… Franchise model — lower capital intensity than owning hotels.",
    industries: ["travel"],
    country: "US",
  },
  {
    ticker: "RCL",
    name: "Royal Caribbean Cruises Ltd",
    friendlyName: "Royal Caribbean",
    shortDescription:
      "Largest cruise operator. Strong rebound post-COVID. High debt load is a feature of the cruise business.",
    industries: ["travel"],
    country: "US",
  },
  {
    ticker: "CCL",
    name: "Carnival Corporation",
    friendlyName: "Carnival",
    shortDescription:
      "Biggest cruise company by ship count (Carnival, Princess, Holland America, Cunard). Heavily indebted.",
    industries: ["travel"],
    country: "US",
  },

  // ─── More Robotics ────────────────────────────────────────────
  {
    ticker: "ROK",
    name: "Rockwell Automation Inc.",
    friendlyName: "Rockwell Automation",
    shortDescription:
      "US industrial automation leader. Sells factory-floor control systems and software.",
    industries: ["robotics", "industrials"],
    country: "US",
  },

  // ─── More Pharma ──────────────────────────────────────────────
  {
    ticker: "PFE",
    name: "Pfizer Inc.",
    friendlyName: "Pfizer",
    shortDescription:
      "US pharma giant. Post-COVID slump — they're hunting for the next blockbuster franchise.",
    industries: ["pharma"],
    country: "US",
  },
  {
    ticker: "MRK",
    name: "Merck & Co. Inc.",
    friendlyName: "Merck",
    shortDescription:
      "Maker of Keytruda — the world's best-selling cancer drug. Looking ahead to its patent cliff.",
    industries: ["pharma"],
    country: "US",
  },
  {
    ticker: "NVS",
    name: "Novartis AG",
    friendlyName: "Novartis",
    shortDescription:
      "Swiss pharma giant. Strong oncology pipeline, recently spun off Sandoz (generics).",
    industries: ["pharma"],
    country: "CH",
  },
  {
    ticker: "BMY",
    name: "Bristol-Myers Squibb Company",
    friendlyName: "Bristol-Myers Squibb",
    shortDescription:
      "Big US pharma. Eliquis (blood thinner) is the cash cow but faces a patent cliff this decade.",
    industries: ["pharma"],
    country: "US",
  },
  {
    ticker: "GILD",
    name: "Gilead Sciences Inc.",
    friendlyName: "Gilead",
    shortDescription:
      "HIV + hepatitis-C leader. Newer cancer franchise is the growth bet.",
    industries: ["pharma"],
    country: "US",
  },

  // ─── More Luxury ──────────────────────────────────────────────
  {
    ticker: "EL",
    name: "The Estée Lauder Companies Inc.",
    friendlyName: "Estée Lauder",
    shortDescription:
      "Premium cosmetics (Estée Lauder, La Mer, MAC, Clinique). Heavy China exposure — bruised the last 2-3 years.",
    industries: ["luxury", "retail"],
    country: "US",
  },
  {
    ticker: "KER.PA",
    name: "Kering S.A.",
    friendlyName: "Kering (Gucci, YSL)",
    shortDescription:
      "Owns Gucci, Saint Laurent, Bottega Veneta, Balenciaga. Currently struggling vs LVMH and Hermès.",
    industries: ["luxury"],
    country: "FR",
  },

  // ─── More E-commerce ──────────────────────────────────────────
  {
    ticker: "ETSY",
    name: "Etsy Inc.",
    friendlyName: "Etsy",
    shortDescription:
      "Marketplace for handmade/vintage goods. Struggled to grow since pandemic peak.",
    industries: ["ecommerce"],
    country: "US",
  },
  {
    ticker: "PYPL",
    name: "PayPal Holdings Inc.",
    friendlyName: "PayPal",
    shortDescription:
      "Digital payments + Venmo. Was a darling, now a turnaround story.",
    industries: ["payments", "finance"],
    country: "US",
  },

  // ─── More Finance ─────────────────────────────────────────────
  {
    ticker: "V",
    name: "Visa Inc.",
    friendlyName: "Visa",
    shortDescription:
      "The biggest card network. Toll-collector on global card spending. Wide moat, predictable cash flows.",
    industries: ["payments", "finance"],
    country: "US",
  },
  {
    ticker: "MA",
    name: "Mastercard Incorporated",
    friendlyName: "Mastercard",
    shortDescription:
      "The other big card network. Same toll-collector model as Visa. Often moves in lockstep.",
    industries: ["payments", "finance"],
    country: "US",
  },
  {
    ticker: "BLK",
    name: "BlackRock Inc.",
    friendlyName: "BlackRock",
    shortDescription:
      "World's largest asset manager — runs ~$10 trillion. Owner of iShares (the ETF brand).",
    industries: ["finance"],
    country: "US",
  },
  {
    ticker: "AXP",
    name: "American Express Company",
    friendlyName: "American Express",
    shortDescription:
      "Premium card network + bank. Charges merchant fees + cardholder fees. Buffett favourite.",
    industries: ["payments", "finance"],
    country: "US",
  },
  {
    ticker: "MS",
    name: "Morgan Stanley",
    friendlyName: "Morgan Stanley",
    shortDescription:
      "Investment bank + large wealth management business (E*TRADE).",
    industries: ["finance"],
    country: "US",
  },
  {
    ticker: "SCHW",
    name: "The Charles Schwab Corporation",
    friendlyName: "Charles Schwab",
    shortDescription:
      "US brokerage giant. Owns TD Ameritrade. Earnings sensitive to interest rates.",
    industries: ["finance"],
    country: "US",
  },

  // ─── More Singapore ───────────────────────────────────────────
  {
    ticker: "U11.SI",
    name: "United Overseas Bank Limited",
    friendlyName: "UOB",
    shortDescription:
      "Singapore's third-largest bank. Strong ASEAN presence. Solid dividend payer.",
    industries: ["finance", "singapore"],
    country: "SG",
  },
  {
    ticker: "O39.SI",
    name: "Oversea-Chinese Banking Corporation Limited",
    friendlyName: "OCBC Bank",
    shortDescription:
      "Singapore's second-largest bank. Major wealth-management focus (Bank of Singapore subsidiary).",
    industries: ["finance", "singapore"],
    country: "SG",
  },
  {
    ticker: "F34.SI",
    name: "Wilmar International Limited",
    friendlyName: "Wilmar International",
    shortDescription:
      "Asian agribusiness giant — palm oil, sugar, rice. Listed in Singapore, big China exposure.",
    industries: ["industrials", "singapore"],
    country: "SG",
  },
  {
    ticker: "9CI.SI",
    name: "CapitaLand Investment Limited",
    friendlyName: "CapitaLand Investment",
    shortDescription:
      "Singapore-based real estate manager. Asia-Pacific malls, offices, lodging. Asset-light spin-off of CapitaLand.",
    industries: ["finance", "singapore"],
    country: "SG",
  },
  {
    ticker: "S63.SI",
    name: "Singapore Technologies Engineering Ltd",
    friendlyName: "ST Engineering",
    shortDescription:
      "Singapore's defence + aerospace + smart-city engineering champion. State-linked.",
    industries: ["defense", "industrials", "singapore"],
    country: "SG",
  },
  {
    ticker: "J36.SI",
    name: "Jardine Matheson Holdings Limited",
    friendlyName: "Jardine Matheson",
    shortDescription:
      "Hong Kong-based conglomerate listed in Singapore. Real estate, motor dealerships, supermarkets, financial services.",
    industries: ["finance", "industrials", "singapore"],
    country: "SG",
  },

  // ─── Retail & Consumer ────────────────────────────────────────
  {
    ticker: "WMT",
    name: "Walmart Inc.",
    friendlyName: "Walmart",
    shortDescription:
      "World's largest retailer. Both physical stores and a fast-growing e-commerce business.",
    industries: ["retail", "ecommerce"],
    country: "US",
  },
  {
    ticker: "COST",
    name: "Costco Wholesale Corporation",
    friendlyName: "Costco",
    shortDescription:
      "Membership-based warehouse retailer. Earns most of its profit from membership fees, not margins on goods.",
    industries: ["retail"],
    country: "US",
  },
  {
    ticker: "HD",
    name: "The Home Depot Inc.",
    friendlyName: "Home Depot",
    shortDescription:
      "US home-improvement leader. Cyclical with housing — has held up well through high interest rates.",
    industries: ["retail"],
    country: "US",
  },
  {
    ticker: "NKE",
    name: "NIKE Inc.",
    friendlyName: "Nike",
    shortDescription:
      "World's biggest sportswear brand. Struggling vs newer entrants (On, Hoka, Lululemon) and weak China.",
    industries: ["retail", "luxury"],
    country: "US",
  },
  {
    ticker: "SBUX",
    name: "Starbucks Corporation",
    friendlyName: "Starbucks",
    shortDescription:
      "World's biggest coffee chain. In turnaround mode after weak China + slow US transactions.",
    industries: ["retail"],
    country: "US",
  },
  {
    ticker: "MCD",
    name: "McDonald's Corporation",
    friendlyName: "McDonald's",
    shortDescription:
      "Iconic fast-food chain. Largely franchised — earns fees from operators. Steady dividend.",
    industries: ["retail"],
    country: "US",
  },
  {
    ticker: "LULU",
    name: "Lululemon Athletica Inc.",
    friendlyName: "Lululemon",
    shortDescription:
      "Premium athletic wear (yoga + men's). After years of growth, slowing now.",
    industries: ["retail", "luxury"],
    country: "US",
  },

  // ─── Telecom ──────────────────────────────────────────────────
  {
    ticker: "VZ",
    name: "Verizon Communications Inc.",
    friendlyName: "Verizon",
    shortDescription:
      "US wireless + fibre carrier. High dividend, slow grower. Big infrastructure capex.",
    industries: ["telecom"],
    country: "US",
  },
  {
    ticker: "TMUS",
    name: "T-Mobile US Inc.",
    friendlyName: "T-Mobile",
    shortDescription:
      "US carrier benefiting from the Sprint merger synergies. Best 5G coverage. Growing subscribers fastest.",
    industries: ["telecom"],
    country: "US",
  },
  {
    ticker: "VOD",
    name: "Vodafone Group plc",
    friendlyName: "Vodafone",
    shortDescription:
      "UK-headquartered global telecom. Pan-European operations, plus Africa. Long dividend history; recently cut.",
    industries: ["telecom"],
    country: "GB",
  },

  // ─── Industrials ──────────────────────────────────────────────
  {
    ticker: "CAT",
    name: "Caterpillar Inc.",
    friendlyName: "Caterpillar",
    shortDescription:
      "Yellow construction equipment + mining gear + engines. Strongly cyclical with construction spending.",
    industries: ["industrials"],
    country: "US",
  },
  {
    ticker: "DE",
    name: "Deere & Company",
    friendlyName: "John Deere",
    shortDescription:
      "Agricultural equipment leader. Cyclical with farm income. Pushing into precision agriculture / AI in the field.",
    industries: ["industrials", "ai"],
    country: "US",
  },
  {
    ticker: "GE",
    name: "GE Aerospace",
    friendlyName: "GE Aerospace",
    shortDescription:
      "Post-spin-off, GE is purely jet engines (LEAP for Airbus/Boeing single-aisles). Air-travel cycle exposure.",
    industries: ["industrials", "defense"],
    country: "US",
  },
  {
    ticker: "HON",
    name: "Honeywell International Inc.",
    friendlyName: "Honeywell",
    shortDescription:
      "Diversified industrial — aerospace systems, building automation, safety, performance materials.",
    industries: ["industrials"],
    country: "US",
  },

  // ─── Media & Entertainment ────────────────────────────────────
  // (DIS and SPOT are tagged into media via their entries above)

  // ─── Crypto-adjacent ──────────────────────────────────────────
  {
    ticker: "COIN",
    name: "Coinbase Global Inc.",
    friendlyName: "Coinbase",
    shortDescription:
      "Largest US crypto exchange. Revenue swings wildly with crypto-market volume + Bitcoin price.",
    industries: ["crypto", "finance"],
    country: "US",
  },
  {
    ticker: "MSTR",
    name: "MicroStrategy Incorporated",
    friendlyName: "MicroStrategy",
    shortDescription:
      "Software company that pivoted to a 'Bitcoin treasury' strategy — holds billions in BTC. Effectively a leveraged Bitcoin proxy.",
    industries: ["crypto"],
    country: "US",
  },

  // ─── France large-caps (CAC 40) ───────────────────────────────
  {
    ticker: "SAF.PA",
    name: "Safran SA",
    friendlyName: "Safran",
    shortDescription:
      "Jet engines (co-makes the LEAP with GE) and aircraft equipment. Earns for decades servicing engines it sold.",
    industries: ["defense", "industrials"],
    country: "FR",
  },
  {
    ticker: "HO.PA",
    name: "Thales SA",
    friendlyName: "Thales",
    shortDescription:
      "French defence-electronics champion: radars, secure comms, avionics, cybersecurity. European rearmament play.",
    industries: ["defense"],
    country: "FR",
  },
  {
    ticker: "SU.PA",
    name: "Schneider Electric SE",
    friendlyName: "Schneider Electric",
    shortDescription:
      "Global leader in electrical gear and energy management — a core electrification and data-centre-power play.",
    industries: ["industrials", "clean_energy"],
    country: "FR",
  },
  {
    ticker: "AI.PA",
    name: "L'Air Liquide SA",
    friendlyName: "Air Liquide",
    shortDescription:
      "Industrial gases (oxygen, nitrogen, hydrogen) for industry and healthcare. Steady, defensive compounder.",
    industries: ["industrials"],
    country: "FR",
  },
  {
    ticker: "DG.PA",
    name: "Vinci SA",
    friendlyName: "Vinci",
    shortDescription:
      "Construction and concessions — builds and operates motorways and airports. Toll/airport cash flows + building.",
    industries: ["industrials"],
    country: "FR",
  },
  {
    ticker: "OR.PA",
    name: "L'Oréal SA",
    friendlyName: "L'Oréal",
    shortDescription:
      "World's biggest cosmetics group (Lancôme, Maybelline, La Roche-Posay). Defensive consumer with premium tilt.",
    industries: ["luxury", "retail"],
    country: "FR",
  },
  {
    ticker: "RI.PA",
    name: "Pernod Ricard SA",
    friendlyName: "Pernod Ricard",
    shortDescription:
      "Global spirits house (Absolut, Jameson, Martell, Chivas). Premium drinks brand portfolio.",
    industries: ["retail", "luxury"],
    country: "FR",
  },
  {
    ticker: "SAN.PA",
    name: "Sanofi SA",
    friendlyName: "Sanofi",
    shortDescription:
      "French pharma major — immunology blockbuster Dupixent plus vaccines. Defensive healthcare.",
    industries: ["pharma"],
    country: "FR",
  },
  {
    ticker: "DSY.PA",
    name: "Dassault Systèmes SE",
    friendlyName: "Dassault Systèmes",
    shortDescription:
      "3D design and engineering software (CATIA, SolidWorks). High-margin industrial software compounder.",
    industries: ["saas"],
    country: "FR",
  },
  {
    ticker: "CAP.PA",
    name: "Capgemini SE",
    friendlyName: "Capgemini",
    shortDescription:
      "Global IT services and consulting — digital transformation, cloud, and AI integration for enterprises.",
    industries: ["saas"],
    country: "FR",
  },
  {
    ticker: "BNP.PA",
    name: "BNP Paribas SA",
    friendlyName: "BNP Paribas",
    shortDescription:
      "The eurozone's largest bank by assets. Retail, corporate and investment banking across Europe.",
    industries: ["finance"],
    country: "FR",
  },
  {
    ticker: "CS.PA",
    name: "AXA SA",
    friendlyName: "AXA",
    shortDescription:
      "One of the world's biggest insurers — life, property & casualty, and asset management.",
    industries: ["finance"],
    country: "FR",
  },
];
