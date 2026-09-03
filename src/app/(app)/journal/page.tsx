import Form from "next/form"
import Link from "next/link"

import { and, count, desc, eq } from "drizzle-orm"

import { ListRow } from "@/components/list-row"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { clampPage, PAGE_SIZE, Pagination } from "@/components/pagination"
import { SelectField } from "@/components/text-input"
import { db } from "@/lib/db"
import { beans, brews } from "@/lib/db/schema"
import { getDictionary } from "@/lib/i18n"
import { label } from "@/lib/i18n/config"
import { requireSession } from "@/lib/session"

export async function generateMetadata() {
  const { titles } = await getDictionary()
  return { title: titles.journal }
}

function param(value: string | string[] | undefined) {
  return typeof value === "string" && value ? value : undefined
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await requireSession()
  const { list, filters, pagination, enums } = await getDictionary()
  const sp = await searchParams
  const beanFilter = param(sp.bean)
  const methodFilter = param(sp.method)

  const brewConditions = [eq(brews.userId, session.user.id)]
  if (beanFilter) brewConditions.push(eq(brews.beanId, beanFilter))
  if (methodFilter) brewConditions.push(eq(brews.method, methodFilter))
  const brewWhere = and(...brewConditions)

  // Two lists on one page, each with its own page param so paging one list
  // doesn't reset the other. Bean options double as the filter dropdown.
  const [[{ value: beanCount }], [{ value: brewCount }], beanOptions, methods] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(beans)
        .where(eq(beans.userId, session.user.id)),
      db.select({ value: count() }).from(brews).where(brewWhere),
      db.query.beans.findMany({
        columns: { id: true, name: true },
        where: eq(beans.userId, session.user.id),
        orderBy: desc(beans.createdAt),
      }),
      db
        .selectDistinct({ value: brews.method })
        .from(brews)
        .where(eq(brews.userId, session.user.id)),
    ])
  const beansPage = clampPage(sp.beans, beanCount)
  const brewsPage = clampPage(sp.brews, brewCount)

  const [userBeans, userBrews] = await Promise.all([
    db.query.beans.findMany({
      where: eq(beans.userId, session.user.id),
      orderBy: desc(beans.createdAt),
      limit: PAGE_SIZE,
      offset: beansPage.offset,
    }),
    db.query.brews.findMany({
      where: brewWhere,
      orderBy: desc(brews.brewedAt),
      with: { bean: { columns: { name: true } } },
      limit: PAGE_SIZE,
      offset: brewsPage.offset,
    }),
  ])

  const methodOptions = methods.map((m) => m.value).sort()
  const hasFilters = Boolean(beanFilter || methodFilter)

  // Everything except the list's own page param, so paging one list keeps
  // the other list's page and the brew filters intact.
  const sharedParams = {
    beans: beansPage.page > 1 ? String(beansPage.page) : undefined,
    brews: brewsPage.page > 1 ? String(brewsPage.page) : undefined,
    bean: beanFilter,
    method: methodFilter,
  }

  return (
    <PageShell>
      <PageHeader kicker={session.user.name} title={list.journalTitle} />

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">{list.beansHeading}</h2>
        {userBeans.length === 0 ? (
          <p className="text-body text-muted-foreground">{list.noBeans}</p>
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
                <p className="text-body text-muted-foreground wrap-anywhere md:col-span-6">
                  {[
                    bean.originCountry,
                    bean.process,
                    label(enums.roastLevels, bean.roastLevel),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </ListRow>
            ))}
          </div>
        )}
        <Pagination
          pathname="/journal"
          page={beansPage.page}
          totalPages={beansPage.totalPages}
          paramName="beans"
          params={{ ...sharedParams, beans: undefined }}
          scroll={false}
          t={pagination}
        />
        <div className="text-body">
          <Link
            href="/beans/new"
            className="hover:text-muted-foreground font-medium underline underline-offset-4"
          >
            {list.newBean}
          </Link>
        </div>
      </section>

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">{list.brewsHeading}</h2>

        {/* next/form: client-side navigation, so scroll={false} can hold the
            reader's place next to the list — same in-place behavior as the
            pagination links below. */}
        <Form
          action="/journal"
          scroll={false}
          className="grid gap-x-5 gap-y-6 md:grid-cols-12"
        >
          {/* GET submit only carries the form's own fields — keep the beans
              list's page; the brews page intentionally resets to 1. */}
          {sharedParams.beans ? (
            <input type="hidden" name="beans" value={sharedParams.beans} />
          ) : null}
          <SelectField
            label={filters.bean}
            name="bean"
            defaultValue={beanFilter ?? ""}
            className="md:col-span-4"
          >
            <option value="">{filters.all}</option>
            {beanOptions.map((bean) => (
              <option key={bean.id} value={bean.id}>
                {bean.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label={filters.method}
            name="method"
            defaultValue={methodFilter ?? ""}
            className="md:col-span-4"
          >
            <option value="">{filters.all}</option>
            {methodOptions.map((m) => (
              <option key={m} value={m}>
                {label(enums.methods, m)}
              </option>
            ))}
          </SelectField>
          <div className="text-body flex items-center gap-8 md:col-span-12">
            <button
              type="submit"
              className="hover:text-muted-foreground font-medium underline underline-offset-4"
            >
              {filters.apply}
            </button>
            {hasFilters ? (
              <Link
                href="/journal"
                scroll={false}
                className="text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                {filters.clear}
              </Link>
            ) : null}
          </div>
        </Form>

        {userBrews.length === 0 ? (
          <p className="text-body text-muted-foreground">
            {hasFilters ? list.noBrewsMatch : list.noBrews}
          </p>
        ) : (
          <div>
            {userBrews.map((brew) => (
              <ListRow
                key={brew.id}
                href={`/brews/${brew.id}`}
                title={label(enums.methods, brew.method)}
                subtitle={brew.bean.name}
                date={brew.brewedAt}
              >
                <p className="text-body md:col-span-6">
                  {brew.rating != null ? `${brew.rating}/10` : "—"}
                  {brew.isPublic ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {label(enums.visibility, "Public")}
                    </span>
                  ) : null}
                </p>
              </ListRow>
            ))}
          </div>
        )}
        <Pagination
          pathname="/journal"
          page={brewsPage.page}
          totalPages={brewsPage.totalPages}
          paramName="brews"
          params={{ ...sharedParams, brews: undefined }}
          scroll={false}
          t={pagination}
        />
        <div className="text-body">
          <Link
            href="/brews/new"
            className="hover:text-muted-foreground font-medium underline underline-offset-4"
          >
            {list.newBrew}
          </Link>
        </div>
      </section>
    </PageShell>
  )
}
