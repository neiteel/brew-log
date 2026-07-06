import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { countBeans, MAX_BEANS_PER_USER } from "@/lib/limits"
import { requireSession } from "@/lib/session"

import { getBeanScanQuota } from "../scan"
import { NewBean } from "./new-bean"

export const metadata = { title: "New Bean" }

export default async function NewBeanPage() {
  const session = await requireSession()
  const beanCount = await countBeans(session.user.id)

  if (beanCount >= MAX_BEANS_PER_USER) {
    return (
      <PageShell>
        <PageHeader kicker="Bean" title="New Bean" />
        <p className="text-body text-muted-foreground">
          You&apos;ve reached the limit of {MAX_BEANS_PER_USER} beans —{" "}
          <Link
            href="/journal"
            className="text-foreground hover:text-muted-foreground underline underline-offset-4"
          >
            delete one
          </Link>{" "}
          to add another.
        </p>
      </PageShell>
    )
  }

  const quota = await getBeanScanQuota()

  return (
    <PageShell>
      <PageHeader
        kicker="Bean"
        title="New Bean"
        subtitle={`${beanCount} of ${MAX_BEANS_PER_USER} beans used`}
      />
      <NewBean quota={quota} />
    </PageShell>
  )
}
