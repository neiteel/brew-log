import { cache } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { eq } from "drizzle-orm"

import { DATA_ROW_MEASURE, Figure, Paren, Row } from "@/components/field"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { TasteScale } from "@/components/taste-scale"
import { db } from "@/lib/db"
import { brews } from "@/lib/db/schema"
import { brewRatio, formatDate, formatTime, isEspresso } from "@/lib/format"
import { getDictionary, getLocale } from "@/lib/i18n"
import { label } from "@/lib/i18n/config"
import { getRatingSummary } from "@/lib/ratings"
import { getSession } from "@/lib/session"
import { cn } from "@/lib/utils"

import { getBrewAdviceQuota, getCachedBrewAdvice } from "../advice"
import { BrewMaster } from "./brew-master"
import { StarRating } from "./star-rating"

// Shared by generateMetadata and the page itself — one round trip per request.
const getBrew = cache(async (id: string) =>
  db.query.brews.findFirst({
    where: eq(brews.id, id),
    with: { bean: true, user: { columns: { username: true, name: true } } },
  }),
)

// Two brews open in two tabs are only comparable if the tabs say which is which.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const brew = await getBrew(id)
  const dict = await getDictionary()
  if (!brew) return { title: dict.titles.brew }
  // The tab has to say the same word the list said, or the two tabs being
  // compared disagree about what they are.
  return {
    title: `${label(dict.enums.methods, brew.method)} — ${brew.bean.name}`,
  }
}

