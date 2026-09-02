"use client"

import type { Locale } from "@/lib/i18n/config"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { RadioField } from "@/components/text-input"
import { authClient } from "@/lib/auth-client"
import { LOCALE_NAMES, LOCALES, toLocale } from "@/lib/i18n/config"

// RadioField's value is the option's display text, so map the name back to its
// locale code, and offer the names as options.
const NAME_TO_LOCALE = new Map<string, Locale>(
  LOCALES.map((locale) => [LOCALE_NAMES[locale], locale]),
)
const OPTIONS = LOCALES.map((locale) => LOCALE_NAMES[locale])

// Language preference as a radio group. Persists to the user's `locale` field
// via Better Auth, then refreshes so server components re-render in the new
// language.
function LanguageForm({ current }: { current: string | null | undefined }) {
  const router = useRouter()
  const [locale, setLocale] = useState<Locale>(toLocale(current))
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function choose(name: string) {
    const next = NAME_TO_LOCALE.get(name)
    if (!next || next === locale || pending) return
    const previous = locale
    setError(null)
    setPending(true)
    setLocale(next) // optimistic
    const { error } = await authClient.updateUser({ locale: next })
    setPending(false)
    if (error) {
      setLocale(previous)
      setError(error.message ?? "Could not update language.")
      return
    }
    router.refresh()
  }

  return (
    <div className="max-w-sm space-y-4">
      <RadioField
        label=""
        name="locale"
        options={OPTIONS}
        value={LOCALE_NAMES[locale]}
        onValueChange={choose}
      />
      {error ? (
        <p role="alert" className="text-body text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { LanguageForm }
