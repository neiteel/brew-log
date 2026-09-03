import { DATA_ROW_MEASURE, Paren } from "@/components/field"
import { cn } from "@/lib/utils"

// null means the axis was never scored. 0 is a real score on a 0-10 scale
// ("no acidity at all"), so the two must never collapse into each other.
export type TasteProfile = {
  aroma: number | null
  sweetness: number | null
  acidity: number | null
  bitterness: number | null
  body: number | null
}

// The five dimension labels, already localized by the caller.
export type TasteLabels = Record<keyof TasteProfile, string>

const SCALE_MAX = 10

const ORDER: (keyof TasteProfile)[] = [
  "aroma",
  "sweetness",
  "acidity",
  "bitterness",
  "body",
]

// Segmented bar, 0–10 — same scale as the overall rating. Filled segments
// are black, empty ones keep a hairline outline, so integers stay countable.
function TasteScale({
  profile,
  labels,
}: {
  profile: TasteProfile
  labels: TasteLabels
}) {
  return (
    <div>
      {ORDER.map((key) => {
        const label = labels[key]
        const score = profile[key]
        return (
          <div
            key={key}
            className={cn(
              "border-border text-body grid grid-cols-[6.5rem_1fr_1.5rem] items-center gap-x-3 border-b py-3 md:grid-cols-[8rem_1fr_2.5rem] md:gap-x-5",
              DATA_ROW_MEASURE,
            )}
          >
            <p>
              <Paren>{label}</Paren>
            </p>
            <div className="flex gap-1" aria-hidden>
              {Array.from({ length: SCALE_MAX }, (_, i) => (
                <span
                  key={i}
                  className={
                    score != null && i < score
                      ? "bg-foreground h-3.5 flex-1"
                      : "border-border-strong h-3.5 flex-1 border"
                  }
                />
              ))}
            </div>
            {/* The label and the number are adjacent visible text, so the row
                reads as "Acidity 7" on its own. The aria-label this replaced
                sat on a <p>, a role that supports no accessible name, and was
                dropped by assistive tech anyway. */}
            <p className="tabular-nums md:text-right">
              {score ?? "—"}
              {/* The bar carries the maximum for the eye and is aria-hidden,
                  so without this the row was read aloud as "9" out of
                  nothing. Hidden visually because the numeral already sits
                  against ten visible segments. */}
              {score != null ? (
                <span className="sr-only"> / {SCALE_MAX}</span>
              ) : null}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export { TasteScale }
