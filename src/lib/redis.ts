import { Redis } from "@upstash/redis"

// Upstash Redis over its REST API — works on Vercel's serverless runtime where
// a long-lived TCP connection isn't available. Currently backs Better Auth's
// rate-limit storage (see `auth.ts`) so limits are shared across instances and
// survive cold starts, instead of the default in-memory store that resets per
// invocation.
//
// `automaticDeserialization: false` is deliberate: the client otherwise runs
// JSON.parse on every GET, but Better Auth stores JSON strings and parses them
// itself — double-parsing would corrupt the values it reads back.
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  automaticDeserialization: false,
})
