"use client"

import { useRouter } from "next/navigation"

import { TextButton } from "@/components/text-button"
import { authClient } from "@/lib/auth-client"

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
