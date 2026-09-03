"use client"

import type { Messages } from "@/lib/i18n"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/button"
import { TextField } from "@/components/text-input"
import { authClient } from "@/lib/auth-client"

function UsernameForm({
  current,
  t,
}: {
  current: string
  t: Messages["settings"]
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(event.currentTarget)
    const { error } = await authClient.updateUser({
      username: String(form.get("username")),
    })
    setPending(false)
    if (error) {
      setError(error.message ?? t.updateUsernameFailed)
      return
    }
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-6">
      <TextField
        label={t.username}
        name="username"
        defaultValue={current}
        pattern="[a-zA-Z0-9_.]+"
        minLength={3}
        maxLength={30}
        required
      />
      {error ? (
        <p role="alert" className="text-body text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? t.saving : t.saveUsername}
      </Button>
    </form>
  )
}

export { UsernameForm }
