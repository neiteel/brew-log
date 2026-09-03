"use client"

import type { Messages } from "@/lib/i18n"

import { useRef, useState } from "react"

import { Button } from "@/components/button"
import { TextField } from "@/components/text-input"
import { authClient } from "@/lib/auth-client"

function ChangePasswordForm({ t }: { t: Messages["settings"] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setDone(false)
    const form = new FormData(event.currentTarget)
    const newPassword = String(form.get("newPassword"))
    const confirm = String(form.get("confirm"))
    if (newPassword !== confirm) {
      setError(t.passwordMismatch)
      return
    }
    setPending(true)
    const { error } = await authClient.changePassword({
      currentPassword: String(form.get("currentPassword")),
      newPassword,
      // Sign out any other devices — changing a password is often a response
      // to a suspected compromise.
      revokeOtherSessions: true,
    })
    setPending(false)
    if (error) {
      setError(error.message ?? t.changePasswordFailed)
      return
    }
    formRef.current?.reset()
    setDone(true)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="max-w-sm space-y-6">
      <TextField
        label={t.currentPassword}
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
      />
      <TextField
        label={t.newPassword}
        name="newPassword"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <TextField
        label={t.confirmPassword}
        name="confirm"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      {error ? (
        <p role="alert" className="text-body text-destructive">
          {error}
        </p>
      ) : null}
      {done ? (
        <p className="text-body text-muted-foreground">{t.passwordUpdated}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? t.updating : t.changePassword}
      </Button>
    </form>
  )
}

export { ChangePasswordForm }
