import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

// Wrapped in React.cache so the layout and page (and any nested reads) share a
// single session lookup per request.
//
// Sessions do not live in Postgres: `auth.ts` configures `secondaryStorage`, and
// Better Auth's `storeSessionInDatabase` defaults to false, so a session read is
// an Upstash GET returning session + user. `session.cookieCache` then serves most
// of those reads from a signed cookie, leaving Upstash for cache misses. This
// cache still earns its place — it collapses the layout's and page's reads into
// one, whichever source answers them.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

export async function requireSession() {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}
