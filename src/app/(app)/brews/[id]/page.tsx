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
import { getSession } from "@/lib/session"

import { getBrewAdviceQuota, getCachedBrewAdvice } from "../advice"
import { BrewMaster } from "./brew-master"

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
  const [brewAdvice, adviceQuota] = isOwner
    ? await Promise.all([getCachedBrewAdvice(brew.id), getBrewAdviceQuota()])
    : [null, null]

  return (
    <PageShell>
      <PageHeader
        kicker={
          <>
            Brew — {formatDate(brew.brewedAt)}
            {isOwner ? ` · ${brew.isPublic ? "Public" : "Private"}` : null}
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
        <h2 className="text-h2 font-medium">Bean</h2>
        <div>
          {brew.bean.originCountry ? (
            <Row
              label="Origin"
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
              label="Process"
              value={brew.bean.process ?? "—"}
              detail={
                brew.bean.roastLevel
                  ? `${brew.bean.roastLevel} roast`
                  : undefined
              }
            />
          ) : null}
          {brew.bean.flavorNotes ? (
            <Row label="Flavor" value={brew.bean.flavorNotes} />
          ) : null}
        </div>
        {isOwner ? (
          <div className="text-body">
            <Link
              href={`/beans/${brew.bean.id}`}
              className="hover:text-muted-foreground font-medium underline underline-offset-4"
            >
              View bean
            </Link>
          </div>
        ) : null}
      </section>

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">Recipe</h2>
        <div>
          <Row label="Method" value={brew.method} />
          {brew.coffeeG != null ? (
            <Row
              label="Dose"
              value={`${brew.coffeeG} g`}
              detail={brewRatio ? `Ratio ${brewRatio}` : undefined}
            />
          ) : null}
          {isEspresso
            ? brew.brewWeightG != null && (
                <Row
                  label="Yield"
                  value={`${brew.brewWeightG} g`}
                  detail={brew.tds != null ? `TDS ${brew.tds} %` : undefined}
                />
              )
            : brew.waterG != null && (
                <Row
                  label="Water"
                  value={`${brew.waterG} g`}
                  detail={
                    brew.temperatureC != null
                      ? `${brew.temperatureC} °C`
                      : undefined
                  }
                />
              )}
          {isEspresso && brew.temperatureC != null ? (
            <Row label="Temperature" value={`${brew.temperatureC} °C`} />
          ) : null}
          {isEspresso && brew.extractionYield != null ? (
            <Row label="Extraction" value={`${brew.extractionYield} %`} />
          ) : null}
          {brew.timeSeconds != null ? (
            <Row label="Time" value={formatTime(brew.timeSeconds)} />
          ) : null}
          {brew.grinder || brew.grindSetting ? (
            <Row
              label="Grinder"
              value={brew.grinder ?? "—"}
              detail={brew.grindSetting ?? undefined}
            />
          ) : null}
        </div>
      </section>

      <section className="space-y-8 md:space-y-10">
        <h2 className="text-h2 font-medium">Taste</h2>
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
            />
          ) : null}
          {brew.notes ? <Row label="Notes" value={brew.notes} /> : null}
        </div>
        {isOwner ? (
          <div className="text-body">
            <Link
              href={`/brews/${brew.id}/edit`}
              className="hover:text-muted-foreground font-medium underline underline-offset-4"
            >
              Edit brew
            </Link>
          </div>
        ) : null}
      </section>

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
