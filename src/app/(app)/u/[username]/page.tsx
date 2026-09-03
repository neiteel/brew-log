import { notFound } from "next/navigation"

import { and, count, desc, eq } from "drizzle-orm"

import { ListRow } from "@/components/list-row"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { clampPage, PAGE_SIZE, Pagination } from "@/components/pagination"
import { db } from "@/lib/db"
import { brews, user } from "@/lib/db/schema"
import { getDictionary } from "@/lib/i18n"
import { label } from "@/lib/i18n/config"

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
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [{ username }, sp, { list, pagination, enums }] = await Promise.all([
    params,
    searchParams,
    getDictionary(),
  ])

  const profile = await db.query.user.findFirst({
    where: eq(user.username, username),
  })
  if (!profile) notFound()

  const isPublicBrew = and(
    eq(brews.userId, profile.id),
    eq(brews.isPublic, true),
  )

  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(brews)
    .where(isPublicBrew)
  const { page, totalPages, offset } = clampPage(sp.page, totalCount)

  const publicBrews = await db.query.brews.findMany({
    where: isPublicBrew,
    orderBy: desc(brews.brewedAt),
    with: { bean: { columns: { name: true, roastery: true } } },
    limit: PAGE_SIZE,
    offset,
  })

  return (
    <PageShell>
      <PageHeader kicker={list.publicJournal} title={profile.name} />

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">{list.brewsHeading}</h2>
        {publicBrews.length === 0 ? (
          <p className="text-body text-muted-foreground">
            {list.noPublicBrewsYet}
          </p>
        ) : (
          <div>
            {publicBrews.map((brew) => (
              <ListRow
                key={brew.id}
                href={`/brews/${brew.id}`}
                title={label(enums.methods, brew.method)}
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
        <Pagination
          pathname={`/u/${username}`}
          page={page}
          totalPages={totalPages}
          t={pagination}
        />
      </section>
    </PageShell>
  )
}
