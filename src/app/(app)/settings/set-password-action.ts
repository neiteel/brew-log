"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"

/**
 * Sets a password for the current user via Better Auth's server-only
 * `setPassword`. Used by Google-only users (no credential account yet) to gain
 * email+password sign-in; setting a password creates the credential account.
 *
 * Unlike the client SDK (which returns `{ data, error }`), `auth.api` throws an
 * APIError on failure, so we catch and normalise to `{ error }`.
 */
export async function setPasswordAction(
  newPassword: string,
): Promise<{ error?: string }> {
  try {
    await auth.api.setPassword({
      body: { newPassword },
      headers: await headers(),
    })
    return {}
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not set password.",
    }
  }
}
