"use server"

import type { Messages } from "@/lib/i18n"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { beans } from "@/lib/db/schema"
import { getDictionary } from "@/lib/i18n"
import { fill } from "@/lib/i18n/config"
import { countBeans, MAX_BEANS_PER_USER } from "@/lib/limits"
import { requireSession } from "@/lib/session"

export type BeanFormState = {
  // Field-level errors keyed by input `name`, so each field can show its own
  // inline message; `formError` is for whole-form problems (e.g. not found).
  fieldErrors: Record<string, string> | null
  formError: string | null
}

const optionalNumber = (schema: z.ZodType<number>) =>
  z.preprocess((value) => {
    if (value == null) return null
    const trimmed = String(value).trim()
    return trimmed === "" ? null : Number(trimmed)
  }, schema.nullable())

// Built per request so the messages come back in the viewer's language. Every
// text column is an unbounded `text` in Postgres, so the length cap has to live
// here: without it one paste puts a 100 KB "name" into every layout that
// renders it. Sized to the longest plausible real answer, not to the widest
// thing that still fits.
function buildBeanSchema(v: Messages["validation"]) {
  const optionalText = z
    .string()
    .trim()
    .max(300, v.textTooLong)
    .transform((value) => (value === "" ? null : value))

  const longText = z
    .string()
    .trim()
    .max(4000, v.longTextTooLong)
    .transform((value) => (value === "" ? null : value))

  return z.object({
    name: z.string().trim().min(1, v.nameRequired).max(120, v.nameTooLong),
    roastery: z
      .string()
      .trim()
      .min(1, v.roasteryRequired)
      .max(120, v.roasteryTooLong),
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
      z.iso.date(v.roastDateInvalid).nullable(),
    ),
    flavorNotes: optionalText,
    cuppingScore: optionalNumber(
      z.number(v.cuppingNumber).min(0, v.cuppingRange).max(100, v.cuppingRange),
    ),
    price: optionalText,
    weightG: optionalNumber(
      z.number(v.weightNumber).int(v.weightInteger).positive(v.weightPositive),
    ),
    // `z.url()` alone accepts any scheme `new URL()` parses — `javascript:` and
    // `data:` included — and this value is rendered as a real href on the bean
    // page. Restrict it to the two schemes a shop link can legitimately use.
    productUrl: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z
        .url({ protocol: /^https?$/, error: v.urlScheme })
        .max(2000, v.urlTooLong)
        .nullable(),
    ),
    moreInfo: longText,
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

export async function createBean(
  _prev: BeanFormState,
  formData: FormData,
): Promise<BeanFormState> {
  const session = await requireSession()
  const { validation } = await getDictionary()

  const parsed = buildBeanSchema(validation).safeParse(
    Object.fromEntries(formData),
  )
  if (!parsed.success)
    return { fieldErrors: fieldErrors(parsed.error), formError: null }

  if ((await countBeans(session.user.id)) >= MAX_BEANS_PER_USER)
    return {
      fieldErrors: null,
      formError: fill(validation.beanLimit, { max: MAX_BEANS_PER_USER }),
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
  const { validation } = await getDictionary()

  const parsed = buildBeanSchema(validation).safeParse(
    Object.fromEntries(formData),
  )
  if (!parsed.success)
    return { fieldErrors: fieldErrors(parsed.error), formError: null }

  const updated = await db
    .update(beans)
    .set(parsed.data)
    .where(and(eq(beans.id, beanId), eq(beans.userId, session.user.id)))
    .returning({ id: beans.id })

  if (updated.length === 0)
    return { fieldErrors: null, formError: validation.beanNotFound }

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
