import { count, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { beans, brews } from "@/lib/db/schema"

// Per-user record caps — an anti-abuse ceiling, not a product tier. Enforced
// only in the create server actions; seeds insert directly and may exceed
// them on purpose.
export const MAX_BEANS_PER_USER = 10
export const MAX_BREWS_PER_USER = 50

export async function countBeans(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(beans)
    .where(eq(beans.userId, userId))
  return row.value
}

export async function countBrews(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(brews)
    .where(eq(brews.userId, userId))
  return row.value
}
