import type { Locale } from "@/lib/i18n/config"

// One formatter per locale, built once. `en` stays on en-GB: the app is
// British-flavored English ("7 Jul 2026", grams, £), and switching it to
// en-US would reorder every date already on screen.
const dateFormats: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
  "zh-Hant": new Intl.DateTimeFormat("zh-Hant", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
}

export function formatTime(seconds: number | null | undefined) {
  if (seconds == null) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export function formatDate(
  value: Date | string | null | undefined,
  locale: Locale,
) {
  if (!value) return null
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return null
  return dateFormats[locale].format(date)
}

/** Espresso is measured by liquid yield, every other method by water. */
export function isEspresso(method: string) {
  return /espresso/i.test(method)
}

/** "1:16.7" — two decimals below 1:3, where espresso's differences live. */
export function formatRatio(
  dose: number | null | undefined,
  out: number | null | undefined,
) {
  if (!dose || !out) return null
  const r = out / dose
  return `1:${r >= 3 ? r.toFixed(1) : r.toFixed(2)}`
}

/** The one number that decides the next cup, against the right output. */
export function brewRatio(brew: {
  method: string
  coffeeG: number | null
  waterG: number | null
  brewWeightG: number | null
}) {
  return formatRatio(
    brew.coffeeG,
    isEspresso(brew.method) ? brew.brewWeightG : brew.waterG,
  )
}

/**
 * Rows written before the form restricted the scheme (and rows written by the
 * seeds, which skip the form) can still hold a `javascript:` or `data:` URL.
 * Returns the value only when it is safe to put in an `href`.
 */
export function externalHref(url: string | null | undefined) {
  return /^https?:\/\//i.test(url ?? "") ? url : null
}
