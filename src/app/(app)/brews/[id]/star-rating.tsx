"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Star, StarRow } from "@/components/star-meter"

import { rateBrew, removeRating } from "./rating-actions"

export function StarRating({
  brewId,
  average,
  count,
  mine,
  canRate,
}: {
  brewId: string
  average: number | null
  count: number
  mine: number | null
  /** True only for logged-in members who don't own this brew. */
  canRate: boolean
}) {
  const router = useRouter()
  const [optimistic, setOptimistic] = useState<number | null>(mine)
  const [hover, setHover] = useState<number | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function submit(value: number) {
    setError(null)
    const previous = optimistic
    setOptimistic(value)
    startTransition(async () => {
      const result = await rateBrew(brewId, value)
      if (!result.ok) {
        setOptimistic(previous)
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  function clear() {
    setError(null)
    const previous = optimistic
    setOptimistic(null)
    startTransition(async () => {
      const result = await removeRating(brewId)
      if (!result.ok) {
        setOptimistic(previous)
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-baseline gap-3">
        {average != null ? (
          <>
            <StarRow value={average} />
            <span className="text-body font-medium">{average.toFixed(1)}</span>
            <span className="text-small text-muted-foreground">
              {count} {count === 1 ? "rating" : "ratings"}
            </span>
          </>
        ) : (
          <span className="text-body text-muted-foreground">
            No ratings yet
          </span>
        )}
      </div>

      {canRate ? (
        <div className="space-y-2">
          <p className="text-small text-muted-foreground">
            {optimistic ? "Your rating" : "Rate this brew"}
          </p>
          <div className="flex items-center gap-3">
            <span
              className="flex items-center gap-1"
              onMouseLeave={() => setHover(null)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={pending}
                  onClick={() => submit(n)}
                  onMouseEnter={() => setHover(n)}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  aria-pressed={optimistic === n}
                  className="cursor-pointer p-0.5 disabled:cursor-default"
                >
                  <Star
                    fill={(hover ?? optimistic ?? 0) >= n ? 1 : 0}
                    size={24}
                  />
                </button>
              ))}
            </span>
            {optimistic ? (
              <button
                type="button"
                onClick={clear}
                disabled={pending}
                className="text-small text-muted-foreground hover:text-foreground underline underline-offset-4 disabled:no-underline"
              >
                Clear
              </button>
            ) : null}
          </div>
          {error ? (
            <p className="text-small text-destructive">{error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
