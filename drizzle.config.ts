import { defineConfig } from "drizzle-kit"

process.loadEnvFile?.(".env")

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // direct (non-pooled) connection for DDL; falls back to pooled
    url: (process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL)!,
  },
})
