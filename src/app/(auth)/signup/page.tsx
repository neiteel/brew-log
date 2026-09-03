import Link from "next/link"

import { SocialAuth } from "@/components/social-auth"
import { getDictionary } from "@/lib/i18n"

import { SignupForm } from "./signup-form"

export async function generateMetadata() {
  const { titles } = await getDictionary()
  return { title: titles.signUp }
}

export default async function SignupPage() {
  const { auth: t } = await getDictionary()

  return (
    <div className="space-y-10">
      <h1 className="text-h1 font-medium">{t.signUp}</h1>
      <SignupForm t={t} />
      <SocialAuth t={t} />
      <p className="text-body text-muted-foreground">
        {t.haveAccount}{" "}
        <Link
          href="/login"
          className="text-foreground hover:text-muted-foreground underline underline-offset-4"
        >
          {t.signIn}
        </Link>
      </p>
    </div>
  )
}
