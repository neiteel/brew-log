import Link from "next/link"

import { SocialAuth } from "@/components/social-auth"
import { getDictionary } from "@/lib/i18n"

import { LoginForm } from "./login-form"

export async function generateMetadata() {
  const { titles } = await getDictionary()
  return { title: titles.signIn }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const { auth: t } = await getDictionary()
  // Better Auth appends an error code to the login URL after a failed social
  // sign-in (see SocialAuth's errorCallbackURL); only one has its own message.
  const errorMessage = error
    ? error === "account_not_linked"
      ? t.accountNotLinked
      : t.socialGenericError
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
      <h1 className="text-h1 font-medium">{t.signIn}</h1>
      {errorMessage ? (
        <p className="text-body text-destructive">{errorMessage}</p>
      ) : null}
      <LoginForm
        defaultEmail={devCredentials?.email}
        defaultPassword={devCredentials?.password}
        t={t}
      />
      <SocialAuth t={t} />
      <p className="text-body text-muted-foreground">
        {t.noAccount}{" "}
        <Link
          href="/signup"
          className="text-foreground hover:text-muted-foreground underline underline-offset-4"
        >
          {t.signUp}
        </Link>
      </p>
    </div>
  )
}
