"use client"

import type { Messages } from "@/lib/i18n"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/button"
import { TextField } from "@/components/text-input"
import { authClient } from "@/lib/auth-client"

function LoginForm({
  defaultEmail,
  defaultPassword,
  t,
}: {
  defaultEmail?: string
  defaultPassword?: string
  t: Messages["auth"]
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(event.currentTarget)
    const { error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    })
    setPending(false)
    if (error) {
      setError(error.message ?? t.signInFailed)
      return
    }
    router.push("/journal")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <TextField
        label={t.email}
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={defaultEmail}
        required
      />
      <TextField
        label={t.password}
        name="password"
        type="password"
        autoComplete="current-password"
        defaultValue={defaultPassword}
        required
      />
      <p className="text-body text-muted-foreground -mt-4">
        <Link
          href="/forgot-password"
          className="text-foreground hover:text-muted-foreground underline underline-offset-4"
        >
          {t.forgotPassword}
        </Link>
      </p>
      {error ? (
        <p role="alert" className="text-body text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? t.signingIn : t.signIn}
      </Button>
    </form>
  )
}

export { LoginForm }
