import "server-only"

import type { Locale } from "./config"
import type { Messages } from "./messages/en"

import { cache } from "react"
import { headers } from "next/headers"

import { getSession } from "@/lib/session"

import { DEFAULT_LOCALE, hasLocale } from "./config"
import { en } from "./messages/en"
import { zhHant } from "./messages/zh-hant"

const dictionaries: Record<Locale, Messages> = {
  en,
  "zh-Hant": zhHant,
}

/**
 * The tags in an `Accept-Language` header, most-wanted first. Header order is
 * usually already the preference order, but `q=` may override it.
 */
function acceptedTags(header: string | null): string[] {
  if (!header) return []
  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";")
      const q = Number.parseFloat(
        params.find((p) => p.trim().startsWith("q="))?.split("=")[1] ?? "1",
      )
      return { tag: tag.trim(), q: Number.isNaN(q) ? 1 : q }
    })
    .filter((entry) => entry.tag && entry.q > 0)
    .sort((a, b) => b.q - a.q)
    .map((entry) => entry.tag)
}

/**
 * Best supported locale for a browser's language list. `Intl.Locale.maximize`
 * does the hard part: it fills in the implied script, so `zh-TW` resolves to
 * `zh-Hant` and matches, while `zh-CN` resolves to `zh-Hans`, matches nothing,
 * and falls through to the reader's next choice rather than being served a
 * script they may not read.
 */
function matchAcceptLanguage(header: string | null): Locale {
  for (const tag of acceptedTags(header)) {
    try {
      const { language, script } = new Intl.Locale(tag).maximize()
      const withScript = script ? `${language}-${script}` : language
      if (hasLocale(withScript)) return withScript
      if (hasLocale(language)) return language
    } catch {
      // A malformed tag (or the `*` wildcard) — try the next one.
    }
  }
  return DEFAULT_LOCALE
}

/**
 * The viewer's locale for this request: their stored preference when signed in,
 * otherwise the closest match to their browser's `Accept-Language`, otherwise
 * the default. Signed-out visitors have no stored preference, so the header is
 * the only signal the landing and auth pages get.
 *
 * Wrapped in React.cache like `getSession`, so a layout and its page share one
 * resolution per request.
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const stored = (await getSession())?.user.locale
  if (hasLocale(stored)) return stored
  return matchAcceptLanguage((await headers()).get("accept-language"))
})

/**
 * Resolve the message dictionary for this request's viewer.
 *
 * Server-only: the dictionaries stay out of the client bundle. Pass the plain
 * strings you need down to client components as props.
 */
export async function getDictionary(): Promise<Messages> {
  return dictionaries[await getLocale()]
}

export type { Messages } from "./messages/en"
export { type Locale } from "./config"
