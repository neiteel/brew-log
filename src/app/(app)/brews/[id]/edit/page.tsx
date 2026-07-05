import { notFound } from "next/navigation"

import { and, desc, eq } from "drizzle-orm"

import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { db } from "@/lib/db"
import { beans, brews } from "@/lib/db/schema"
import { requireSession } from "@/lib/session"

import { updateBrew } from "../../actions"
import { BrewForm } from "../../brew-form"
import { DeleteBrewButton } from "./delete-brew-button"

export const metadata = { title: "Edit Brew" }

export default async function EditBrewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireSession()
  const { id } = await params

  const brew = await db.query.brews.findFirst({
    where: and(eq(brews.id, id), eq(brews.userId, session.user.id)),
    with: { bean: { columns: { name: true } } },
  })
  if (!brew) notFound()

  const beanOptions = await db.query.beans.findMany({
    columns: { id: true, name: true, roastery: true },
    where: eq(beans.userId, session.user.id),
    orderBy: desc(beans.createdAt),
  })

  const updateAction = updateBrew.bind(null, brew.id)

  return (
    <PageShell>
      <PageHeader
        kicker="Brew"
        title={
          <>
            Edit{" "}
            <span className="text-muted-foreground">
              — {brew.method}, {brew.bean.name}
            </span>
          </>
        }
      />
      <BrewForm
        action={updateAction}
        brew={brew}
        beanOptions={beanOptions}
        defaultDate={brew.brewedAt.toISOString().slice(0, 10)}
        cancelHref={`/brews/${brew.id}`}
      />
      <section className="border-border space-y-6 border-t pt-8">
        <DeleteBrewButton brewId={brew.id} />
      </section>
    </PageShell>
  )
}
