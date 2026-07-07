import Link from "next/link"
import { notFound } from "next/navigation"

import { eq } from "drizzle-orm"

import { Row } from "@/components/field"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { TasteScale } from "@/components/taste-scale"
import { db } from "@/lib/db"
import { brews } from "@/lib/db/schema"
import { formatDate, formatTime } from "@/lib/format"
import { getDictionary } from "@/lib/i18n"
import { getRatingSummary } from "@/lib/ratings"
import { getSession } from "@/lib/session"

import { getBrewAdviceQuota, getCachedBrewAdvice } from "../advice"
import { BrewMaster } from "./brew-master"
import { StarRating } from "./star-rating"

export const metadata = { title: "Brew" }

function ratio(dose: number | null, out: number | null) {
  if (!dose || !out) return null
  const r = out / dose
  return `1:${r >= 3 ? r.toFixed(1) : r.toFixed(2)}`
}

export default async function BrewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  // Localize fixed UI to the viewer's own language (default "en" when logged out).
  const dict = getDictionary(session?.user.locale)
  const { id } = await params

  const brew = await db.query.brews.findFirst({
    where: eq(brews.id, id),
    with: { bean: true, user: { columns: { username: true, name: true } } },
  })
  if (!brew) notFound()

  const isOwner = session?.user.id === brew.userId
  if (!brew.isPublic && !isOwner) notFound()

  const isEspresso = /espresso/i.test(brew.method)
  const brewRatio = ratio(
    brew.coffeeG,
    isEspresso ? brew.brewWeightG : brew.waterG,
  )
  const hasTaste =
    brew.tasteAroma != null ||
    brew.tasteSweetness != null ||
    brew.tasteAcidity != null ||
    brew.tasteBitterness != null ||
    brew.tasteBody != null

  // Brew Master gate: enabled once the brew is fully reviewed (rating + all
  // five taste dimensions). Only owners get the AI section; pull the cached
  // advice and today's quota up front so the client renders without a round-trip.
  const reviewed =
    brew.rating != null &&
    brew.tasteAroma != null &&
    brew.tasteSweetness != null &&
    brew.tasteAcidity != null &&
    brew.tasteBitterness != null &&
    brew.tasteBody != null
  // The owner's advice/quota and the community rating summary are independent,
  // so fetch them together rather than serially. Community star ratings are only
  // meaningful on public brews; everyone sees the average, but only logged-in
  // members who aren't the author can cast a vote.
  const [[brewAdvice, adviceQuota], ratingSummary] = await Promise.all([
    isOwner
      ? Promise.all([getCachedBrewAdvice(brew.id), getBrewAdviceQuota()])
      : Promise.resolve([null, null] as const),
    brew.isPublic
      ? getRatingSummary(brew.id, session?.user.id)
      : Promise.resolve(null),
  ])

  return (
    <PageShell>
      <PageHeader
        kicker={
          <>
            {dict.brew.kicker} — {formatDate(brew.brewedAt)}
            {isOwner
              ? ` · ${brew.isPublic ? dict.brew.public : dict.brew.private}`
              : null}
            {!isOwner && brew.user.username ? (
              <>
                {" · "}
                <Link
                  href={`/u/${brew.user.username}`}
                  className="hover:text-foreground underline underline-offset-4"
                >
                  {brew.user.name}
                </Link>
              </>
            ) : null}
          </>
        }
        title={
          <>
            {brew.method}{" "}
            <span className="text-muted-foreground">— {brew.bean.name}</span>
          </>
        }
        subtitle={[brew.bean.roastery, brew.bean.roasteryCountry]
          .filter(Boolean)
          .join(", ")}
      />

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">{dict.bean.heading}</h2>
        <div>
          {brew.bean.originCountry ? (
            <Row
              label={dict.bean.origin}
              value={brew.bean.originCountry}
              detail={
                [brew.bean.region, brew.bean.altitude]
                  .filter(Boolean)
                  .join(", ") || undefined
              }
            />
          ) : null}
          {brew.bean.process || brew.bean.roastLevel ? (
            <Row
              label={dict.bean.process}
              value={brew.bean.process ?? "—"}
              detail={
                brew.bean.roastLevel
                  ? `${brew.bean.roastLevel} ${dict.bean.roastSuffix}`
                  : undefined
              }
            />
          ) : null}
          {brew.bean.flavorNotes ? (
            <Row label={dict.bean.flavor} value={brew.bean.flavorNotes} />
          ) : null}
        </div>
        {isOwner ? (
          <div className="text-body">
            <Link
              href={`/beans/${brew.bean.id}`}
              className="hover:text-muted-foreground font-medium underline underline-offset-4"
            >
              {dict.brew.viewBean}
            </Link>
          </div>
        ) : null}
      </section>

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">{dict.brew.recipe}</h2>
        <div>
          <Row label={dict.brew.method} value={brew.method} />
          {brew.coffeeG != null ? (
            <Row
              label={dict.brew.dose}
              value={`${brew.coffeeG} g`}
              detail={brewRatio ? `${dict.brew.ratio} ${brewRatio}` : undefined}
            />
          ) : null}
          {isEspresso
            ? brew.brewWeightG != null && (
                <Row
                  label={dict.brew.yield}
                  value={`${brew.brewWeightG} g`}
                  detail={brew.tds != null ? `TDS ${brew.tds} %` : undefined}
                />
              )
            : brew.waterG != null && (
                <Row
                  label={dict.brew.water}
                  value={`${brew.waterG} g`}
                  detail={
                    brew.temperatureC != null
                      ? `${brew.temperatureC} °C`
                      : undefined
                  }
                />
              )}
          {isEspresso && brew.temperatureC != null ? (
            <Row
              label={dict.brew.temperature}
              value={`${brew.temperatureC} °C`}
            />
          ) : null}
          {isEspresso && brew.extractionYield != null ? (
            <Row
              label={dict.brew.extraction}
              value={`${brew.extractionYield} %`}
            />
          ) : null}
          {brew.timeSeconds != null ? (
            <Row label={dict.brew.time} value={formatTime(brew.timeSeconds)} />
          ) : null}
          {brew.grinder || brew.grindSetting ? (
            <Row
              label={dict.brew.grinder}
              value={brew.grinder ?? "—"}
              detail={brew.grindSetting ?? undefined}
            />
          ) : null}
        </div>
      </section>

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">{dict.taste.heading}</h2>
        {brew.rating != null ? (
          <p className="text-display font-medium">
            {brew.rating}
            <span className="text-muted-foreground">/10</span>
          </p>
        ) : null}
        <div>
          {hasTaste ? (
            <TasteScale
              profile={{
                aroma: brew.tasteAroma ?? 0,
                sweetness: brew.tasteSweetness ?? 0,
                acidity: brew.tasteAcidity ?? 0,
                bitterness: brew.tasteBitterness ?? 0,
                body: brew.tasteBody ?? 0,
              }}
              labels={{
                aroma: dict.taste.aroma,
                sweetness: dict.taste.sweetness,
                acidity: dict.taste.acidity,
                bitterness: dict.taste.bitterness,
                body: dict.taste.body,
              }}
            />
          ) : null}
          {brew.notes ? (
            <Row label={dict.taste.notes} value={brew.notes} />
          ) : null}
        </div>
        {isOwner ? (
          <div className="text-body">
            <Link
              href={`/brews/${brew.id}/edit`}
              className="hover:text-muted-foreground font-medium underline underline-offset-4"
            >
              {dict.brew.editBrew}
            </Link>
          </div>
        ) : null}
      </section>

      {ratingSummary ? (
        <section className="space-y-8 md:space-y-10">
          <h2 className="text-h2 font-medium">{dict.community.heading}</h2>
          <StarRating
            brewId={brew.id}
            average={ratingSummary.average}
            count={ratingSummary.count}
            mine={ratingSummary.mine}
            canRate={Boolean(session) && !isOwner}
            labels={dict.community}
          />
        </section>
      ) : null}

      {isOwner && adviceQuota ? (
        <section className="space-y-8 md:space-y-10">
          <h2 className="text-h2 font-medium">Brew Master</h2>
          <BrewMaster
            brewId={brew.id}
            ready={reviewed}
            initialAdvice={brewAdvice}
            initialRemaining={adviceQuota.remaining}
            limit={adviceQuota.limit}
          />
        </section>
      ) : null}
    </PageShell>
  )
}
