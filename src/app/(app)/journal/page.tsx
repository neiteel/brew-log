import Link from "next/link"

import { desc, eq } from "drizzle-orm"

import { ListRow } from "@/components/list-row"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { db } from "@/lib/db"
import { beans, brews } from "@/lib/db/schema"
import { requireSession } from "@/lib/session"

export const metadata = { title: "Journal" }

export default async function JournalPage() {
  const session = await requireSession()

  const [userBeans, userBrews] = await Promise.all([
    db.query.beans.findMany({
      where: eq(beans.userId, session.user.id),
      orderBy: desc(beans.createdAt),
    }),
    db.query.brews.findMany({
      where: eq(brews.userId, session.user.id),
      orderBy: desc(brews.brewedAt),
      with: { bean: { columns: { name: true } } },
    }),
  ])

  return (
    <PageShell>
      <PageHeader kicker={session.user.name} title="Journal" />

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">Beans</h2>
        {userBeans.length === 0 ? (
          <p className="text-body text-muted-foreground">
            No beans yet — add the first one.
          </p>
        ) : (
          <div>
            {userBeans.map((bean) => (
              <ListRow
                key={bean.id}
                href={`/beans/${bean.id}`}
                title={bean.name}
                subtitle={bean.roastery}
                date={bean.createdAt}
              >
                <p className="text-body text-muted-foreground md:col-span-6">
                  {[bean.originCountry, bean.process, bean.roastLevel]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </ListRow>
            ))}
          </div>
        )}
        <div className="text-body">
          <Link
            href="/beans/new"
            className="hover:text-muted-foreground font-medium underline underline-offset-4"
          >
            New bean
          </Link>
        </div>
      </section>

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">Brews</h2>
        {userBrews.length === 0 ? (
          <p className="text-body text-muted-foreground">
            No brews yet — log the first one.
          </p>
        ) : (
          <div>
            {userBrews.map((brew) => (
              <ListRow
                key={brew.id}
                href={`/brews/${brew.id}`}
                title={brew.method}
                subtitle={brew.bean.name}
                date={brew.brewedAt}
              >
                <p className="text-body md:col-span-6">
                  {brew.rating != null ? `${brew.rating}/10` : "—"}
                  {brew.isPublic ? (
                    <span className="text-muted-foreground"> · Public</span>
                  ) : null}
                </p>
              </ListRow>
            ))}
          </div>
        )}
        <div className="text-body">
          <Link
            href="/brews/new"
            className="hover:text-muted-foreground font-medium underline underline-offset-4"
          >
            New brew
          </Link>
        </div>
      </section>
    </PageShell>
  )
}
