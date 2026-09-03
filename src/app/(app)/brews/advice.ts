"use server"

import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { and, desc, eq, ne, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { brewAdvice, brewAdviceUsage, brews } from "@/lib/db/schema"
import { getDictionary, getLocale } from "@/lib/i18n"
import { LOCALE_NAMES } from "@/lib/i18n/config"
import { requireSession } from "@/lib/session"

// How many Brew Master generations a single user may run per (UTC) month.
// Advice is cached one row per brew, so this only bites on regenerations / lots
// of new brews — it's a cost backstop, mirroring `bean_scan_usage`.
const MONTHLY_ADVICE_LIMIT = 10

// Same-bean brews we feed as history for comparison. Enough to spot a trend
// without bloating the prompt.
const HISTORY_LIMIT = 8

const MODEL = "gemini-3.5-flash"

type BrewRow = typeof brews.$inferSelect
type BeanRow = NonNullable<Awaited<ReturnType<typeof loadBrew>>>["bean"]

export type AdviceQuota = { used: number; remaining: number; limit: number }

export type BrewAdviceResult =
  | { ok: true; advice: string; remaining: number }
  | { ok: false; error: string; remaining: number }

// First day of the current UTC month, "YYYY-MM-01" — the granularity of the
// monthly cap.
function currentPeriod() {
  return `${new Date().toISOString().slice(0, 7)}-01`
}

// A brew is "reviewed" — and so eligible for advice — once it has an overall
// rating and all five taste dimensions scored. Mirrors the UI gate. Kept local
// because a "use server" module may only export async functions.
function isBrewReviewed(brew: {
  rating: number | null
  tasteAroma: number | null
  tasteSweetness: number | null
  tasteAcidity: number | null
  tasteBitterness: number | null
  tasteBody: number | null
}): boolean {
  return (
    brew.rating != null &&
    brew.tasteAroma != null &&
    brew.tasteSweetness != null &&
    brew.tasteAcidity != null &&
    brew.tasteBitterness != null &&
    brew.tasteBody != null
  )
}

async function loadBrew(id: string) {
  return db.query.brews.findFirst({
    where: eq(brews.id, id),
    with: { bean: true },
  })
}

export async function getBrewAdviceQuota(): Promise<AdviceQuota> {
  const session = await requireSession()
  const [usage] = await db
    .select({ count: brewAdviceUsage.count })
    .from(brewAdviceUsage)
    .where(
      and(
        eq(brewAdviceUsage.userId, session.user.id),
        eq(brewAdviceUsage.period, currentPeriod()),
      ),
    )
  const used = usage?.count ?? 0
  return {
    used,
    remaining: Math.max(0, MONTHLY_ADVICE_LIMIT - used),
    limit: MONTHLY_ADVICE_LIMIT,
  }
}

// Cached advice for a brew, if any. Read by the brew page on load so a revisit
// shows the existing advice without spending a token.
export async function getCachedBrewAdvice(
  brewId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ advice: brewAdvice.advice })
    .from(brewAdvice)
    .where(eq(brewAdvice.brewId, brewId))
  return row?.advice ?? null
}

const SYSTEM_PROMPT = `You are the "Brew Master", an expert coffee brewing coach embedded in a personal brew journal. A user has logged a brew, rated it, and scored it on five taste dimensions. Your job is to suggest concrete adjustments for their *next* brew of the same coffee.

Guidance:
- The bean's "roaster flavor notes" describe the flavours the roaster expects this coffee to show. Treat them as the target. Compare the user's actual taste scores against that target and against their brew history.
- Be specific and actionable: recommend direction and rough magnitude for grind size, dose/ratio, water temperature, and brew time — only for the variables that plausibly explain the gap. Ground each suggestion in a cause (e.g. "acidity is low and bitterness high → likely over-extraction → grind coarser or drop temp ~2°C").
- Respect the brew method (espresso vs pour-over/immersion) and any TDS/extraction-yield data present.
- If the brew already scores well and matches the roaster's notes, say so plainly and suggest at most one small experiment.
- Keep it tight: 2–4 short paragraphs or a few bullet points. No preamble, no restating all their numbers back, no markdown headings.
- Language: write your reply in the language named by the "Reply language" directive below. That is the language the user chose for the app, so it wins even when their own tasting notes are written in another language. Match it even for coffee terminology; do not switch to English out of habit.
- You are giving brewing advice only. Do not write tasting notes or fill in journal fields for the user.`

