import Link from "next/link"
import { notFound } from "next/navigation"

import { and, desc, eq } from "drizzle-orm"

import { Row } from "@/components/field"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { db } from "@/lib/db"
import { beans, brews } from "@/lib/db/schema"
import { formatDate } from "@/lib/format"
import { getDictionary } from "@/lib/i18n"
import { requireSession } from "@/lib/session"

export const metadata = { title: "Bean" }

export default async function BeanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireSession()
  const dict = getDictionary(session.user.locale)
  const { id } = await params

  const bean = await db.query.beans.findFirst({
    where: and(eq(beans.id, id), eq(beans.userId, session.user.id)),
    with: {
      brews: { orderBy: desc(brews.brewedAt) },
    },
  })
  if (!bean) notFound()

  return (
    <PageShell>
      <PageHeader
        kicker={`${dict.bean.addedPrefix} ${formatDate(bean.createdAt)}`}
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
                  ? `${bean.roastLevel} ${dict.bean.roastSuffix}`
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
              value={formatDate(bean.roastDate)}
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
                <a
                  href={bean.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-muted-foreground underline underline-offset-4"
                >
                  {bean.productUrl}
                </a>
              }
            />
          ) : null}
          {bean.moreInfo ? (
            <Row label={dict.bean.moreInfo} value={bean.moreInfo} />
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
            {bean.brews.map((brew) => (
              <Link
                key={brew.id}
                href={`/brews/${brew.id}`}
                className="group border-border grid grid-cols-[6.5rem_1fr_auto] items-baseline gap-x-3 border-b py-4 md:grid-cols-12 md:gap-x-5"
              >
                <p className="text-small text-muted-foreground md:col-span-2">
                  {formatDate(brew.brewedAt)}
                </p>
                <p className="text-h3 font-medium group-hover:underline group-hover:underline-offset-4 md:col-span-4">
                  {brew.method}
                </p>
                <p className="text-body md:col-span-6">
                  {brew.rating != null ? `${brew.rating}/10` : "—"}
                </p>
              </Link>
            ))}
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
