import Link from "next/link"

import { and, avg, count, desc, eq } from "drizzle-orm"

import { ListRow } from "@/components/list-row"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { clampPage, PAGE_SIZE, Pagination } from "@/components/pagination"
import { StarRow } from "@/components/star-meter"
import { SelectField } from "@/components/text-input"
import { db } from "@/lib/db"
import { beans, brewRatings, brews, user } from "@/lib/db/schema"

export const metadata = { title: "Explore" }

function param(value: string | string[] | undefined) {
  return typeof value === "string" && value ? value : undefined
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const method = param(sp.method)
  const origin = param(sp.origin)
  const roast = param(sp.roast)

  const conditions = [eq(brews.isPublic, true)]
  if (method) conditions.push(eq(brews.method, method))
  if (origin) conditions.push(eq(beans.originCountry, origin))
  if (roast) conditions.push(eq(beans.roastLevel, roast))

  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(brews)
    .innerJoin(beans, eq(beans.id, brews.beanId))
    .where(and(...conditions))
  const { page, totalPages, offset } = clampPage(sp.page, totalCount)

  // Community star ratings, aggregated per brew, so the list can show the
  // ★ average (and vote count) in place of the author's own /10 self-score.
  const ratingAgg = db
    .select({
      brewId: brewRatings.brewId,
      average: avg(brewRatings.value).as("average"),
      votes: count().as("votes"),
    })
    .from(brewRatings)
    .groupBy(brewRatings.brewId)
    .as("rating_agg")

  const [entries, methods, origins, roasts] = await Promise.all([
    db
      .select({
        id: brews.id,
        method: brews.method,
        ratingAverage: ratingAgg.average,
        ratingVotes: ratingAgg.votes,
        brewedAt: brews.brewedAt,
        beanName: beans.name,
        roastery: beans.roastery,
        username: user.username,
        userName: user.name,
      })
      .from(brews)
      .innerJoin(beans, eq(beans.id, brews.beanId))
      .innerJoin(user, eq(user.id, brews.userId))
      .leftJoin(ratingAgg, eq(ratingAgg.brewId, brews.id))
      .where(and(...conditions))
      .orderBy(desc(brews.brewedAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .selectDistinct({ value: brews.method })
      .from(brews)
      .where(eq(brews.isPublic, true)),
    db
      .selectDistinct({ value: beans.originCountry })
      .from(brews)
      .innerJoin(beans, eq(beans.id, brews.beanId))
      .where(eq(brews.isPublic, true)),
    db
      .selectDistinct({ value: beans.roastLevel })
      .from(brews)
      .innerJoin(beans, eq(beans.id, brews.beanId))
      .where(eq(brews.isPublic, true)),
  ])

  const methodOptions = methods.map((m) => m.value).sort()
  const originOptions = origins
    .map((o) => o.value)
    .filter((v): v is string => Boolean(v))
    .sort()
  const roastOptions = roasts
    .map((r) => r.value)
    .filter((v): v is string => Boolean(v))
    .sort()

  const hasFilters = Boolean(method || origin || roast)

  return (
    <PageShell>
      <PageHeader kicker="Public brews" title="Explore" />

      <section className="space-y-8 md:space-y-10">
        <form className="grid gap-x-5 gap-y-6 md:grid-cols-12">
          <SelectField
            label="Method"
            name="method"
            defaultValue={method ?? ""}
            className="md:col-span-4"
          >
            <option value="">All</option>
            {methodOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Origin"
            name="origin"
            defaultValue={origin ?? ""}
            className="md:col-span-4"
          >
            <option value="">All</option>
            {originOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Roast"
            name="roast"
            defaultValue={roast ?? ""}
            className="md:col-span-4"
          >
            <option value="">All</option>
            {roastOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </SelectField>
          <div className="text-body flex items-center gap-8 md:col-span-12">
            <button
              type="submit"
              className="hover:text-muted-foreground font-medium underline underline-offset-4"
            >
              Apply
            </button>
            {hasFilters ? (
              <Link
                href="/explore"
                className="text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Clear filters
              </Link>
            ) : null}
          </div>
        </form>

        {entries.length === 0 ? (
          <p className="text-body text-muted-foreground">
            No public brews match these filters yet.
          </p>
        ) : (
          <div>
            {entries.map((entry) => {
              const average =
                entry.ratingAverage != null ? Number(entry.ratingAverage) : null
              return (
                <ListRow
                  key={entry.id}
                  href={`/brews/${entry.id}`}
                  title={entry.method}
                  subtitle={entry.beanName}
                  date={entry.brewedAt}
                >
                  <div className="text-small flex items-center gap-2 md:col-span-2">
                    {average != null ? (
                      <>
                        <StarRow value={average} size={14} />
                        <span className="font-medium">
                          {average.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">
                          ({entry.ratingVotes})
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                  <p className="text-body text-muted-foreground md:col-span-4">
                    {entry.roastery} · {entry.username ?? entry.userName}
                  </p>
                </ListRow>
              )
            })}
          </div>
        )}

        <Pagination
          pathname="/explore"
          page={page}
          totalPages={totalPages}
          params={{ method, origin, roast }}
        />
      </section>
    </PageShell>
  )
}
