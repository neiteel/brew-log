import Link from "next/link"

import { getDictionary } from "@/lib/i18n"

import { ForgotPasswordForm } from "./forgot-password-form"

export async function generateMetadata() {
  const { titles } = await getDictionary()
  return { title: titles.forgotPassword }
}

export default async function ForgotPasswordPage() {
  const { auth: t } = await getDictionary()

  return (
    <div className="space-y-10">
      <h1 className="text-h1 font-medium">{t.forgotTitle}</h1>
      <ForgotPasswordForm t={t} />
      <p className="text-body text-muted-foreground">
        {t.rememberedIt}{" "}
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
