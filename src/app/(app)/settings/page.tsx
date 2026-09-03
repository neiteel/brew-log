import { headers } from "next/headers"

import { Row } from "@/components/field"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { auth } from "@/lib/auth"
import { getDictionary } from "@/lib/i18n"
import { requireSession } from "@/lib/session"

import { ChangePasswordForm } from "./change-password-form"
import { ExportButton } from "./export-button"
import { LanguageForm } from "./language-form"
import { ResendVerification } from "./resend-verification"
import { SetPasswordForm } from "./set-password-form"
import { SignOutButton } from "./sign-out-button"
import { UsernameForm } from "./username-form"

export async function generateMetadata() {
  const { titles } = await getDictionary()
  return { title: titles.settings }
}

export default async function SettingsPage() {
  const session = await requireSession()
  const { user } = session
  const { settings: t } = await getDictionary()

  // A user has a password only if they have a credential account. Google-only
  // users don't, so they see "Set password" instead of "Change password".
  const accounts = await auth.api.listUserAccounts({ headers: await headers() })
  const hasPassword = accounts.some(
    (account) => account.providerId === "credential",
  )

  return (
    <PageShell>
      <PageHeader kicker={t.kicker} title={t.title} />

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">{t.profile}</h2>
        <div>
          <Row label={t.name} value={user.name} />
          <Row
            label={t.email}
            value={user.email}
            detail={user.emailVerified ? t.verified : t.notVerified}
          />
          <Row
            label={t.publicPage}
            value={user.username ? `/u/${user.username}` : "—"}
            detail={t.publicPageHint}
          />
        </div>
        {!user.emailVerified ? (
          <ResendVerification email={user.email} t={t} />
        ) : null}
        <UsernameForm current={user.username ?? ""} t={t} />
      </section>

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">{t.language}</h2>
        <LanguageForm current={user.locale} t={t} />
      </section>

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">{t.password}</h2>
        {hasPassword ? <ChangePasswordForm t={t} /> : <SetPasswordForm t={t} />}
      </section>

      {/* Two one-link sections. At the shell's chapter rhythm each got 144px
          above and below a 39px heading to introduce a single underlined word,
          which reads as a section that failed to load. Grouped and tightened:
          still more space above each heading than below it, but sized to what
          they actually hold. */}
      <div className="space-y-12 md:space-y-16">
        <section className="space-y-4">
          <h2 className="text-h2 font-medium">{t.data}</h2>
          <ExportButton t={t} />
        </section>

        <section className="space-y-4">
          <h2 className="text-h2 font-medium">{t.session}</h2>
          <SignOutButton t={t} />
        </section>
      </div>
    </PageShell>
  )
}
