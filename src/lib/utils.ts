import type { ClassValue } from "clsx"

import { clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// The type scale ships as named utilities (`text-body`, `text-h2`, `text-small`
// …), and tailwind-merge cannot tell those from `text-<color>`: unconfigured it
// read `cn("text-body", "text-destructive")` as one conflict and dropped the
// size, so a component given a color silently lost its font-size. Two live call
// sites were already losing theirs. Registering the scale as font-size splits
// the two groups, so a size and a color can coexist.
//
// Keep this list in sync with the `--text-*` tokens in globals.css.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display", "h1", "h2", "h3", "body", "small", "kicker"] },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
