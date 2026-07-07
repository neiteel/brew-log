"use server"

import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { and, eq, sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { beanScanUsage } from "@/lib/db/schema"
import { requireSession } from "@/lib/session"

// How many photo scans a single user may run per (UTC) month. Keeps token
// spend bounded without reaching for Redis — the counter lives in
// `bean_scan_usage`.
const MONTHLY_SCAN_LIMIT = 10

// Reject anything that clearly wasn't run through the client-side compressor
// (longest edge ~1568px, JPEG q0.8 → typically well under 1 MB of base64).
const MAX_IMAGE_BASE64_LENGTH = 8_000_000 // ~6 MB decoded

const ROAST_LEVELS = [
  "Light",
  "Medium-Light",
  "Medium",
  "Medium-Dark",
  "Dark",
] as const

// The fields we ask the model to read off a coffee bag. Every field is
// nullable: the model is instructed to return null rather than guess when a
// value isn't legible on the label. This is deliberately looser than the
// form's own `beanSchema` (which requires name/roastery) — this is a prefill,
// not a save, so the human still reviews and completes it.
const scanFieldsSchema = z.object({
  name: z
    .string()
    .nullable()
    .describe("The coffee's name or lot title, e.g. 'Ibis' or 'El Paraiso'."),
  roastery: z
    .string()
    .nullable()
    .describe("The roaster / brand that produced the bag."),
  roasteryCountry: z
    .string()
    .nullable()
    .describe("Country the roaster is based in, if shown."),
  originCountry: z
    .string()
    .nullable()
    .describe("Country the coffee was grown in."),
  region: z.string().nullable().describe("Growing region, farm, or estate."),
  altitude: z
    .string()
    .nullable()
    .describe(
      "Growing altitude as printed, e.g. '1,150–1,250 m' or '1800 masl'.",
    ),
  varietals: z
    .string()
    .nullable()
    .describe(
      "Coffee varietals, comma-separated, e.g. 'Red Catuaí, Yellow Catuaí'.",
    ),
  process: z
    .string()
    .nullable()
    .describe(
      "Processing method, e.g. 'Washed', 'Natural', 'Honey', 'Anaerobic'.",
    ),
  roastLevel: z
    .enum(ROAST_LEVELS)
    .nullable()
    .describe("Roast level, mapped to the closest of the listed options."),
  roastDate: z
    .string()
    .nullable()
    .describe("Roast date in strict 'YYYY-MM-DD' format if a date is printed."),
  flavorNotes: z
    .string()
    .nullable()
    .describe(
      "Tasting / flavour notes as printed, comma-separated, e.g. 'Almond, Raisins, Strawberries'. Capture these carefully — they matter.",
    ),
  cuppingScore: z
    .number()
    .nullable()
    .describe("Cupping / SCA score between 0 and 100 if printed, e.g. 86.5."),
  weightG: z
    .number()
    .int()
    .nullable()
    .describe("Net weight in grams, e.g. 225 for '225 g' or 250 for '250g'."),
})

export type BeanScanFields = z.infer<typeof scanFieldsSchema>

export type ScanQuota = { used: number; remaining: number; limit: number }

export type ScanBeanResult =
  | { ok: true; fields: BeanScanFields; remaining: number }
  | { ok: false; error: string; remaining: number }

// First day of the current UTC month, "YYYY-MM-01" — the granularity of the
// monthly cap.
function currentPeriod() {
  return `${new Date().toISOString().slice(0, 7)}-01`
}

// This month's scan quota for the signed-in user. Read by the New Bean page so
// the scanner can show remaining scans before the first attempt.
export async function getBeanScanQuota(): Promise<ScanQuota> {
  const session = await requireSession()
  const [usage] = await db
    .select({ count: beanScanUsage.count })
    .from(beanScanUsage)
    .where(
      and(
        eq(beanScanUsage.userId, session.user.id),
        eq(beanScanUsage.period, currentPeriod()),
      ),
    )
  const used = usage?.count ?? 0
  return {
    used,
    remaining: Math.max(0, MONTHLY_SCAN_LIMIT - used),
    limit: MONTHLY_SCAN_LIMIT,
  }
}

const SYSTEM_PROMPT = `You are a data-entry assistant for a coffee journal. You are given a photo of a bag of roasted coffee beans. Read the label and extract the structured fields.

Rules:
- Only report what is actually legible on the packaging. If a field is not clearly present, return null for it. Never guess, infer, or invent values.
- Do not translate values; keep names, regions and varietals as printed (transliterate to Latin script only if the label itself gives one).
- flavorNotes are important: capture the roaster's stated tasting notes verbatim, comma-separated.
- roastLevel must be mapped to the closest of: Light, Medium-Light, Medium, Medium-Dark, Dark. If the roast level is not indicated, return null.
- roastDate must be strict YYYY-MM-DD, or null.
- weightG and cuppingScore must be plain numbers with no units.`

export async function scanBeanPhoto(input: {
  image: string // base64-encoded JPEG, no data URL prefix
  mediaType: string
}): Promise<ScanBeanResult> {
  const session = await requireSession()

  // Gate the model behind a verified email. Anonymous scripts can register
  // accounts freely, but each would need a real, reachable inbox to spend the
  // AI quota — which raises the cost of farming free scans considerably.
  if (!session.user.emailVerified) {
    const { remaining } = await getBeanScanQuota()
    return {
      ok: false,
      error: "Please verify your email address to use AI scanning.",
      remaining,
    }
  }

  const { image, mediaType } = input
  const period = currentPeriod()
  if (!image || typeof image !== "string" || !mediaType?.startsWith("image/")) {
    const { remaining } = await getBeanScanQuota()
    return {
      ok: false,
      error: "Please upload a photo of the coffee bag.",
      remaining,
    }
  }
  if (image.length > MAX_IMAGE_BASE64_LENGTH) {
    const { remaining } = await getBeanScanQuota()
    return {
      ok: false,
      error: "That image is too large. Try again.",
      remaining,
    }
  }

  // Rate limit: one row per user per UTC month, checked before we spend a token.
  const [usage] = await db
    .select({ count: beanScanUsage.count })
    .from(beanScanUsage)
    .where(
      and(
        eq(beanScanUsage.userId, session.user.id),
        eq(beanScanUsage.period, period),
      ),
    )

  if ((usage?.count ?? 0) >= MONTHLY_SCAN_LIMIT) {
    return {
      ok: false,
      error: `Monthly scan limit reached (${MONTHLY_SCAN_LIMIT}/month). Enter the bean details manually, or try again next month.`,
      remaining: 0,
    }
  }

  // Reserve the slot up front so a failed generation still counts against the
  // quota — that's the point of the cap (throttle model calls, not saves).
  // The returned count is the new value, so remaining is derived from it.
  const [updated] = await db
    .insert(beanScanUsage)
    .values({ userId: session.user.id, period, count: 1 })
    .onConflictDoUpdate({
      target: [beanScanUsage.userId, beanScanUsage.period],
      set: { count: sql`${beanScanUsage.count} + 1` },
    })
    .returning({ count: beanScanUsage.count })
  const remaining = Math.max(0, MONTHLY_SCAN_LIMIT - (updated?.count ?? 0))

  try {
    const { object } = await generateObject({
      model: google("gemini-3.5-flash"),
      schema: scanFieldsSchema,
      system: SYSTEM_PROMPT,
      // "low" thinking: ~2.5x faster than the default with no measured accuracy
      // loss on label extraction; "minimal" started inferring off-label values.
      providerOptions: {
        google: { thinkingConfig: { thinkingLevel: "low" } },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the coffee bean details from this bag photo.",
            },
            { type: "file", mediaType, data: image },
          ],
        },
      ],
    })

    return { ok: true, fields: object, remaining }
  } catch (error) {
    console.error("[scanBeanPhoto] generateObject failed", error)
    return {
      ok: false,
      error:
        "Couldn't read that photo. Try a clearer, well-lit shot of the label.",
      remaining,
    }
  }
}
