"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/button"
import { TextField } from "@/components/text-input"
import { authClient } from "@/lib/auth-client"

function SignupForm() {
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
      setError(error.message ?? "Sign up failed.")
      return
    }
    router.push("/journal")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <TextField label="Name" name="name" autoComplete="name" required />
      <TextField
        label="Username"
        name="username"
        autoComplete="username"
        pattern="[a-zA-Z0-9_.]+"
        minLength={3}
        maxLength={30}
        placeholder="for your public page: /u/username"
        required
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <TextField
        label="Password"
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
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  )
}

export { SignupForm }