function ratioLine(brew: BrewRow): string {
  const isEspresso = /espresso/i.test(brew.method)
  const out = isEspresso ? brew.brewWeightG : brew.waterG
  if (!brew.coffeeG || !out) return ""
  return `, ratio 1:${(out / brew.coffeeG).toFixed(2)}`
}

// Compact one-liner describing a brew's recipe + result, for the prompt.
function describeBrew(brew: BrewRow, label: string): string {
  const isEspresso = /espresso/i.test(brew.method)
  const parts: string[] = []
  parts.push(brew.method)
  if (brew.grinder || brew.grindSetting) {
    parts.push(
      `grind ${[brew.grinder, brew.grindSetting].filter(Boolean).join(" ")}`,
    )
  }
  if (brew.coffeeG != null) parts.push(`dose ${brew.coffeeG}g`)
  if (isEspresso && brew.brewWeightG != null)
    parts.push(`yield ${brew.brewWeightG}g`)
  if (!isEspresso && brew.waterG != null) parts.push(`water ${brew.waterG}g`)
  if (brew.temperatureC != null) parts.push(`${brew.temperatureC}°C`)
  if (brew.timeSeconds != null) {
    const m = Math.floor(brew.timeSeconds / 60)
    const s = brew.timeSeconds % 60
    parts.push(`time ${m}:${String(s).padStart(2, "0")}`)
  }
  if (brew.tds != null) parts.push(`TDS ${brew.tds}%`)
  if (brew.extractionYield != null) parts.push(`EY ${brew.extractionYield}%`)

  const recipe = parts.join(", ") + ratioLine(brew)
  const taste =
    `rating ${brew.rating}/10 — aroma ${brew.tasteAroma}, ` +
    `sweetness ${brew.tasteSweetness}, acidity ${brew.tasteAcidity}, ` +
    `bitterness ${brew.tasteBitterness}, body ${brew.tasteBody} (all /10)`
  const notes = brew.notes ? `\n  Taster notes: ${brew.notes}` : ""
  return `${label}: ${recipe}\n  Result: ${taste}${notes}`
}

function describeBean(bean: BeanRow): string {
  const lines: string[] = [`Coffee: ${bean.name} — ${bean.roastery}`]
  const origin = [bean.originCountry, bean.region, bean.altitude]
    .filter(Boolean)
    .join(", ")
  if (origin) lines.push(`Origin: ${origin}`)
  if (bean.varietals) lines.push(`Varietals: ${bean.varietals}`)
  if (bean.process) lines.push(`Process: ${bean.process}`)
  if (bean.roastLevel) lines.push(`Roast level: ${bean.roastLevel}`)
  if (bean.roastDate) lines.push(`Roast date: ${bean.roastDate}`)
  if (bean.flavorNotes) lines.push(`Roaster flavor notes: ${bean.flavorNotes}`)
  if (bean.cuppingScore != null)
    lines.push(`Cupping score: ${bean.cuppingScore}`)
  return lines.join("\n")
}

