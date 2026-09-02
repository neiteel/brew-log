import Link from "next/link"

import { and, desc, eq } from "drizzle-orm"

import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { db } from "@/lib/db"
import { beans, brews } from "@/lib/db/schema"
import { getDictionary } from "@/lib/i18n"
import { fill } from "@/lib/i18n/config"
import { countBrews, MAX_BREWS_PER_USER, nearQuota } from "@/lib/limits"
import { requireSession } from "@/lib/session"

import { createBrew } from "../actions"
import { BrewForm } from "../brew-form"

export const metadata = { title: "New Brew" }

export default async function NewBrewPage({
  searchParams,
}: {
  searchParams: Promise<{ bean?: string; from?: string }>
}) {
  const session = await requireSession()
  const dict = getDictionary(session.user.locale)
  const { bean: defaultBeanId, from } = await searchParams

  const brewCount = await countBrews(session.user.id)
  if (brewCount >= MAX_BREWS_PER_USER) {
    return (
      <PageShell>
        <PageHeader kicker={dict.brew.kicker} title={dict.pages.newBrew} />
        <p className="text-body text-muted-foreground">
          {fill(dict.pages.brewLimitBefore, { max: MAX_BREWS_PER_USER })}
          <Link
            href="/journal"
            className="text-foreground hover:text-muted-foreground underline underline-offset-4"
          >
            {dict.pages.brewLimitLink}
          </Link>
          {dict.pages.brewLimitAfter}
        </p>
      </PageShell>
    )
  }

  const beanOptions = await db.query.beans.findMany({
    columns: { id: true, name: true, roastery: true },
    where: eq(beans.userId, session.user.id),
    orderBy: desc(beans.createdAt),
  })

  // ?from=<brewId> repeats a brew: the recipe carries over — bean, method,
  // grind, dose, temperature, time — because that is what you are about to
  // change. The verdict does not: date, rating, taste and notes belong to the
  // cup you already drank, and visibility restarts private like any new brew.
  const source = from
    ? await db.query.brews.findFirst({
        where: and(eq(brews.id, from), eq(brews.userId, session.user.id)),
      })
    : undefined
  const prefill = source && {
    ...source,
    brewedAt: new Date(),
    rating: null,
    tasteAroma: null,
    tasteSweetness: null,
    tasteAcidity: null,
    tasteBitterness: null,
    tasteBody: null,
    notes: null,
    isPublic: false,
  }

  return (
    <PageShell>
      <PageHeader
        kicker={dict.brew.kicker}
        title={dict.pages.newBrew}
        subtitle={
          nearQuota(brewCount, MAX_BREWS_PER_USER)
            ? fill(dict.pages.brewsUsed, {
                count: brewCount,
                max: MAX_BREWS_PER_USER,
              })
            : undefined
        }
      />
      {beanOptions.length === 0 ? (
        <p className="text-body text-muted-foreground">
          {dict.pages.needBeanBefore}
          <Link
            href="/beans/new"
            className="text-foreground hover:text-muted-foreground underline underline-offset-4"
          >
            {dict.pages.needBeanLink}
          </Link>
          {dict.pages.needBeanAfter}
        </p>
      ) : (
        <BrewForm
          action={createBrew}
          brew={prefill}
          beanOptions={beanOptions}
          defaultBeanId={defaultBeanId}
          defaultDate={new Date().toISOString().slice(0, 10)}
          cancelHref="/journal"
          submitLabel={dict.form.saveBrew}
          t={dict.form}
          taste={dict.taste}
        />
      )}
    </PageShell>
  )
}
