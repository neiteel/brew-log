"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

import { DATA_ROW_MEASURE, Paren } from "./field"

const SCALE_MAX = 10

// Input twin of the TasteScale display row: same grid anatomy and segmented
// bar, but each segment is a native radio. Picking segment n sets the value to
// n; picking the current value again clears it back to "not recorded".
//
// Native radios rather than eleven toggle buttons, because the browser then
// supplies the entire keyboard and screen-reader contract for free: one tab
// stop per axis instead of eleven — six axes had put 66 stops between the
// recipe and the notes field — arrow keys that move and select, and the
// grouped "8 of 11" announcement that a row of `aria-pressed` toggles cannot
// express. They also carry their own form value, so an unscored axis submits
// no key at all and reaches the schema as undefined, which it already reads as
// null. Nothing here hand-rolls a roving tabindex or a keydown map.
//
// The narrow leading marker is 0. The schema accepts 0–10 and 0 is a real
// score ("no acidity at all"), but ten counting segments can only express
// 1–10 — without the marker, zero was unreachable. It is kept out of the
// count and detached by a wider gap so a score of 7 still shows 7 filled
// segments; the display twin needs no marker because it prints the numeral.
function ScaleInput({
  label,
  name,
  defaultValue,
}: {
  label: string
  name: string
  defaultValue?: number | null
}) {
  const [value, setValue] = useState<number | null>(defaultValue ?? null)

  return (
    <div
      className={cn(
        "border-border text-body grid grid-cols-[6.5rem_1fr_1.5rem] items-center gap-x-3 border-b py-3 md:grid-cols-[8rem_1fr_2.5rem] md:gap-x-5",
        DATA_ROW_MEASURE,
      )}
    >
      <p>
        <Paren>{label}</Paren>
      </p>
      {/* Native radios already group themselves by `name`, but a group with no
          accessible name announces as an anonymous "1 of 11". `aria-label`
          rather than pointing at the visible label, because that label is
          parenthesised for the eye — the name a speech-input user says is
          "Acidity", not "open paren Acidity". */}
      <div
        role="radiogroup"
        aria-label={label}
        // Backspace clears the axis. Re-picking the current score clears it by
        // pointer, but a radio that is already checked swallows Space without
        // firing `click`, so the pointer gesture has no keyboard twin — and
        // without one, a keyboard user who scored an optional axis by mistake
        // could never get it back to "not recorded".
        onKeyDown={(event) => {
          if (event.key === "Backspace" || event.key === "Delete") {
            event.preventDefault()
            setValue(null)
          }
        }}
        className="flex gap-1"
      >
        {Array.from({ length: SCALE_MAX + 1 }, (_, segment) => {
          const zero = segment === 0
          const filled =
            value != null && (zero ? value === 0 : segment <= value)
          return (
            <label
              key={segment}
              // The bar stays 14px; the hit area grows around it. Six scales
              // means 66 targets on one form, and at 17.8x14 they were ~40% of
              // the 24x24 minimum — a real miss rate for the primary user,
              // tapping one-handed right after a pour. The zero marker gets the
              // same treatment: a 16px bar centred in a 24px box, since a 16px
              // target was the one segment still under the floor, and it is the
              // hardest to hit for being the narrowest thing on the row.
              className={cn(
                "group relative cursor-pointer py-1.25",
                zero ? "w-6 flex-none" : "flex-1",
              )}
            >
              <input
                type="radio"
                name={name}
                value={segment}
                checked={value === segment}
                // The accessible name is the bare numeral: the radiogroup
                // already carries the axis, and anything longer would need a
                // sentence template, which is where the English "7 of 10" that
                // shipped to zh-Hant readers came from.
                aria-label={String(segment)}
                onChange={() => setValue(segment)}
                // Re-picking the current score clears it. `change` never
                // fires on an already-checked radio, so the un-pick rides
                // `click` instead. `value` here is the pre-event render's
                // value, so a fresh pick reads as a mismatch and falls
                // through. Keyboard clearing is Backspace on the group, above.
                onClick={() => {
                  if (value === segment) setValue(null)
                }}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "peer-focus-visible:outline-ring block h-3.5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
                  zero && "mx-auto w-4",
                  filled
                    ? "bg-foreground"
                    : "border-border-strong group-hover:border-foreground border transition-colors",
                )}
              />
            </label>
          )
        })}
      </div>
      {/* Visual readout only. The radiogroup is the accessible source of truth
          for the score, and an em dash spoken aloud says nothing that the
          absence of a checked radio does not already say. */}
      <p
        aria-hidden
        className="text-muted-foreground tabular-nums md:text-right"
      >
        {value ?? "—"}
      </p>
    </div>
  )
}

export { ScaleInput }
