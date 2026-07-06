import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { requireSession } from "@/lib/session"

import { getBeanScanQuota } from "../scan"
import { NewBean } from "./new-bean"

export const metadata = { title: "New Bean" }

export default async function NewBeanPage() {
  await requireSession()
  const quota = await getBeanScanQuota()

  return (
    <PageShell>
      <PageHeader kicker="Bean" title="New Bean" />
      <NewBean quota={quota} />
    </PageShell>
  )
}
