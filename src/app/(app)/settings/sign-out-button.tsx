"use client"

import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { TextButton } from "@/components/text-button"

function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <TextButton type="button" onClick={handleSignOut} className="font-normal">
      Sign out
    </TextButton>
  )
}

export { SignOutButton }
