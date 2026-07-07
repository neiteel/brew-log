import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { username } from "better-auth/plugins"
import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { user as userTable } from "@/lib/db/schema"
import { sendEmail } from "@/lib/email"
import { resetPasswordEmail } from "@/lib/emails/reset-password"
import { verifyEmail } from "@/lib/emails/verify-email"
import { redis } from "@/lib/redis"

/**
 * Social sign-ups (Google) don't supply a username, but our public profile
 * pages live at /u/[username]. Derive a valid, unique username from the email
 * so every user gets a public page out of the box; they can change it later in
 * Settings. Matches the username plugin's rules (3–30 chars, [a-z0-9_.]).
 */
async function generateUniqueUsername(seed: string): Promise<string> {
  const base =
    seed
      .toLowerCase()
      .replace(/[^a-z0-9_.]/g, "")
      .replace(/^[._]+|[._]+$/g, "")
      .slice(0, 24) || "user"
  const root = base.length < 3 ? `user_${base}` : base
  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = (
      attempt === 0 ? root : `${root}${Math.floor(1000 + Math.random() * 9000)}`
    ).slice(0, 30)
    const existing = await db.query.user.findFirst({
      where: eq(userTable.username, candidate),
    })
    if (!existing) return candidate
  }
  return `${root}${Date.now().toString(36)}`.slice(0, 30)
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  // Back rate-limit counters with Upstash Redis so the limits are shared across
  // Vercel's serverless instances and survive cold starts. The default memory
  // store resets per invocation, which makes rate limiting a no-op on
  // serverless. Better Auth stores/reads JSON strings here (redis.ts disables
  // the client's automatic (de)serialization so the strings round-trip intact).
  secondaryStorage: {
    get: async (key) => (await redis.get<string>(key)) ?? null,
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, { ex: ttl })
      else await redis.set(key, value)
    },
    delete: async (key) => {
      await redis.del(key)
    },
    // Atomic increment for rate-limit counters. INCR creates the key at 1 when
    // absent; we set the TTL only on that first increment so the window expires
    // a fixed time after it opened, matching Better Auth's contract.
    increment: async (key, ttl) => {
      const value = await redis.incr(key)
      if (value === 1) await redis.expire(key, ttl)
      return value
    },
  },
  rateLimit: {
    // On in production only (Better Auth's default), so local sign-up/auth
    // testing isn't throttled. Flip to `true` temporarily to exercise the
    // limits in dev. Verified working against Redis before this default.
    enabled: process.env.NODE_ENV === "production",
    storage: "secondary-storage",
    customRules: {
      // Throttle sign-ups hard: the abuse vector is scripts mass-registering
      // accounts to farm free AI quota. Key is the path with the /api/auth base
      // stripped, per Better Auth's matcher.
      "/sign-up/email": { window: 3600, max: 5 },
    },
  },
  user: {
    additionalFields: {
      // UI language preference. Included on the session user; set via
      // authClient.updateUser({ locale }) from the Settings toggle. Input stays
      // enabled (default) so updateUser accepts it; sign-up never sends it, so
      // new users fall back to the "en" default.
      locale: {
        type: "string",
        required: false,
        defaultValue: "en",
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      // Link a Google sign-in to an existing email/password user with the same
      // (Google-verified) email, instead of erroring or creating a duplicate.
      // Linking still requires the *local* account's email to be verified
      // (Better Auth's secure default) — which the email-verification flow
      // below satisfies. This blocks account pre-hijacking: an attacker can't
      // link into a password account they registered under someone else's
      // email without also having verified that email.
      trustedProviders: ["google"],
    },
  },
  emailVerification: {
    // Send a verification email automatically on sign-up…
    sendOnSignUp: true,
    // …and sign the user in once they click the link.
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { subject, html, text } = verifyEmail({ url })
      await sendEmail({ to: user.email, subject, html, text })
    },
  },
  emailAndPassword: {
    enabled: true,
    // Sign users out everywhere once their password changes.
    revokeSessionsOnPasswordReset: true,
    // `url` points at Better Auth's /reset-password/:token endpoint, which
    // validates the token then redirects to our /reset-password page with
    // ?token=… (or ?error=INVALID_TOKEN). Also serves as the path for OAuth
    // users to set a password later — resetting creates a credential account.
    sendResetPassword: async ({ user, url }) => {
      const { subject, html, text } = resetPasswordEmail({ url })
      await sendEmail({ to: user.email, subject, html, text })
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Backfill a username for users created without one (Google sign-up).
        before: async (newUser) => {
          if (newUser.username) return
          const seed = newUser.email?.split("@")[0] || newUser.name || "user"
          const generated = await generateUniqueUsername(seed)
          return { data: { username: generated, displayUsername: generated } }
        },
      },
    },
  },
  // nextCookies must stay last so server actions can set cookies
  plugins: [username(), nextCookies()],
})

export type Session = typeof auth.$Infer.Session
