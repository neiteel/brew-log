// Pure, side-effect-free locale config. Safe to import from client components
// (e.g. the Settings language toggle) as well as the server.

export const LOCALES = ["en", "zh-Hant"] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "en"

// Each locale labels itself, so the toggle reads in the language it selects.
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  "zh-Hant": "繁體中文",
}

export function hasLocale(value: string | null | undefined): value is Locale {
  return value != null && (LOCALES as readonly string[]).includes(value)
}

/** Narrow any stored string to a supported Locale, falling back to the default. */
export function toLocale(value: string | null | undefined): Locale {
  return hasLocale(value) ? value : DEFAULT_LOCALE
}

/** Fill `{token}` placeholders in a message string. */
export function fill(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  )
}

/**
 * Display label for a value the app stores in English (a brew method, a roast
 * level). Values outside the closed set — a custom method the user typed, a
 * roast level from an older row — show exactly as stored.
 */
export function label(map: Record<string, string>, value: string): string
export function label(
  map: Record<string, string>,
  value: string | null | undefined,
): string | null | undefined
export function label(
  map: Record<string, string>,
  value: string | null | undefined,
) {
  return value == null ? value : (map[value] ?? value)
}
