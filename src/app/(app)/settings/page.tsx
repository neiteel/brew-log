import { headers } from "next/headers"

import { Row } from "@/components/field"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { auth } from "@/lib/auth"
import { requireSession } from "@/lib/session"

import { ChangePasswordForm } from "./change-password-form"
import { LanguageForm } from "./language-form"
import { ResendVerification } from "./resend-verification"
import { SetPasswordForm } from "./set-password-form"
import { SignOutButton } from "./sign-out-button"
import { UsernameForm } from "./username-form"

export const metadata = { title: "Settings" }

export default async function SettingsPage() {
  const session = await requireSession()
  const { user } = session

  // A user has a password only if they have a credential account. Google-only
  // users don't, so they see "Set password" instead of "Change password".
  const accounts = await auth.api.listUserAccounts({ headers: await headers() })
  const hasPassword = accounts.some(
    (account) => account.providerId === "credential",
  )

  return (
    <PageShell>
      <PageHeader kicker="Account" title="Settings" />

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">Profile</h2>
        <div>
          <Row label="Name" value={user.name} />
          <Row
            label="Email"
            value={user.email}
            detail={user.emailVerified ? "Verified" : "Not verified"}
          />
          <Row
            label="Public page"
            value={user.username ? `/u/${user.username}` : "—"}
            detail="Where your public brews appear"
          />
        </div>
        {!user.emailVerified ? <ResendVerification email={user.email} /> : null}
        <UsernameForm current={user.username ?? ""} />
      </section>

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">Language</h2>
        <LanguageForm current={user.locale} />
      </section>

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">Password</h2>
        {hasPassword ? <ChangePasswordForm /> : <SetPasswordForm />}
      </section>

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">Session</h2>
        <SignOutButton />
      </section>
    </PageShell>
  )
}
