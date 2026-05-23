import {
  pgTable,
  serial,
  varchar,
  text,
  decimal,
  boolean,
  integer,
  date,
  timestamp,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Reference table of ETFs we track. Pre-seeded from a curated list of
 * UCITS ETFs available on IBKR Singapore.
 */
export const etfs = pgTable(
  "etfs",
  {
    id: serial("id").primaryKey(),
    ticker: varchar("ticker", { length: 20 }).notNull().unique(),
    isin: varchar("isin", { length: 12 }),
    name: varchar("name", { length: 255 }).notNull(),
    // Plain-language nickname shown to the user as the primary heading.
    // The official `name` is shown smaller as supporting metadata.
    friendlyName: varchar("friendly_name", { length: 120 }),
    shortDescription: text("short_description"),
    longDescription: text("long_description"),
    category: varchar("category", { length: 50 }), // broad_market, sector, thematic, region, bond, commodity
    subCategory: varchar("sub_category", { length: 50 }),
    // Total Expense Ratio as a decimal (e.g. 0.0007 = 0.07%)
    ter: decimal("ter", { precision: 5, scale: 4 }),
    domicile: varchar("domicile", { length: 20 }), // Ireland, Luxembourg, US
    isUcits: boolean("is_ucits").default(true).notNull(),
    isAccumulating: boolean("is_accumulating"),
    exchange: varchar("exchange", { length: 20 }), // LSE, Xetra, Euronext
    currency: varchar("currency", { length: 3 }), // USD, EUR, GBP, SGD
    riskScore: integer("risk_score"),
    inceptionDate: date("inception_date"),
    ibkrAvailable: boolean("ibkr_available").default(true).notNull(),
    ibkrSymbol: varchar("ibkr_symbol", { length: 20 }),
    factSheetUrl: varchar("fact_sheet_url", { length: 500 }),
    issuer: varchar("issuer", { length: 50 }),
    benchmark: varchar("benchmark", { length: 255 }),
    tags: text("tags").array(),
    // Beginner-friendly pros / cons shown in the expanded row.
    pros: text("pros").array(),
    cons: text("cons").array(),
    // Pre-computed performance stats (refreshed by scripts/refresh-stats.ts).
    // Returns are stored as decimal fractions (e.g. 0.1234 = +12.34%).
    return1Y: decimal("return_1y", { precision: 7, scale: 4 }),
    return3YAnnualized: decimal("return_3y_annualized", { precision: 7, scale: 4 }),
    return5YAnnualized: decimal("return_5y_annualized", { precision: 7, scale: 4 }),
    maxDrawdown5Y: decimal("max_drawdown_5y", { precision: 7, scale: 4 }),
    // ~30 sampled price points over the last 1Y, normalized to 100 at start.
    // Stored as JSONB for cheap reads at list-render time.
    sparkline1Y: text("sparkline_1y"),
    statsUpdatedAt: timestamp("stats_updated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("idx_etfs_category").on(table.category),
    riskCheck: check(
      "risk_score_range",
      sql`${table.riskScore} IS NULL OR (${table.riskScore} BETWEEN 1 AND 5)`,
    ),
  }),
);

/**
 * A saved portfolio (allocation strategy + simulation parameters).
 */
export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // Base currency for the portfolio simulation. Defaults to SGD for our user.
  baseCurrency: varchar("base_currency", { length: 3 }).default("SGD").notNull(),
  initialInvestment: decimal("initial_investment", { precision: 14, scale: 2 }),
  monthlyContribution: decimal("monthly_contribution", { precision: 14, scale: 2 }),
  durationYears: integer("duration_years"),
  reinvestDividends: boolean("reinvest_dividends").default(true).notNull(),
  // Optional: assumed annual inflation rate (decimal, e.g. 0.02 = 2%)
  inflationRate: decimal("inflation_rate", { precision: 5, scale: 4 }).default("0.0200"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Each ETF allocation within a portfolio. Percentages should sum to ~100.
 */
export const portfolioAllocations = pgTable("portfolio_allocations", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id")
    .references(() => portfolios.id, { onDelete: "cascade" })
    .notNull(),
  etfId: integer("etf_id")
    .references(() => etfs.id, { onDelete: "restrict" })
    .notNull(),
  // Percentage of the portfolio allocated to this ETF (e.g. 25.50 = 25.5%)
  allocationPercentage: decimal("allocation_percentage", { precision: 5, scale: 2 }).notNull(),
  notes: text("notes"),
});

/**
 * Cached daily prices fetched from Yahoo Finance. Avoids hammering Yahoo.
 * The cron job refreshes recent prices each day; historical prices are
 * backfilled on first access.
 */
export const priceCache = pgTable(
  "price_cache",
  {
    id: serial("id").primaryKey(),
    ticker: varchar("ticker", { length: 20 }).notNull(),
    date: date("date").notNull(),
    // Stored in the ETF's native trading currency. FX conversion happens
    // at simulation time using fx_cache.
    closePrice: decimal("close_price", { precision: 15, scale: 6 }),
    dividend: decimal("dividend", { precision: 15, scale: 6 }).default("0"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tickerDateUnique: uniqueIndex("price_cache_ticker_date_unique").on(
      table.ticker,
      table.date,
    ),
    tickerDateIdx: index("idx_price_cache_ticker_date").on(
      table.ticker,
      table.date.desc(),
    ),
  }),
);

/**
 * Cached daily FX rates so we can convert ETF prices to the user's base
 * currency (SGD) when computing returns. Pair format: "USDSGD", "EURSGD", etc.
 */
export const fxCache = pgTable(
  "fx_cache",
  {
    id: serial("id").primaryKey(),
    pair: varchar("pair", { length: 7 }).notNull(),
    date: date("date").notNull(),
    rate: decimal("rate", { precision: 15, scale: 6 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pairDateUnique: uniqueIndex("fx_cache_pair_date_unique").on(table.pair, table.date),
    pairDateIdx: index("idx_fx_cache_pair_date").on(table.pair, table.date.desc()),
  }),
);

// Type exports for convenience
export type Etf = typeof etfs.$inferSelect;
export type NewEtf = typeof etfs.$inferInsert;
export type Portfolio = typeof portfolios.$inferSelect;
export type NewPortfolio = typeof portfolios.$inferInsert;
export type PortfolioAllocation = typeof portfolioAllocations.$inferSelect;
export type NewPortfolioAllocation = typeof portfolioAllocations.$inferInsert;
export type PriceCacheRow = typeof priceCache.$inferSelect;
export type FxCacheRow = typeof fxCache.$inferSelect;
