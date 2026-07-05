import Link from "next/link"

import { desc, eq } from "drizzle-orm"

import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { db } from "@/lib/db"
import { beans } from "@/lib/db/schema"
import { requireSession } from "@/lib/session"

import { createBrew } from "../actions"
import { BrewForm } from "../brew-form"

export const metadata = { title: "New Brew" }

export default async function NewBrewPage({
  searchParams,
}: {
  searchParams: Promise<{ bean?: string }>
}) {
  const session = await requireSession()
  const { bean: defaultBeanId } = await searchParams

  const beanOptions = await db.query.beans.findMany({
    columns: { id: true, name: true, roastery: true },
    where: eq(beans.userId, session.user.id),
    orderBy: desc(beans.createdAt),
  })

  return (
    <PageShell>
      <PageHeader kicker="Brew" title="New Brew" />
      {beanOptions.length === 0 ? (
        <p className="text-body text-muted-foreground">
          You need a bean first —{" "}
          <Link
            href="/beans/new"
            className="text-foreground hover:text-muted-foreground underline underline-offset-4"
          >
            add one
          </Link>
          , then log the brew.
        </p>
      ) : (
        <BrewForm
          action={createBrew}
          beanOptions={beanOptions}
          defaultBeanId={defaultBeanId}
          defaultDate={new Date().toISOString().slice(0, 10)}
          cancelHref="/journal"
        />
      )}
    </PageShell>
  )
}
