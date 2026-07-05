import { Row } from "@/components/field"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { requireSession } from "@/lib/session"

import { SignOutButton } from "./sign-out-button"
import { UsernameForm } from "./username-form"

export const metadata = { title: "Settings" }

export default async function SettingsPage() {
  const session = await requireSession()
  const { user } = session

  return (
    <PageShell>
      <PageHeader kicker="Account" title="Settings" />

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">Profile</h2>
        <div>
          <Row label="Name" value={user.name} />
          <Row label="Email" value={user.email} />
          <Row
            label="Public page"
            value={user.username ? `/u/${user.username}` : "—"}
            detail="Where your public brews appear"
          />
        </div>
        <UsernameForm current={user.username ?? ""} />
      </section>

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">Session</h2>
        <SignOutButton />
      </section>
    </PageShell>
  )
}
