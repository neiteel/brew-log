"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { TextButton } from "@/components/text-button"
import { TextField } from "@/components/text-input"
import { authClient } from "@/lib/auth-client"

function ResetPasswordForm({ token }: { token: string }) {
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
      setError("Passwords don't match.")
      return
    }
    setPending(true)
    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    })
    setPending(false)
    if (error) {
      setError(error.message ?? "Couldn't reset your password.")
      return
    }
    router.push("/login")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <TextField
        label="New password"
        name="password"
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
      <TextButton type="submit" disabled={pending}>
        {pending ? "Resetting…" : "Reset password"}
      </TextButton>
    </form>
  )
}

export { ResetPasswordForm }
