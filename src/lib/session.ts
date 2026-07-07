import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

// Wrapped in React.cache so the layout and page (and any nested reads) share a
// single session lookup per request. Without a Better Auth cookie cache,
// auth.api.getSession hits the database on every call, so deduping here removes
// a redundant DB round-trip on every authenticated page.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

export async function requireSession() {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}
