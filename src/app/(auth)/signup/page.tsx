import Link from "next/link"

import { SignupForm } from "./signup-form"

export const metadata = { title: "Sign up" }

export default function SignupPage() {
  return (
    <div className="space-y-10">
      <h1 className="text-h1 font-medium">Sign up</h1>
      <SignupForm />
      <p className="text-body text-muted-foreground">
        Already have an account?{" "}
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
