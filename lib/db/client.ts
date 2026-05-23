import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[db] POSTGRES_URL is not set. Database queries will fail until you set it in .env.local",
    );
  }
}

/**
 * The postgres-js driver works with both local Postgres (over TCP) and
 * managed providers like Neon, Supabase, or Vercel Postgres.
 *
 * When you're ready to deploy:
 *   - Sign up at https://neon.tech, create a project, and copy the
 *     "Pooled connection" string into POSTGRES_URL.
 *   - No code change required.
 */
const client = postgres(connectionString ?? "postgres://invalid", {
  // Keep the pool small for serverless-ish environments.
  max: 10,
  // Disable prepared statements for compatibility with Neon's pooler later.
  prepare: false,
});

export const db = drizzle(client, { schema });
export { schema };
