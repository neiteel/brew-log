"use client"

import { useState } from "react"

import { Button } from "@/components/button"
import { TextField } from "@/components/text-input"
import { authClient } from "@/lib/auth-client"

function ForgotPasswordForm() {
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
        If an account exists for that email, we&rsquo;ve sent a link to reset
        your password. Check your inbox and spam folder.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <p className="text-body text-muted-foreground">
        Enter your email and we&rsquo;ll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-8">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </div>
  )
}

export { ForgotPasswordForm }
