import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { getDictionary } from "@/lib/i18n"
import { fill } from "@/lib/i18n/config"
import { countBeans, MAX_BEANS_PER_USER } from "@/lib/limits"
import { requireSession } from "@/lib/session"

import { getBeanScanQuota } from "../scan"
import { NewBean } from "./new-bean"

export const metadata = { title: "New Bean" }

export default async function NewBeanPage() {
  const session = await requireSession()
  const dict = getDictionary(session.user.locale)
  const beanCount = await countBeans(session.user.id)

  if (beanCount >= MAX_BEANS_PER_USER) {
    return (
      <PageShell>
        <PageHeader kicker={dict.bean.heading} title={dict.pages.newBean} />
        <p className="text-body text-muted-foreground">
          {fill(dict.pages.beanLimitBefore, { max: MAX_BEANS_PER_USER })}
          <Link
            href="/journal"
            className="text-foreground hover:text-muted-foreground underline underline-offset-4"
          >
            {dict.pages.beanLimitLink}
          </Link>
          {dict.pages.beanLimitAfter}
        </p>
      </PageShell>
    )
  }

  const quota = await getBeanScanQuota()

  return (
    <PageShell>
      <PageHeader
        kicker={dict.bean.heading}
        title={dict.pages.newBean}
        subtitle={fill(dict.pages.beansUsed, {
          count: beanCount,
          max: MAX_BEANS_PER_USER,
        })}
      />
      <NewBean quota={quota} formLabels={dict.form} />
    </PageShell>
  )
}
