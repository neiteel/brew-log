import { cache } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { and, desc, eq } from "drizzle-orm"

import { Row } from "@/components/field"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { db } from "@/lib/db"
import { beans, brews } from "@/lib/db/schema"
import { brewRatio, externalHref, formatDate } from "@/lib/format"
import { getDictionary, getLocale } from "@/lib/i18n"
import { label } from "@/lib/i18n/config"
import { requireSession } from "@/lib/session"

// Shared by generateMetadata and the page itself — one round trip per request.
const getBean = cache(async (id: string, userId: string) =>
  db.query.beans.findFirst({
    where: and(eq(beans.id, id), eq(beans.userId, userId)),
    with: {
      brews: { orderBy: desc(brews.brewedAt) },
    },
  }),
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireSession()
  const { id } = await params
  const bean = await getBean(id, session.user.id)
  if (!bean) return { title: (await getDictionary()).titles.bean }
  return { title: `${bean.name} — ${bean.roastery}` }
}

export default async function BeanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireSession()
  const dict = await getDictionary()
  const locale = await getLocale()
  const { id } = await params

  const bean = await getBean(id, session.user.id)
  if (!bean) notFound()

  return (
    <PageShell>
      <PageHeader
        kicker={`${dict.bean.addedPrefix} ${formatDate(bean.createdAt, locale)}`}
        title={
          <>
            {bean.name}{" "}
            <span className="text-muted-foreground">— {bean.roastery}</span>
          </>
        }
        subtitle={bean.roasteryCountry}
      />

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">{dict.bean.heading}</h2>
        <div>
          {bean.originCountry ? (
            <Row
              label={dict.bean.origin}
              value={bean.originCountry}
              detail={
                [bean.region, bean.altitude].filter(Boolean).join(", ") ||
                undefined
              }
            />
          ) : null}
          {bean.process || bean.roastLevel ? (
            <Row
              label={dict.bean.process}
              value={bean.process ?? "—"}
              detail={
                bean.roastLevel
                  ? `${label(dict.enums.roastLevels, bean.roastLevel)} ${dict.bean.roastSuffix}`.trim()
                  : undefined
              }
            />
          ) : null}
          {bean.varietals ? (
            <Row label={dict.bean.varietals} value={bean.varietals} />
          ) : null}
          {bean.flavorNotes ? (
            <Row label={dict.bean.flavor} value={bean.flavorNotes} />
          ) : null}
          {bean.cuppingScore != null ? (
            <Row label={dict.bean.cupping} value={bean.cuppingScore} />
          ) : null}
          {bean.roastDate ? (
            <Row
              label={dict.bean.roastDate}
              value={formatDate(bean.roastDate, locale)}
            />
          ) : null}
          {bean.price || bean.weightG != null ? (
            <Row
              label={dict.bean.price}
              value={bean.price ?? "—"}
              detail={bean.weightG != null ? `${bean.weightG} g` : undefined}
            />
          ) : null}
          {bean.productUrl ? (
            <Row
              label={dict.bean.url}
              value={
                // Only an http(s) value becomes a link; anything else stays
                // inert text rather than a clickable `javascript:` href.
                externalHref(bean.productUrl) ? (
                  <a
                    href={bean.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-muted-foreground underline underline-offset-4"
                  >
                    {bean.productUrl}
                  </a>
                ) : (
                  bean.productUrl
                )
              }
            />
          ) : null}
          {bean.moreInfo ? (
            <Row
              label={dict.bean.moreInfo}
              value={
                <span className="whitespace-pre-line">{bean.moreInfo}</span>
              }
            />
          ) : null}
        </div>
        <div className="text-body flex items-center gap-8">
          <Link
            href={`/beans/${bean.id}/edit`}
            className="hover:text-muted-foreground font-medium underline underline-offset-4"
          >
            {dict.bean.editBean}
          </Link>
        </div>
      </section>

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">{dict.bean.brewsHeading}</h2>
        {bean.brews.length === 0 ? (
          <p className="text-body text-muted-foreground">
            {dict.bean.noBrewsYet}
          </p>
        ) : (
          <div>
            {/* The recipe is what you came for: two brews of the same bean are
                only worth comparing by the numbers that separate them. Every
                field is already loaded with the bean — no extra query. */}
            {bean.brews.map((brew) => {
              const recipe = [
                brew.coffeeG != null ? `${brew.coffeeG} g` : null,
                brewRatio(brew),
                brew.grindSetting,
              ].filter(Boolean)
              return (
                <Link
                  key={brew.id}
                  href={`/brews/${brew.id}`}
                  className="group border-border grid grid-cols-[6.5rem_1fr_auto] items-baseline gap-x-3 gap-y-1 border-b py-4 md:grid-cols-12 md:gap-x-5 md:gap-y-0"
                >
                  <p className="text-small text-muted-foreground md:col-span-2">
                    {formatDate(brew.brewedAt, locale)}
                  </p>
                  <p className="text-h3 col-start-2 font-medium wrap-anywhere group-hover:underline group-hover:underline-offset-4 md:col-span-3 md:col-start-auto">
                    {brew.method}
                  </p>
                  <p className="text-body col-span-2 col-start-2 wrap-anywhere tabular-nums md:col-span-5 md:col-start-auto">
                    {recipe.join(" · ")}
                  </p>
                  <p className="text-body col-start-3 row-start-1 tabular-nums md:col-span-2 md:col-start-auto md:row-start-auto md:text-right">
                    {brew.rating != null ? (
                      <>
                        {brew.rating}
                        <span className="text-muted-foreground">/10</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
        <div className="text-body">
          <Link
            href={`/brews/new?bean=${bean.id}`}
            className="hover:text-muted-foreground font-medium underline underline-offset-4"
          >
            {dict.bean.newBrewWithBean}
          </Link>
        </div>
      </section>
    </PageShell>
  )
}
