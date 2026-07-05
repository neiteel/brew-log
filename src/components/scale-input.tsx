"use client"

import { useState } from "react"

import { Paren } from "./field"

const SCALE_MAX = 10

// Input twin of the TasteScale display row: same grid anatomy and segmented
// bar, but each segment is a button. Clicking segment n sets the value to n;
// clicking the current value clears it. A hidden input carries the value.
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
    <div className="border-border text-body grid grid-cols-[6.5rem_1fr_1.5rem] items-center gap-x-3 border-b py-3 md:grid-cols-12 md:gap-x-5">
      <p className="md:col-span-2">
        <Paren>{label}</Paren>
      </p>
      <div className="flex gap-1 md:col-span-4">
        {Array.from({ length: SCALE_MAX }, (_, i) => {
          const segment = i + 1
          return (
            <button
              key={segment}
              type="button"
              aria-label={`${label} ${segment} of ${SCALE_MAX}`}
              aria-pressed={value === segment}
              onClick={() => setValue(value === segment ? null : segment)}
              className={
                value != null && segment <= value
                  ? "bg-foreground h-3.5 flex-1 cursor-pointer"
                  : "border-border hover:border-foreground h-3.5 flex-1 cursor-pointer border transition-colors"
              }
            />
          )
        })}
      </div>
      <p className="text-muted-foreground md:col-span-6">{value ?? "—"}</p>
      <input type="hidden" name={name} value={value ?? ""} />
    </div>
  )
}

export { ScaleInput }
