"use client"

import { useState } from "react"

import { Button } from "@/components/button"
import { authClient } from "@/lib/auth-client"

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.02-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}

function SocialAuth() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogle() {
    setError(null)
    setPending(true)
    // Redirects to Google on success; only returns here on failure to start.
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/journal",
      // If the OAuth callback can't link (e.g. the email already has an
      // unverified password account), Better Auth redirects here with
      // ?error=account_not_linked instead of showing its default error page.
      errorCallbackURL: `${window.location.origin}/login`,
    })
    if (error) {
      setPending(false)
      setError(error.message ?? "Couldn't start Google sign-in.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="border-border flex-1 border-t" />
        <span className="text-body text-muted-foreground">or</span>
        <span className="border-border flex-1 border-t" />
      </div>
      {/* An alternative route to the same destination, so it stays quieter
          than the form's own commit button above it. */}
      <Button
        variant="quiet"
        type="button"
        onClick={handleGoogle}
        disabled={pending}
        className="w-full py-3"
      >
        <GoogleMark />
        {pending ? "Redirecting…" : "Continue with Google"}
      </Button>
      {error ? (
        <p role="alert" className="text-body text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { SocialAuth }
