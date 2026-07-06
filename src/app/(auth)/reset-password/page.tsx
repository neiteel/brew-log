import Link from "next/link"

import { ResetPasswordForm } from "./reset-password-form"

export const metadata = { title: "Reset password" }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  const { token, error } = await searchParams

  if (!token || error) {
    return (
      <div className="space-y-10">
        <div className="space-y-3">
          <h1 className="text-h1 font-medium">Link expired</h1>
          <p className="text-body text-muted-foreground">
            This password reset link is invalid or has expired. Request a new
            one to try again.
          </p>
        </div>
        <p className="text-body text-muted-foreground">
          <Link
            href="/forgot-password"
            className="text-foreground hover:text-muted-foreground underline underline-offset-4"
          >
            Request a new link
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-h1 font-medium">Reset password</h1>
        <p className="text-body text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  )
}
