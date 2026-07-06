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
