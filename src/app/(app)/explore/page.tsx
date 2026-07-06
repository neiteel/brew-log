import Link from "next/link"

import { and, count, desc, eq } from "drizzle-orm"

import { ListRow } from "@/components/list-row"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { clampPage, PAGE_SIZE, Pagination } from "@/components/pagination"
import { SelectField } from "@/components/text-input"
import { db } from "@/lib/db"
import { beans, brews, user } from "@/lib/db/schema"

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

  const [entries, methods, origins, roasts] = await Promise.all([
    db
      .select({
        id: brews.id,
        method: brews.method,
        rating: brews.rating,
        brewedAt: brews.brewedAt,
        beanName: beans.name,
        roastery: beans.roastery,
        username: user.username,
        userName: user.name,
      })
      .from(brews)
      .innerJoin(beans, eq(beans.id, brews.beanId))
      .innerJoin(user, eq(user.id, brews.userId))
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
            {entries.map((entry) => (
              <ListRow
                key={entry.id}
                href={`/brews/${entry.id}`}
                title={entry.method}
                subtitle={entry.beanName}
                date={entry.brewedAt}
              >
                <p className="text-body md:col-span-1">
                  {entry.rating != null ? `${entry.rating}/10` : "—"}
                </p>
                <p className="text-body text-muted-foreground md:col-span-5">
                  {entry.roastery} · {entry.username ?? entry.userName}
                </p>
              </ListRow>
            ))}
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
