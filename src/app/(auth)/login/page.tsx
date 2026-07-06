import Link from "next/link"

import { SocialAuth } from "@/components/social-auth"

import { LoginForm } from "./login-form"

export const metadata = { title: "Sign in" }

// Friendly messages for error codes Better Auth appends to the login URL after
// a failed social sign-in (see SocialAuth's errorCallbackURL).
const ERROR_MESSAGES: Record<string, string> = {
  account_not_linked:
    "This email already has a password. Sign in with it below. Once you verify your email, you can also use Google.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ??
      "Something went wrong signing in. Please try again.")
    : null

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
      {errorMessage ? (
        <p className="text-body text-destructive">{errorMessage}</p>
      ) : null}
      <LoginForm
        defaultEmail={devCredentials?.email}
        defaultPassword={devCredentials?.password}
      />
      <SocialAuth />
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
