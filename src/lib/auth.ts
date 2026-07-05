import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { username } from "better-auth/plugins"

import { db } from "@/lib/db"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
  },
  // nextCookies must stay last so server actions can set cookies
  plugins: [username(), nextCookies()],
})

export type Session = typeof auth.$Infer.Session
