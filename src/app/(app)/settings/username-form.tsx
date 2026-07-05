"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { TextButton } from "@/components/text-button"
import { TextField } from "@/components/text-input"
import { authClient } from "@/lib/auth-client"

function UsernameForm({ current }: { current: string }) {
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
      setError(error.message ?? "Could not update username.")
      return
    }
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-6">
      <TextField
        label="Username"
        name="username"
        defaultValue={current}
        pattern="[a-zA-Z0-9_.]+"
        minLength={3}
        maxLength={30}
        required
      />
      {error ? <p className="text-body text-destructive">{error}</p> : null}
      <TextButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save username"}
      </TextButton>
    </form>
  )
}

export { UsernameForm }
