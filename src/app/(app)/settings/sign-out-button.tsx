"use client"

import type { Messages } from "@/lib/i18n"

import { useRouter } from "next/navigation"

import { TextButton } from "@/components/text-button"
import { authClient } from "@/lib/auth-client"

function SignOutButton({ t }: { t: Messages["settings"] }) {
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <TextButton type="button" onClick={handleSignOut} className="font-normal">
      {t.signOut}
    </TextButton>
  )
}

export { SignOutButton }
