import Link from "next/link"

import { getDictionary } from "@/lib/i18n"

import { ResetPasswordForm } from "./reset-password-form"

export async function generateMetadata() {
  const { titles } = await getDictionary()
  return { title: titles.resetPassword }
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  const { token, error } = await searchParams
  const { auth: t } = await getDictionary()

  if (!token || error) {
    return (
      <div className="space-y-10">
        <div className="space-y-3">
          <h1 className="text-h1 font-medium">{t.linkExpiredTitle}</h1>
          <p className="text-body text-muted-foreground">{t.linkExpiredBody}</p>
        </div>
        <p className="text-body text-muted-foreground">
          <Link
            href="/forgot-password"
            className="text-foreground hover:text-muted-foreground underline underline-offset-4"
          >
            {t.requestNewLink}
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-h1 font-medium">{t.resetTitle}</h1>
        <p className="text-body text-muted-foreground">{t.resetIntro}</p>
      </div>
      <ResetPasswordForm token={token} t={t} />
    </div>
  )
}
