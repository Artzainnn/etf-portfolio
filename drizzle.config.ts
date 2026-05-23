import type { Config } from "drizzle-kit";
import { config as loadEnv } from "dotenv";

// Load .env.local first (Next.js convention), then fall back to .env
loadEnv({ path: ".env.local" });
loadEnv();

if (!process.env.POSTGRES_URL) {
  throw new Error(
    "POSTGRES_URL is not set. Add it to .env.local — see .env.example for the format.",
  );
}

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
  verbose: true,
  strict: true,
} satisfies Config;
