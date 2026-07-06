"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { TextButton } from "@/components/text-button"
import { TextField } from "@/components/text-input"

import { setPasswordAction } from "./set-password-action"

function SetPasswordForm() {
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
      setError("Passwords don't match.")
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
      <p className="text-body text-muted-foreground">
        You signed in with Google. Set a password to also sign in with your
        email address.
      </p>
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
        <p className="text-body text-muted-foreground">Password set.</p>
      ) : null}
      <TextButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Set password"}
      </TextButton>
    </form>
  )
}

export { SetPasswordForm }