export default async function BrewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  // Localize fixed UI to the viewer's own language (default "en" when logged out).
  const dict = await getDictionary()
  const locale = await getLocale()
  const { id } = await params

  const brew = await getBrew(id)
  if (!brew) notFound()

  const isOwner = session?.user.id === brew.userId
  if (!brew.isPublic && !isOwner) notFound()

  const espresso = isEspresso(brew.method)
  const ratio = brewRatio(brew)
  // "1:16.7" splits into a gray basis and an ink value; see the display block.
  const [ratioBasis, ratioValue] = ratio ? ratio.split(":") : []
  const hasTaste =
    brew.tasteAroma != null ||
    brew.tasteSweetness != null ||
    brew.tasteAcidity != null ||
    brew.tasteBitterness != null ||
    brew.tasteBody != null

  // Every field is optional, so both of these sections can come out empty —
  // and a heading over nothing reads as a row that failed to load, not as a
  // record that was left spare. Each section renders only when it has
  // something to say. `ratio` needs a dose and an output, so it cannot exist
  // without a figure to sit above.
  const hasFigures =
    brew.coffeeG != null ||
    (espresso ? brew.brewWeightG != null : brew.waterG != null) ||
    brew.grindSetting != null ||
    brew.grinder != null ||
    brew.temperatureC != null ||
    brew.timeSeconds != null ||
    brew.tds != null ||
    brew.extractionYield != null
  const hasTasteContent = brew.rating != null || hasTaste || Boolean(brew.notes)

  // The bean is context here, not the subject: one line of the facts that
  // change how the recipe reads, with the full page a click away.
  const beanFacts = [
    [brew.bean.originCountry, brew.bean.region].filter(Boolean).join(", "),
    brew.bean.process,
    brew.bean.roastLevel
      ? `${label(dict.enums.roastLevels, brew.bean.roastLevel)} ${dict.bean.roastSuffix}`.trim()
      : null,
    brew.bean.flavorNotes,
  ].filter(Boolean)

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
      <div className="space-y-6">
        <PageHeader
          kicker={
            <>
              {dict.brew.kicker} — {formatDate(brew.brewedAt, locale)}
              {isOwner
                ? ` · ${label(dict.enums.visibility, brew.isPublic ? "Public" : "Private")}`
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
              {label(dict.enums.methods, brew.method)}{" "}
              <span className="text-muted-foreground">— {brew.bean.name}</span>
            </>
          }
          subtitle={[brew.bean.roastery, brew.bean.roasteryCountry]
            .filter(Boolean)
            .join(", ")}
        />
        {beanFacts.length > 0 || isOwner ? (
          <p className="text-body wrap-anywhere">
            <Paren>{dict.bean.heading}</Paren> {beanFacts.join(" · ")}
            {isOwner ? (
              <>
                {beanFacts.length > 0 ? " · " : null}
                <Link
                  href={`/beans/${brew.bean.id}`}
                  className="hover:text-muted-foreground underline underline-offset-4"
                >
                  {dict.brew.viewBean}
                </Link>
              </>
            ) : null}
          </p>
        ) : null}
      </div>

      {/* The recipe leads: these are the numbers you change to get a different
          cup. The ratio takes the display slot — it's the one figure that
          decides the next brew — and the rest stay foreground, not detail. */}
      {hasFigures ? (
        <section className="space-y-10 md:space-y-14">
          {ratio ? (
            <div className="space-y-2">
              {/* The recipe is the reason the page exists, so it stays in the
                  heading outline even when the display figure replaces its
                  visible heading. Without this the rotor read h1 -> Taste ->
                  Community and never announced the recipe at all. */}
              <h2 className="sr-only">{dict.brew.recipe}</h2>
              <p className="text-small">
                <Paren>{dict.brew.ratio}</Paren>
              </p>
              {/* `1:` is the unit, and the system's north star sets the unit
                  inside the number in gray — that gray is the fourth level of
                  hierarchy the whole palette is argued from. All-ink shipped
                  three. */}
              <p className="text-display font-medium tabular-nums">
                <span className="text-muted-foreground">{ratioBasis}:</span>
                {ratioValue}
              </p>
            </div>
          ) : (
            <h2 className="text-h2 font-medium">{dict.brew.recipe}</h2>
          )}
          {/* The figures are data, so they end where the taste rows end: left
            unmeasured they spread to 1190px while the hairlines below stop at
            832px, which puts two right edges inside one record.

            auto-fit rather than a fixed four columns, because the set is
            always 3-7 items — whichever of dose, water/yield, grind, temp,
            time, TDS and extraction yield were recorded. Four columns orphaned
            the fifth figure onto a row of its own, and the grinder note made
            that cell taller so on mobile `(Time)` sat ~100px below its
            row-mates. A recipe is read as a block, not as a list. */}
          <div
            className={cn(
              "grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-x-5 gap-y-10",
              DATA_ROW_MEASURE,
            )}
          >
            {brew.coffeeG != null ? (
              <Figure label={dict.brew.dose} value={brew.coffeeG} unit="g" />
            ) : null}
            {espresso
              ? brew.brewWeightG != null && (
                  <Figure
                    label={dict.brew.yield}
                    value={brew.brewWeightG}
                    unit="g"
                  />
                )
              : brew.waterG != null && (
                  <Figure
                    label={dict.brew.water}
                    value={brew.waterG}
                    unit="g"
                  />
                )}
            {brew.grindSetting || brew.grinder ? (
              <Figure
                label={dict.brew.grind}
                value={brew.grindSetting ?? brew.grinder}
                note={
                  brew.grindSetting ? (brew.grinder ?? undefined) : undefined
                }
              />
            ) : null}
            {brew.temperatureC != null ? (
              <Figure
                label={dict.brew.temperature}
                value={brew.temperatureC}
                unit="°C"
              />
            ) : null}
            {brew.timeSeconds != null ? (
              <Figure
                label={dict.brew.time}
                value={formatTime(brew.timeSeconds)}
              />
            ) : null}
            {brew.tds != null ? (
              <Figure label="TDS" value={brew.tds} unit="%" />
            ) : null}
            {brew.extractionYield != null ? (
              <Figure
                label={dict.brew.extraction}
                value={brew.extractionYield}
                unit="%"
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {hasTasteContent || isOwner ? (
        <section className="space-y-8 md:space-y-10">
          <h2 className="text-h2 font-medium">{dict.taste.heading}</h2>
          {brew.rating != null ? (
            <Figure
              label={dict.taste.rating}
              value={
                <>
                  {brew.rating}
                  <span className="text-muted-foreground">/10</span>
                </>
              }
            />
          ) : null}
          <div>
            {hasTaste ? (
              <TasteScale
                profile={{
                  aroma: brew.tasteAroma,
                  sweetness: brew.tasteSweetness,
                  acidity: brew.tasteAcidity,
                  bitterness: brew.tasteBitterness,
                  body: brew.tasteBody,
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
              <Row
                label={dict.taste.notes}
                value={
                  <span className="whitespace-pre-line">{brew.notes}</span>
                }
              />
            ) : null}
          </div>
          {!hasTasteContent && isOwner ? (
            <p className="text-body text-muted-foreground">
              {dict.taste.notScoredBefore}
              <Link
                href={`/brews/${brew.id}/edit`}
                className="hover:text-foreground underline underline-offset-4"
              >
                {dict.taste.notScoredLink}
              </Link>
              {dict.taste.notScoredAfter}
            </p>
          ) : null}
          {isOwner ? (
            <div className="text-body flex flex-wrap items-center gap-x-8 gap-y-3">
              <Link
                href={`/brews/new?from=${brew.id}`}
                className="hover:text-muted-foreground font-medium underline underline-offset-4"
              >
                {dict.brew.repeatBrew}
              </Link>
              <Link
                href={`/brews/${brew.id}/edit`}
                className="text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                {dict.brew.editBrew}
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Everything after the record itself. Both of these can be one line —
          an unrated brew's community block is four gray words — so they share
          one chapter break from the recipe above instead of taking 144px each
          and stranding a 39px heading over a void. */}
      {ratingSummary || (isOwner && adviceQuota) ? (
        <div className="space-y-12 md:space-y-20">
          {ratingSummary ? (
            <section
              className={
                ratingSummary.count > 0 || (session && !isOwner)
                  ? "space-y-8 md:space-y-10"
                  : "space-y-4"
              }
            >
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
              <h2 className="text-h2 font-medium">{dict.brewMaster.heading}</h2>
              <BrewMaster
                brewId={brew.id}
                ready={reviewed}
                initialAdvice={brewAdvice}
                initialRemaining={adviceQuota.remaining}
                limit={adviceQuota.limit}
                t={dict.brewMaster}
              />
            </section>
          ) : null}
        </div>
      ) : null}
    </PageShell>
  )
}
