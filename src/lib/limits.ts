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

/**
 * A quota line is a cost ceiling stated as fact, never an upgrade prompt
 * (PRODUCT.md principle 3) — but at 3 of 50 it is a countdown pushed in the
 * user's face at the exact moment they sit down to log a cup. Surface it only
 * once running out is actually close.
 */
export const QUOTA_NOTICE_AT = 0.8

export function nearQuota(count: number, max: number) {
  return count / max >= QUOTA_NOTICE_AT
}
