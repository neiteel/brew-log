"use client"

import type { Messages } from "@/lib/i18n"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/button"
import { TextField } from "@/components/text-input"
import { authClient } from "@/lib/auth-client"

function SignupForm({ t }: { t: Messages["auth"] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(event.currentTarget)
    const { error } = await authClient.signUp.email({
      name: String(form.get("name")),
      username: String(form.get("username")),
      email: String(form.get("email")),
      password: String(form.get("password")),
      // Where the verification link lands after confirming (auto-signed-in).
      callbackURL: `${window.location.origin}/journal`,
    })
    setPending(false)
    if (error) {
      setError(error.message ?? t.signUpFailed)
      return
    }
    router.push("/journal")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <TextField label={t.name} name="name" autoComplete="name" required />
      <TextField
        label={t.username}
        name="username"
        autoComplete="username"
        pattern="[a-zA-Z0-9_.]+"
        minLength={3}
        maxLength={30}
        placeholder={t.usernameHint}
        required
      />
      <TextField
        label={t.email}
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <TextField
        label={t.password}
        name="password"
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
        {pending ? t.creatingAccount : t.createAccount}
      </Button>
    </form>
  )
}

export { SignupForm }
