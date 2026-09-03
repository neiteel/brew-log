"use server"

import type { Messages } from "@/lib/i18n"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { beans, brewAdvice, brews } from "@/lib/db/schema"
import { getDictionary } from "@/lib/i18n"
import { fill } from "@/lib/i18n/config"
import { countBrews, MAX_BREWS_PER_USER } from "@/lib/limits"
import { requireSession } from "@/lib/session"

export type BrewFormState = {
  // Field-level errors keyed by input `name`; `formError` is for whole-form
  // problems (e.g. the bean or brew not being found).
  fieldErrors: Record<string, string> | null
  formError: string | null
}

const optionalNumber = (schema: z.ZodType<number>) =>
  z.preprocess((value) => {
    // Absent fields (a conditionally-rendered input that wasn't shown) arrive as
    // undefined; empty inputs arrive as "". Both mean "not provided" → null.
    if (value == null) return null
    const trimmed = String(value).trim()
    return trimmed === "" ? null : Number(trimmed)
  }, schema.nullable())

// Built per request so the messages come back in the viewer's language. The
// text columns are unbounded `text` in Postgres; the caps have to be here or a
// single paste lands 100 KB in a field every layout renders.
function buildBrewSchema(v: Messages["validation"], taste: Messages["taste"]) {
  const optionalText = z
    .string()
    .trim()
    .max(300, v.textTooLong)
    .transform((value) => (value === "" ? null : value))

  const scale = (field: string) =>
    optionalNumber(
      z
        .number(fill(v.scaleNumber, { field }))
        .int()
        .min(0, fill(v.scaleRange, { field }))
        .max(10, fill(v.scaleRange, { field })),
    )

  return z.object({
    beanId: z.string().min(1, v.pickBean),
    method: z
      .string()
      .trim()
      .min(1, v.methodRequired)
      .max(120, v.methodTooLong),
    grinder: optionalText,
    grindSetting: optionalText,
    coffeeG: optionalNumber(z.number(v.doseNumber).positive(v.dosePositive)),
    waterG: optionalNumber(z.number(v.waterNumber).positive(v.waterPositive)),
    temperatureC: optionalNumber(
      z
        .number(v.temperatureNumber)
        .min(0, v.temperatureRange)
        .max(100, v.temperatureRange),
    ),
    // Accepts "2:25" or plain seconds.
    timeSeconds: z.preprocess((value) => {
      if (typeof value !== "string" || value.trim() === "") return null
      const raw = value.trim()
      const clock = raw.match(/^(\d+):([0-5]?\d)$/)
      if (clock) return Number(clock[1]) * 60 + Number(clock[2])
      if (/^\d+$/.test(raw)) return Number(raw)
      return raw
    }, z.number(v.timeFormat).int().positive().nullable()),
    brewWeightG: optionalNumber(
      z.number(v.yieldNumber).positive(v.yieldPositive),
    ),
    tds: optionalNumber(
      z.number(v.tdsNumber).min(0, v.tdsRange).max(100, v.tdsRange),
    ),
    extractionYield: optionalNumber(
      z
        .number(v.extractionNumber)
        .min(0, v.extractionRange)
        .max(100, v.extractionRange),
    ),
    rating: scale(taste.rating),
    tasteAroma: scale(taste.aroma),
    tasteSweetness: scale(taste.sweetness),
    tasteAcidity: scale(taste.acidity),
    tasteBitterness: scale(taste.bitterness),
    tasteBody: scale(taste.body),
    notes: z
      .string()
      .trim()
      .max(4000, v.notesTooLong)
      .transform((value) => (value === "" ? null : value)),
    isPublic: z.preprocess((value) => value === "Public", z.boolean()),
    brewedAt: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.iso.date(v.brewDateInvalid).nullable(),
    ),
  })
}

// Collapse Zod's per-field arrays to the first message per field.
function fieldErrors(error: z.ZodError): Record<string, string> {
  const flattened = z.flattenError(error).fieldErrors as Record<
    string,
    string[] | undefined
  >
  return Object.fromEntries(
    Object.entries(flattened).flatMap(([key, messages]) =>
      messages?.[0] ? [[key, messages[0]] as const] : [],
    ),
  )
}

async function parseAndAuthorize(formData: FormData) {
  const session = await requireSession()
  const { validation, taste } = await getDictionary()

  const parsed = buildBrewSchema(validation, taste).safeParse(
    Object.fromEntries(formData),
  )
  if (!parsed.success) {
    return {
      ok: false as const,
      fieldErrors: fieldErrors(parsed.error),
      formError: null,
    }
  }

  const bean = await db.query.beans.findFirst({
    columns: { id: true },
    where: and(
      eq(beans.id, parsed.data.beanId),
      eq(beans.userId, session.user.id),
    ),
  })
  if (!bean)
    return {
      ok: false as const,
      fieldErrors: null,
      formError: validation.beanNotFound,
    }

  const { brewedAt, ...rest } = parsed.data
  return {
    ok: true as const,
    session,
    validation,
    values: {
      ...rest,
      // noon avoids the date sliding a day across timezones
      brewedAt: brewedAt ? new Date(`${brewedAt}T12:00:00`) : undefined,
    },
  }
}

export async function createBrew(
  _prev: BrewFormState,
  formData: FormData,
): Promise<BrewFormState> {
  const result = await parseAndAuthorize(formData)
  if (!result.ok)
    return { fieldErrors: result.fieldErrors, formError: result.formError }

  if ((await countBrews(result.session.user.id)) >= MAX_BREWS_PER_USER)
    return {
      fieldErrors: null,
      formError: fill(result.validation.brewLimit, {
        max: MAX_BREWS_PER_USER,
      }),
    }

  const [brew] = await db
    .insert(brews)
    .values({ ...result.values, userId: result.session.user.id })
    .returning({ id: brews.id })

  revalidatePath("/journal")
  revalidatePath(`/beans/${result.values.beanId}`)
  redirect(`/brews/${brew.id}`)
}

export async function updateBrew(
  brewId: string,
  _prev: BrewFormState,
  formData: FormData,
): Promise<BrewFormState> {
  const result = await parseAndAuthorize(formData)
  if (!result.ok)
    return { fieldErrors: result.fieldErrors, formError: result.formError }

  const updated = await db
    .update(brews)
    .set(result.values)
    .where(and(eq(brews.id, brewId), eq(brews.userId, result.session.user.id)))
    .returning({ id: brews.id })

  if (updated.length === 0)
    return { fieldErrors: null, formError: result.validation.brewNotFound }

  // Editing the recipe/scores invalidates any cached Brew Master advice — it
  // was generated for the old numbers. Drop it so the next ask regenerates.
  await db.delete(brewAdvice).where(eq(brewAdvice.brewId, brewId))

  revalidatePath("/journal")
  revalidatePath(`/beans/${result.values.beanId}`)
  revalidatePath(`/brews/${brewId}`)
  redirect(`/brews/${brewId}`)
}

export async function deleteBrew(brewId: string) {
  const session = await requireSession()

  await db
    .delete(brews)
    .where(and(eq(brews.id, brewId), eq(brews.userId, session.user.id)))

  revalidatePath("/journal")
  redirect("/journal")
}
