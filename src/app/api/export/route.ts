import { asc, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { beans, brews } from "@/lib/db/schema"
import { getSession } from "@/lib/session"

// Download-only export of the signed-in user's data — not a public API.
export async function GET() {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const [userBeans, userBrews] = await Promise.all([
    db.query.beans.findMany({
      where: eq(beans.userId, userId),
      orderBy: asc(beans.createdAt),
    }),
    db.query.brews.findMany({
      where: eq(brews.userId, userId),
      orderBy: asc(brews.createdAt),
    }),
  ])

  const payload = {
    exportedAt: new Date().toISOString(),
    beans: userBeans,
    brews: userBrews,
  }

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="brew-log-export.json"',
    },
  })
}
