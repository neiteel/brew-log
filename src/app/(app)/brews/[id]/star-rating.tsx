"use client"

import type { Messages } from "@/lib/i18n"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Star, StarRow } from "@/components/star-meter"
import { TextButton } from "@/components/text-button"

import { rateBrew, removeRating } from "./rating-actions"

const STARS = [1, 2, 3, 4, 5]

export function StarRating({
  brewId,
  average,
  count,
  mine,
  canRate,
  labels,
}: {
  brewId: string
  average: number | null
  count: number
  mine: number | null
  /** True only for logged-in members who don't own this brew. */
  canRate: boolean
  /** Localized community-section strings. */
  labels: Messages["community"]
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

  const groupLabel = optimistic ? labels.yourRating : labels.rateThis

  return (
    <div className="space-y-5">
      <div className="flex items-baseline gap-3">
        {average != null ? (
          <>
            <StarRow value={average} />
            <span className="text-body font-medium">{average.toFixed(1)}</span>
            <span className="text-small text-muted-foreground">
              {count}{" "}
              {count === 1 ? labels.ratingUnit : labels.ratingUnitPlural}
            </span>
          </>
        ) : (
          <span className="text-body text-muted-foreground">
            {labels.noRatings}
          </span>
        )}
      </div>

      {canRate ? (
        <div className="space-y-2">
          <p className="text-small text-muted-foreground">{groupLabel}</p>
          <div className="flex items-center gap-3">
            {/* Five scores is a fixed set, so it is a radio group — the same
                contract ScaleInput takes for the taste axes. The five
                `aria-pressed` buttons this replaces announced four of five
                stars as "not pressed" while they were visibly filled, put five
                tab stops in the row, and previewed the fill on pointer only.
                Arrow keys now move and select, so focus previews by definition.

                ponytail: arrowing across the row submits at each stop, since a
                radio checks as it moves. Each write is an idempotent upsert and
                the last one wins; debounce it only if the refresh traffic ever
                shows up. */}
            <span
              role="radiogroup"
              aria-label={groupLabel}
              className="flex items-center"
              onMouseLeave={() => setHover(null)}
            >
              {STARS.map((n) => (
                <label
                  key={n}
                  // The star stays 24px; the hit area grows around it, for a
                  // phone tapped one-handed at the brewing station.
                  className="cursor-pointer p-1"
                  onMouseEnter={() => setHover(n)}
                >
                  <input
                    type="radio"
                    name={`rating-${brewId}`}
                    value={n}
                    checked={optimistic === n}
                    // Deliberately not disabled while the write is in flight:
                    // a disabled element loses focus, which sent the caret to
                    // <body> on the first arrow key and killed traversal after
                    // one step. The optimistic value already reflects the pick,
                    // and a superseding pick is just another upsert.
                    aria-label={`${n} ${n === 1 ? labels.starUnit : labels.starUnitPlural}`}
                    onChange={() => submit(n)}
                    className="peer sr-only"
                  />
                  <span className="peer-focus-visible:outline-ring block peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                    <Star
                      fill={(hover ?? optimistic ?? 0) >= n ? 1 : 0}
                      size={24}
                    />
                  </span>
                </label>
              ))}
            </span>
            {optimistic ? (
              <TextButton
                type="button"
                onClick={clear}
                disabled={pending}
                className="text-small text-muted-foreground hover:text-foreground"
              >
                {labels.clear}
              </TextButton>
            ) : null}
          </div>
          {error ? (
            <p role="alert" className="text-small text-destructive">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