export async function askBrewMaster(
  brewId: string,
  options?: { force?: boolean },
): Promise<BrewAdviceResult> {
  const session = await requireSession()
  const force = options?.force ?? false

  const { ai } = await getDictionary()

  // Gate the model behind a verified email. Anonymous scripts can register
  // accounts freely, but each would need a real, reachable inbox to spend the
  // AI quota — which raises the cost of farming free generations considerably.
  if (!session.user.emailVerified) {
    const { remaining } = await getBrewAdviceQuota()
    return {
      ok: false,
      error: ai.verifyEmailAdvice,
      remaining,
    }
  }

  const brew = await loadBrew(brewId)
  if (!brew || brew.userId !== session.user.id) {
    const { remaining } = await getBrewAdviceQuota()
    return { ok: false, error: ai.brewNotFound, remaining }
  }

  if (!isBrewReviewed(brew)) {
    const { remaining } = await getBrewAdviceQuota()
    return {
      ok: false,
      error: ai.notReviewed,
      remaining,
    }
  }

  // Serve the cached advice unless the user explicitly asked to regenerate.
  if (!force) {
    const cached = await getCachedBrewAdvice(brewId)
    if (cached) {
      const { remaining } = await getBrewAdviceQuota()
      return { ok: true, advice: cached, remaining }
    }
  }

  const period = currentPeriod()
  const [usage] = await db
    .select({ count: brewAdviceUsage.count })
    .from(brewAdviceUsage)
    .where(
      and(
        eq(brewAdviceUsage.userId, session.user.id),
        eq(brewAdviceUsage.period, period),
      ),
    )
  if ((usage?.count ?? 0) >= MONTHLY_ADVICE_LIMIT) {
    return {
      ok: false,
      error: `Monthly limit reached (${MONTHLY_ADVICE_LIMIT}/month). Try again next month.`,
      remaining: 0,
    }
  }

  // Reserve the slot before spending a token, so a failed generation still
  // counts — same rationale as the bean scanner.
  const [updated] = await db
    .insert(brewAdviceUsage)
    .values({ userId: session.user.id, period, count: 1 })
    .onConflictDoUpdate({
      target: [brewAdviceUsage.userId, brewAdviceUsage.period],
      set: { count: sql`${brewAdviceUsage.count} + 1` },
    })
    .returning({ count: brewAdviceUsage.count })
  const remaining = Math.max(0, MONTHLY_ADVICE_LIMIT - (updated?.count ?? 0))

  const history = await db.query.brews.findMany({
    where: and(
      eq(brews.beanId, brew.beanId),
      eq(brews.userId, session.user.id),
      ne(brews.id, brew.id),
    ),
    orderBy: [desc(brews.brewedAt)],
    limit: HISTORY_LIMIT,
  })

  const historyBlock = history.length
    ? history.map((b, i) => describeBrew(b, `Past brew ${i + 1}`)).join("\n\n")
    : "No previous brews logged for this coffee."

  // Fallback reply language when the brew has no taster notes to detect from:
  // the request's Accept-Language, else English. The primary signal — the
  // notes' own language — is handled by the system prompt.
  // The language the user reads the app in — their stored preference, not
  // whatever their browser happens to send.
  const replyLanguage = LOCALE_NAMES[await getLocale()]

  const prompt = `${describeBean(brew.bean)}

${describeBrew(brew, "This brew (the one to improve)")}

Brew history for this coffee (most recent first):
${historyBlock}

Reply language (the user's app language — write the whole reply in it): ${replyLanguage}

Give me advice for my next brew of this coffee.`

  try {
    const { text } = await generateText({
      model: google(MODEL),
      instructions: SYSTEM_PROMPT,
      prompt,
      // "minimal" thinking: advice generation isn't a precision task like the
      // bean scanner's label extraction, so we trade a little reasoning depth
      // for noticeably lower latency.
      providerOptions: {
        google: { thinkingConfig: { thinkingLevel: "minimal" } },
      },
    })

    const advice = text.trim()
    if (!advice) {
      return {
        ok: false,
        error: ai.emptyAdvice,
        remaining,
      }
    }

    await db
      .insert(brewAdvice)
      .values({ brewId, advice, model: MODEL })
      .onConflictDoUpdate({
        target: brewAdvice.brewId,
        set: { advice, model: MODEL, createdAt: new Date() },
      })

    return { ok: true, advice, remaining }
  } catch (error) {
    console.error("[askBrewMaster] generateText failed", error)
    return {
      ok: false,
      error: ai.unavailable,
      remaining,
    }
  }
}
