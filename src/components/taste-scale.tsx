import { Paren } from "@/components/field"

export type TasteProfile = {
  aroma: number
  sweetness: number
  acidity: number
  bitterness: number
  body: number
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
            className="border-border text-body grid grid-cols-[6.5rem_1fr_1.5rem] items-center gap-x-3 border-b py-3 md:grid-cols-12 md:gap-x-5"
          >
            <p className="md:col-span-2">
              <Paren>{label}</Paren>
            </p>
            <div className="flex gap-1 md:col-span-4" aria-hidden>
              {Array.from({ length: SCALE_MAX }, (_, i) => (
                <span
                  key={i}
                  className={
                    i < score
                      ? "bg-foreground h-3.5 flex-1"
                      : "border-border h-3.5 flex-1 border"
                  }
                />
              ))}
            </div>
            <p
              aria-label={`${label} ${score} of ${SCALE_MAX}`}
              className="md:col-span-6"
            >
              {score}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export { TasteScale }
