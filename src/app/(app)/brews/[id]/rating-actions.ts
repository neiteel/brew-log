"use server"

import { revalidatePath } from "next/cache"

import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { brewRatings, brews } from "@/lib/db/schema"
import { requireSession } from "@/lib/session"

export type RateResult = { ok: true } | { ok: false; error: string }

/**
 * Cast (or change) the current member's 1–5 star vote on someone else's public
 * brew. One vote per (user, brew) — re-voting upserts the same row. You can't
 * rate a private brew or your own brew.
 */
export async function rateBrew(
  brewId: string,
  value: number,
): Promise<RateResult> {
  const session = await requireSession()

  if (!Number.isInteger(value) || value < 1 || value > 5)
    return { ok: false, error: "Rating must be 1–5 stars." }

  const brew = await db.query.brews.findFirst({
    columns: { userId: true, isPublic: true },
    where: eq(brews.id, brewId),
  })
  if (!brew || !brew.isPublic) return { ok: false, error: "Brew not found." }
  if (brew.userId === session.user.id)
    return { ok: false, error: "You can't rate your own brew." }

  await db
    .insert(brewRatings)
    .values({ brewId, userId: session.user.id, value })
    .onConflictDoUpdate({
      target: [brewRatings.userId, brewRatings.brewId],
      set: { value, updatedAt: new Date() },
    })

  revalidatePath(`/brews/${brewId}`)
  revalidatePath("/explore")
  return { ok: true }
}

/** Remove the current member's vote on a brew. No-op if they hadn't rated. */
export async function removeRating(brewId: string): Promise<RateResult> {
  const session = await requireSession()

  await db
    .delete(brewRatings)
    .where(
      and(
        eq(brewRatings.brewId, brewId),
        eq(brewRatings.userId, session.user.id),
      ),
    )

  revalidatePath(`/brews/${brewId}`)
  revalidatePath("/explore")
  return { ok: true }
}
