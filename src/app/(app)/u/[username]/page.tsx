import { notFound } from "next/navigation"

import { and, desc, eq } from "drizzle-orm"

import { ListRow } from "@/components/list-row"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { db } from "@/lib/db"
import { brews, user } from "@/lib/db/schema"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  return { title: username }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const profile = await db.query.user.findFirst({
    where: eq(user.username, username),
  })
  if (!profile) notFound()

  const publicBrews = await db.query.brews.findMany({
    where: and(eq(brews.userId, profile.id), eq(brews.isPublic, true)),
    orderBy: desc(brews.brewedAt),
    with: { bean: { columns: { name: true, roastery: true } } },
  })

  return (
    <PageShell>
      <PageHeader kicker="Public journal" title={profile.name} />

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">Brews</h2>
        {publicBrews.length === 0 ? (
          <p className="text-body text-muted-foreground">
            No public brews yet.
          </p>
        ) : (
          <div>
            {publicBrews.map((brew) => (
              <ListRow
                key={brew.id}
                href={`/brews/${brew.id}`}
                title={brew.method}
                subtitle={brew.bean.name}
                date={brew.brewedAt}
              >
                <p className="text-body md:col-span-6">
                  {brew.rating != null ? `${brew.rating}/10` : "—"}
                </p>
              </ListRow>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}
