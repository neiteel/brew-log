"use client"

import type { Messages } from "@/lib/i18n"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/button"
import { TextField } from "@/components/text-input"

import { setPasswordAction } from "./set-password-action"

function SetPasswordForm({ t }: { t: Messages["settings"] }) {
  const router = useRouter()
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
      setError(t.setPasswordMismatch)
      return
    }
    setPending(true)
    const { error } = await setPasswordAction(newPassword)
    setPending(false)
    if (error) {
      setError(error)
      return
    }
    formRef.current?.reset()
    setDone(true)
    // Re-render the page so it now shows the "Change password" form instead.
    router.refresh()
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="max-w-sm space-y-6">
      <p className="text-body text-muted-foreground">{t.setPasswordPrompt}</p>
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
        <p className="text-body text-muted-foreground">{t.passwordSet}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? t.saving : t.setPassword}
      </Button>
    </form>
  )
}

export { SetPasswordForm }
