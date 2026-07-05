import { notFound } from "next/navigation"

import { and, eq } from "drizzle-orm"

import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { db } from "@/lib/db"
import { beans } from "@/lib/db/schema"
import { requireSession } from "@/lib/session"

import { updateBean } from "../../actions"
import { BeanForm } from "../../bean-form"
import { DeleteBeanButton } from "./delete-bean-button"

export const metadata = { title: "Edit Bean" }

export default async function EditBeanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireSession()
  const { id } = await params

  const bean = await db.query.beans.findFirst({
    where: and(eq(beans.id, id), eq(beans.userId, session.user.id)),
  })
  if (!bean) notFound()

  const updateAction = updateBean.bind(null, bean.id)

  return (
    <PageShell>
      <PageHeader
        kicker="Bean"
        title={
          <>
            Edit <span className="text-muted-foreground">— {bean.name}</span>
          </>
        }
      />
      <BeanForm
        action={updateAction}
        bean={bean}
        cancelHref={`/beans/${bean.id}`}
      />
      <section className="border-border space-y-6 border-t pt-8">
        <p className="text-body text-muted-foreground">
          Deleting a bean also deletes all of its brews.
        </p>
        <DeleteBeanButton beanId={bean.id} />
      </section>
    </PageShell>
  )
}
