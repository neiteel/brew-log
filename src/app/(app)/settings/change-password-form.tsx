"use client"

import { useRef, useState } from "react"

import { TextButton } from "@/components/text-button"
import { TextField } from "@/components/text-input"
import { authClient } from "@/lib/auth-client"

function ChangePasswordForm() {
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
      setError("New passwords don't match.")
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
      setError(error.message ?? "Could not change password.")
      return
    }
    formRef.current?.reset()
    setDone(true)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="max-w-sm space-y-6">
      <TextField
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
      />
      <TextField
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <TextField
        label="Confirm new password"
        name="confirm"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      {error ? <p className="text-body text-destructive">{error}</p> : null}
      {done ? (
        <p className="text-body text-muted-foreground">
          Password updated. Other devices have been signed out.
        </p>
      ) : null}
      <TextButton type="submit" disabled={pending}>
        {pending ? "Updating…" : "Change password"}
      </TextButton>
    </form>
  )
}

export { ChangePasswordForm }
