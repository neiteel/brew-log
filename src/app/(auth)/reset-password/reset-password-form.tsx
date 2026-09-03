"use client"

import type { Messages } from "@/lib/i18n"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/button"
import { TextField } from "@/components/text-input"
import { authClient } from "@/lib/auth-client"

function ResetPasswordForm({
  token,
  t,
}: {
  token: string
  t: Messages["auth"]
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const form = new FormData(event.currentTarget)
    const password = String(form.get("password"))
    const confirm = String(form.get("confirm"))
    if (password !== confirm) {
      setError(t.passwordMismatch)
      return
    }
    setPending(true)
    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    })
    setPending(false)
    if (error) {
      setError(error.message ?? t.resetFailed)
      return
    }
    router.push("/login")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <TextField
        label={t.newPassword}
        name="password"
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
      <Button type="submit" disabled={pending}>
        {pending ? t.resetting : t.resetPassword}
      </Button>
    </form>
  )
}

export { ResetPasswordForm }
