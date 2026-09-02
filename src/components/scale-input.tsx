"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

import { DATA_ROW_MEASURE, Paren } from "./field"

const SCALE_MAX = 10

// Input twin of the TasteScale display row: same grid anatomy and segmented
// bar, but each segment is a button. Clicking segment n sets the value to n;
// clicking the current value clears it. A hidden input carries the value.
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
      <div className="flex gap-1">
        {Array.from({ length: SCALE_MAX + 1 }, (_, segment) => {
          const zero = segment === 0
          const filled =
            value != null && (zero ? value === 0 : segment <= value)
          return (
            <button
              key={segment}
              type="button"
              aria-label={`${label} ${segment} of ${SCALE_MAX}`}
              aria-pressed={value === segment}
              onClick={() => setValue(value === segment ? null : segment)}
              // The bar stays 14px; the button grows around it. Six scales
              // means 60 targets on one form, and at 17.8x14 they were ~40% of
              // the 24x24 minimum — a real miss rate for the primary user,
              // tapping one-handed right after a pour.
              className={cn(
                "group cursor-pointer py-1.25",
                zero ? "mr-1 w-4 flex-none" : "flex-1",
              )}
            >
              <span
                className={
                  filled
                    ? "bg-foreground block h-3.5"
                    : "border-border-strong group-hover:border-foreground block h-3.5 border transition-colors"
                }
              />
            </button>
          )
        })}
      </div>
      <p className="text-muted-foreground tabular-nums md:text-right">
        {value ?? "—"}
      </p>
      <input type="hidden" name={name} value={value ?? ""} />
    </div>
  )
}

export { ScaleInput }
