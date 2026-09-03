"use client"

import type { Messages } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { RadioField } from "@/components/text-input"
import { authClient } from "@/lib/auth-client"
import { LOCALE_NAMES, LOCALES, toLocale } from "@/lib/i18n/config"

// Each locale labels itself, so the toggle reads in the language it selects.
const OPTIONS = LOCALES.map((locale) => ({
  value: locale,
  label: LOCALE_NAMES[locale],
}))

// Language preference as a radio group. Persists to the user's `locale` field
// via Better Auth, then refreshes so server components re-render in the new
// language.
function LanguageForm({
  current,
  t,
}: {
  current: string | null | undefined
  t: Messages["settings"]
}) {
  const router = useRouter()
  const [locale, setLocale] = useState<Locale>(toLocale(current))
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function choose(value: string) {
    const next = toLocale(value)
    if (next === locale || pending) return
    const previous = locale
    setError(null)
    setPending(true)
    setLocale(next) // optimistic
    const { error } = await authClient.updateUser({ locale: next })
    setPending(false)
    if (error) {
      setLocale(previous)
      setError(error.message ?? t.updateLanguageFailed)
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
        value={locale}
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
