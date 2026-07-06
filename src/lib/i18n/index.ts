import "server-only"

import type { Locale } from "./config"
import type { Messages } from "./messages/en"

import { toLocale } from "./config"
import { en } from "./messages/en"
import { zhHant } from "./messages/zh-hant"

const dictionaries: Record<Locale, Messages> = {
  en,
  "zh-Hant": zhHant,
}

/**
 * Resolve the message dictionary for a viewer's stored locale. Accepts any
 * string (e.g. `session.user.locale`) and falls back to the default locale for
 * unknown values, so callers never need to validate first.
 *
 * Server-only: the dictionaries stay out of the client bundle. Pass the plain
 * strings you need down to client components as props.
 */
export function getDictionary(locale: string | null | undefined): Messages {
  return dictionaries[toLocale(locale)]
}

export type { Messages } from "./messages/en"
export { type Locale } from "./config"
