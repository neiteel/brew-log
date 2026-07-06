"use client"

import { useState } from "react"

import { TextButton } from "@/components/text-button"
import { authClient } from "@/lib/auth-client"

function ResendVerification({ email }: { email: string }) {
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
      setError(error.message ?? "Couldn't send verification email.")
      return
    }
    setSent(true)
  }

  return (
    <div className="max-w-sm space-y-3">
      <p className="text-body text-muted-foreground">
        Your email isn&rsquo;t verified. Verify it to also sign in with Google
        using this address.
      </p>
      {sent ? (
        <p className="text-body text-muted-foreground">
          Verification email sent. Check your inbox and spam folder.
        </p>
      ) : (
        <TextButton
          type="button"
          onClick={handleResend}
          disabled={pending}
          className="font-normal"
        >
          {pending ? "Sending…" : "Resend verification email"}
        </TextButton>
      )}
      {error ? <p className="text-body text-destructive">{error}</p> : null}
    </div>
  )
}

export { ResendVerification }
