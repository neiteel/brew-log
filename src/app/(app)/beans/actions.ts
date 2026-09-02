"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { beans } from "@/lib/db/schema"
import { countBeans, MAX_BEANS_PER_USER } from "@/lib/limits"
import { requireSession } from "@/lib/session"

export type BeanFormState = {
  // Field-level errors keyed by input `name`, so each field can show its own
  // inline message; `formError` is for whole-form problems (e.g. not found).
  fieldErrors: Record<string, string> | null
  formError: string | null
}

// Every text column is an unbounded `text` in Postgres, so the length cap has
// to live here: without it one paste puts a 100 KB "name" into every layout
// that renders it. Sized to the longest plausible real answer, not to the
// widest thing that still fits.
const optionalText = z
  .string()
  .trim()
  .max(300, "Keep this under 300 characters.")
  .transform((value) => (value === "" ? null : value))

const longText = z
  .string()
  .trim()
  .max(4000, "Keep this under 4,000 characters.")
  .transform((value) => (value === "" ? null : value))

const optionalNumber = (schema: z.ZodType<number>) =>
  z.preprocess((value) => {
    if (value == null) return null
    const trimmed = String(value).trim()
    return trimmed === "" ? null : Number(trimmed)
  }, schema.nullable())

const beanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(120, "Name must be 120 characters or fewer."),
  roastery: z
    .string()
    .trim()
    .min(1, "Roastery is required.")
    .max(120, "Roastery must be 120 characters or fewer."),
  roasteryCountry: optionalText,
  originCountry: optionalText,
  region: optionalText,
  altitude: optionalText,
  varietals: optionalText,
  process: optionalText,
  roastLevel: optionalText,
  roastDate: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? null : value,
    z.iso.date("Roast date must be a valid date.").nullable(),
  ),
  flavorNotes: optionalText,
  cuppingScore: optionalNumber(
    z
      .number("Cupping score must be a number.")
      .min(0, "Cupping score must be between 0 and 100.")
      .max(100, "Cupping score must be between 0 and 100."),
  ),
  price: optionalText,
  weightG: optionalNumber(
    z
      .number("Weight must be a number.")
      .int("Weight must be a whole number of grams.")
      .positive("Weight must be greater than 0 grams."),
  ),
  // `z.url()` alone accepts any scheme `new URL()` parses — `javascript:` and
  // `data:` included — and this value is rendered as a real href on the bean
  // page. Restrict it to the two schemes a shop link can legitimately use.
  productUrl: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? null : value,
    z
      .url({
        protocol: /^https?$/,
        error: "Product URL must start with http:// or https://.",
      })
      .max(2000, "Product URL is too long.")
      .nullable(),
  ),
  moreInfo: longText,
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

export async function createBean(
  _prev: BeanFormState,
  formData: FormData,
): Promise<BeanFormState> {
  const session = await requireSession()

  const parsed = beanSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success)
    return { fieldErrors: fieldErrors(parsed.error), formError: null }

  if ((await countBeans(session.user.id)) >= MAX_BEANS_PER_USER)
    return {
      fieldErrors: null,
      formError: `You've reached the limit of ${MAX_BEANS_PER_USER} beans. Delete one to add another.`,
    }

  const [bean] = await db
    .insert(beans)
    .values({ ...parsed.data, userId: session.user.id })
    .returning({ id: beans.id })

  revalidatePath("/journal")
  redirect(`/beans/${bean.id}`)
}

export async function updateBean(
  beanId: string,
  _prev: BeanFormState,
  formData: FormData,
): Promise<BeanFormState> {
  const session = await requireSession()

  const parsed = beanSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success)
    return { fieldErrors: fieldErrors(parsed.error), formError: null }

  const updated = await db
    .update(beans)
    .set(parsed.data)
    .where(and(eq(beans.id, beanId), eq(beans.userId, session.user.id)))
    .returning({ id: beans.id })

  if (updated.length === 0)
    return { fieldErrors: null, formError: "Bean not found." }

  revalidatePath("/journal")
  revalidatePath(`/beans/${beanId}`)
  redirect(`/beans/${beanId}`)
}

export async function deleteBean(beanId: string) {
  const session = await requireSession()

  await db
    .delete(beans)
    .where(and(eq(beans.id, beanId), eq(beans.userId, session.user.id)))

  revalidatePath("/journal")
  redirect("/journal")
}
