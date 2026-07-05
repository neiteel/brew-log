import Link from "next/link"

import { LoginForm } from "./login-form"

export const metadata = { title: "Sign in" }

export default function LoginPage() {
  const devCredentials =
    process.env.NODE_ENV !== "production"
      ? {
          email: process.env.DEV_LOGIN_EMAIL,
          password: process.env.DEV_LOGIN_PASSWORD,
        }
      : undefined

  return (
    <div className="space-y-10">
      <h1 className="text-h1 font-medium">Sign in</h1>
      <LoginForm
        defaultEmail={devCredentials?.email}
        defaultPassword={devCredentials?.password}
      />
      <p className="text-body text-muted-foreground">
        No account yet?{" "}
        <Link
          href="/signup"
          className="text-foreground hover:text-muted-foreground underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
