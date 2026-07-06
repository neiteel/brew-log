import Link from "next/link"

import { ForgotPasswordForm } from "./forgot-password-form"

export const metadata = { title: "Forgot password" }

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-10">
      <h1 className="text-h1 font-medium">Forgot password</h1>
      <ForgotPasswordForm />
      <p className="text-body text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/login"
          className="text-foreground hover:text-muted-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
