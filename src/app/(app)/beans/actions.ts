"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { beans } from "@/lib/db/schema"
import { requireSession } from "@/lib/session"

export type BeanFormState = {
  // Field-level errors keyed by input `name`, so each field can show its own
  // inline message; `formError` is for whole-form problems (e.g. not found).
  fieldErrors: Record<string, string> | null
  formError: string | null
}

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))

const optionalNumber = (schema: z.ZodType<number>) =>
  z.preprocess((value) => {
    if (value == null) return null
    const trimmed = String(value).trim()
    return trimmed === "" ? null : Number(trimmed)
  }, schema.nullable())

const beanSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  roastery: z.string().trim().min(1, "Roastery is required."),
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
  productUrl: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? null : value,
    z.url("Product URL must be a valid URL.").nullable(),
  ),
  moreInfo: optionalText,
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
