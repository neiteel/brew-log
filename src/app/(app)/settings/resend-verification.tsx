"use client"

import type { Messages } from "@/lib/i18n"

import { useState } from "react"

import { TextButton } from "@/components/text-button"
import { authClient } from "@/lib/auth-client"

function ResendVerification({
  email,
  t,
}: {
  email: string
  t: Messages["settings"]
}) {
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleResend() {
    setError(null)
    setPending(true)
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: `${window.location.origin}/journal`,
    })
    setPending(false)
    if (error) {
      setError(error.message ?? t.resendFailed)
      return
    }
    setSent(true)
  }

  return (
    <div className="max-w-sm space-y-3">
      <p className="text-body text-muted-foreground">{t.notVerifiedPrompt}</p>
      {sent ? (
        <p role="status" className="text-body text-muted-foreground">
          {t.resendSent}
        </p>
      ) : (
        <TextButton
          type="button"
          onClick={handleResend}
          disabled={pending}
          className="font-normal"
        >
          {pending ? t.sending : t.resend}
        </TextButton>
      )}
      {error ? (
        <p role="alert" className="text-body text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { ResendVerification }
