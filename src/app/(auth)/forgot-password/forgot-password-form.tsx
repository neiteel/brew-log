"use client"

import type { Messages } from "@/lib/i18n"

import { useState } from "react"

import { Button } from "@/components/button"
import { TextField } from "@/components/text-input"
import { authClient } from "@/lib/auth-client"

function ForgotPasswordForm({ t }: { t: Messages["auth"] }) {
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    const form = new FormData(event.currentTarget)
    // Ignore the result: we show the same confirmation whether or not an
    // account exists, so we never reveal which emails are registered.
    await authClient.requestPasswordReset({
      email: String(form.get("email")),
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setPending(false)
    setSent(true)
  }

  if (sent) {
    return (
      <p role="status" className="text-body text-muted-foreground">
        {t.resetLinkSent}
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <p className="text-body text-muted-foreground">{t.forgotIntro}</p>
      <form onSubmit={handleSubmit} className="space-y-8">
        <TextField
          label={t.email}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Button type="submit" disabled={pending}>
          {pending ? t.sending : t.sendResetLink}
        </Button>
      </form>
    </div>
  )
}

export { ForgotPasswordForm }
