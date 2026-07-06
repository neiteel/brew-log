"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { beans, brewAdvice, brews } from "@/lib/db/schema"
import { requireSession } from "@/lib/session"

export type BrewFormState = {
  // Field-level errors keyed by input `name`; `formError` is for whole-form
  // problems (e.g. the bean or brew not being found).
  fieldErrors: Record<string, string> | null
  formError: string | null
}

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))

const optionalNumber = (schema: z.ZodType<number>) =>
  z.preprocess((value) => {
    // Absent fields (a conditionally-rendered input that wasn't shown) arrive as
    // undefined; empty inputs arrive as "". Both mean "not provided" → null.
    if (value == null) return null
    const trimmed = String(value).trim()
    return trimmed === "" ? null : Number(trimmed)
  }, schema.nullable())

const scale = (label: string) =>
  optionalNumber(
    z
      .number(`${label} must be a number.`)
      .int()
      .min(0, `${label} must be 0–10.`)
      .max(10, `${label} must be 0–10.`),
  )

// Accepts "2:25" or plain seconds.
const timeField = z.preprocess((value) => {
  if (typeof value !== "string" || value.trim() === "") return null
  const raw = value.trim()
  const clock = raw.match(/^(\d+):([0-5]?\d)$/)
  if (clock) return Number(clock[1]) * 60 + Number(clock[2])
  if (/^\d+$/.test(raw)) return Number(raw)
  return raw
}, z.number("Time must look like 2:25 (or seconds).").int().positive().nullable())

const brewSchema = z.object({
  beanId: z.string().min(1, "Pick a bean."),
  method: z.string().trim().min(1, "Method is required."),
  grinder: optionalText,
  grindSetting: optionalText,
  coffeeG: optionalNumber(
    z
      .number("Dose must be a number.")
      .positive("Dose must be greater than 0 g."),
  ),
  waterG: optionalNumber(
    z
      .number("Water must be a number.")
      .positive("Water must be greater than 0 g."),
  ),
  temperatureC: optionalNumber(
    z
      .number("Temperature must be a number.")
      .min(0, "Temperature must be between 0 and 100 °C.")
      .max(100, "Temperature must be between 0 and 100 °C."),
  ),
  timeSeconds: timeField,
  brewWeightG: optionalNumber(
    z
      .number("Yield must be a number.")
      .positive("Yield must be greater than 0 g."),
  ),
  tds: optionalNumber(
    z
      .number("TDS must be a number.")
      .min(0, "TDS must be between 0 and 100%.")
      .max(100, "TDS must be between 0 and 100%."),
  ),
  extractionYield: optionalNumber(
    z
      .number("Extraction yield must be a number.")
      .min(0, "Extraction yield must be between 0 and 100%.")
      .max(100, "Extraction yield must be between 0 and 100%."),
  ),
  rating: scale("Rating"),
  tasteAroma: scale("Aroma"),
  tasteSweetness: scale("Sweetness"),
  tasteAcidity: scale("Acidity"),
  tasteBitterness: scale("Bitterness"),
  tasteBody: scale("Body"),
  notes: optionalText,
  isPublic: z.preprocess((value) => value === "Public", z.boolean()),
  brewedAt: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? null : value,
    z.iso.date("Brew date must be a valid date.").nullable(),
  ),
})

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

  const parsed = brewSchema.safeParse(Object.fromEntries(formData))
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
      formError: "Bean not found.",
    }

  const { brewedAt, ...rest } = parsed.data
  return {
    ok: true as const,
    session,
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
    return { fieldErrors: null, formError: "Brew not found." }

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
