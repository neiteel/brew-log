import { Redis } from "@upstash/redis"

// Upstash Redis over its REST API — works on Vercel's serverless runtime where
// a long-lived TCP connection isn't available. Backs Better Auth's
// `secondaryStorage` (see `auth.ts`), which means it holds two things: rate-limit
// counters — shared across instances and surviving cold starts, unlike the
// default in-memory store that resets per invocation — and, because
// `storeSessionInDatabase` defaults to false once secondary storage exists, the
// sessions themselves. Sessions are therefore stored here, not in Postgres.
//
// `automaticDeserialization: false` is deliberate: the client otherwise runs
// JSON.parse on every GET, but Better Auth stores JSON strings and parses them
// itself — double-parsing would corrupt the values it reads back.
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  automaticDeserialization: false,
})
