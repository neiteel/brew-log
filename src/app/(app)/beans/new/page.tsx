import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { requireSession } from "@/lib/session"

import { createBean } from "../actions"
import { BeanForm } from "../bean-form"

export const metadata = { title: "New Bean" }

export default async function NewBeanPage() {
  await requireSession()

  return (
    <PageShell>
      <PageHeader kicker="Bean" title="New Bean" />
      <BeanForm action={createBean} cancelHref="/journal" />
    </PageShell>
  )
}
