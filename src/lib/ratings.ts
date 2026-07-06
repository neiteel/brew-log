import { and, avg, count, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { brewRatings } from "@/lib/db/schema"

export type RatingSummary = {
  /** Mean of all star votes, or null when there are none. */
  average: number | null
  /** How many members have rated this brew. */
  count: number
  /** The current viewer's own vote (1–5), or null if they haven't rated. */
  mine: number | null
}

/**
 * Aggregate community star ratings for one brew, plus the viewer's own vote.
 * `userId` is optional — pass it for logged-in viewers so `mine` is populated.
 */
export async function getRatingSummary(
  brewId: string,
  userId?: string,
): Promise<RatingSummary> {
  const [[agg], mineRow] = await Promise.all([
    db
      .select({ average: avg(brewRatings.value), value: count() })
      .from(brewRatings)
      .where(eq(brewRatings.brewId, brewId)),
    userId
      ? db
          .select({ value: brewRatings.value })
          .from(brewRatings)
          .where(
            and(eq(brewRatings.brewId, brewId), eq(brewRatings.userId, userId)),
          )
          .limit(1)
      : Promise.resolve([]),
  ])

  return {
    // drizzle's avg() returns a numeric string (or null); coerce to number.
    average: agg.average != null ? Number(agg.average) : null,
    count: agg.value,
    mine: mineRow[0]?.value ?? null,
  }
}
