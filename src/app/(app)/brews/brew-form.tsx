"use client"

import type { brews } from "@/lib/db/schema"
import type { Messages } from "@/lib/i18n"
import type { Route } from "next"
import type { BrewFormState } from "./actions"

import { useActionState, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/button"
import { Section } from "@/components/field"
import { ScaleInput } from "@/components/scale-input"
import {
  RadioField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/text-input"
import { formatRatio, formatTime, isEspresso } from "@/lib/format"
import { fill } from "@/lib/i18n/config"

const METHODS = [
  "V60",
  "Kalita Wave",
  "Chemex",
  "AeroPress",
  "French Press",
  "Clever Dripper",
  "Origami",
  "Moka Pot",
  "Espresso",
  "Cold Brew",
  "Other",
]

const GRINDERS = [
  "Comandante",
  "1Zpresso",
  "Timemore",
  "Fellow Ode",
  "Baratza",
  "Mahlkönig",
]

type Brew = typeof brews.$inferSelect

type BeanOption = { id: string; name: string; roastery: string }

function BrewForm<T extends string>({
  action,
  brew,
  beanOptions,
  defaultBeanId,
  defaultDate,
  cancelHref,
  submitLabel,
  t,
  taste,
}: {
  action: (prev: BrewFormState, formData: FormData) => Promise<BrewFormState>
  brew?: Brew
  beanOptions: BeanOption[]
  defaultBeanId?: string
  defaultDate: string
  cancelHref: Route<T>
  /** Overrides the default edit/create wording — a prefilled brew is still new. */
  submitLabel?: string
  /** Only the form + taste slices — the strings this form actually renders. */
  t: Messages["form"]
  taste: Messages["taste"]
}) {
  const [state, formAction, pending] = useActionState(action, {
    fieldErrors: null,
    formError: null,
  })
  const fieldError = (name: string) => state.fieldErrors?.[name]

  const initialMethod = brew?.method ?? "V60"
  const isPreset = METHODS.includes(initialMethod)
  const [methodChoice, setMethodChoice] = useState(
    isPreset ? initialMethod : "Other",
  )
  const [customMethod, setCustomMethod] = useState(
    isPreset ? "" : initialMethod,
  )

  const [dose, setDose] = useState(brew?.coffeeG?.toString() ?? "")
  const [water, setWater] = useState(brew?.waterG?.toString() ?? "")
  const [brewWeight, setBrewWeight] = useState(
    brew?.brewWeightG?.toString() ?? "",
  )
  const [tds, setTds] = useState(brew?.tds?.toString() ?? "")

  const method = methodChoice === "Other" ? customMethod : methodChoice
  const espresso = isEspresso(method)

  const doseN = Number(dose) || 0
  const outN = espresso ? Number(brewWeight) || 0 : Number(water) || 0
  const liveRatio = formatRatio(doseN, outN)
  const computedEy =
    espresso && doseN && Number(brewWeight) && Number(tds)
      ? ((Number(brewWeight) * Number(tds)) / doseN).toFixed(1)
      : null

  return (
    <form action={formAction} className="space-y-10 md:space-y-12">
      <Section label={t.sectionBrew}>
        <SelectField
          label={t.bean}
          name="beanId"
          defaultValue={brew?.beanId ?? defaultBeanId ?? ""}
          required
          error={fieldError("beanId")}
          className="md:col-span-6"
        >
          <option value="">{t.pickBean}</option>
          {beanOptions.map((bean) => (
            <option key={bean.id} value={bean.id}>
              {bean.name} — {bean.roastery}
            </option>
          ))}
        </SelectField>
        <TextField
          label={t.date}
          name="brewedAt"
          type="date"
          defaultValue={
            brew ? brew.brewedAt.toISOString().slice(0, 10) : defaultDate
          }
          error={fieldError("brewedAt")}
          className="md:col-span-6"
        />
        <RadioField
          label={t.method}
          name="methodChoice"
          options={METHODS}
          value={methodChoice}
          onValueChange={setMethodChoice}
          className="md:col-span-12"
        />
        {methodChoice === "Other" ? (
          <TextField
            label={t.customMethod}
            name="method"
            value={customMethod}
            onChange={(event) => setCustomMethod(event.target.value)}
            placeholder="Siphon"
            required
            error={fieldError("method")}
            className="md:col-span-6"
          />
        ) : (
          <input type="hidden" name="method" value={methodChoice} />
        )}
      </Section>

      <Section label={t.sectionRecipe}>
        <TextField
          label={t.doseG}
          name="coffeeG"
          inputMode="decimal"
          value={dose}
          onChange={(event) => setDose(event.target.value)}
          placeholder="18"
          error={fieldError("coffeeG")}
          className="md:col-span-4"
        />
        {espresso ? (
          <TextField
            label={t.yieldG}
            name="brewWeightG"
            inputMode="decimal"
            value={brewWeight}
            onChange={(event) => setBrewWeight(event.target.value)}
            placeholder="40"
            error={fieldError("brewWeightG")}
            className="md:col-span-4"
          />
        ) : (
          <TextField
            label={t.waterG}
            name="waterG"
            inputMode="decimal"
            value={water}
            onChange={(event) => setWater(event.target.value)}
            placeholder="300"
            error={fieldError("waterG")}
            className="md:col-span-4"
          />
        )}
        <TextField
          label={t.temperatureC}
          name="temperatureC"
          inputMode="decimal"
          defaultValue={brew?.temperatureC ?? ""}
          placeholder="94"
          hint={t.temperatureHint}
          error={fieldError("temperatureC")}
          className="md:col-span-4"
        />
        <TextField
          label={t.time}
          name="timeSeconds"
          defaultValue={formatTime(brew?.timeSeconds) ?? ""}
          placeholder="2:25"
          hint={t.timeHint}
          error={fieldError("timeSeconds")}
          className="md:col-span-4"
        />
        {espresso ? (
          <>
            <TextField
              label={t.tdsPct}
              name="tds"
              inputMode="decimal"
              value={tds}
              onChange={(event) => setTds(event.target.value)}
              placeholder="10.25"
              hint={t.tdsHint}
              error={fieldError("tds")}
              className="md:col-span-4"
            />
            <TextField
              label={t.extractionYieldPct}
              name="extractionYield"
              inputMode="decimal"
              defaultValue={brew?.extractionYield ?? ""}
              placeholder={computedEy ?? "20.5"}
              hint={
                computedEy
                  ? fill(t.extractionAutoHint, { value: computedEy })
                  : t.extractionHint
              }
              error={fieldError("extractionYield")}
              className="md:col-span-4"
            />
          </>
        ) : null}
        <TextField
          label={t.grinder}
          name="grinder"
          defaultValue={brew?.grinder ?? ""}
          placeholder="Comandante"
          options={GRINDERS}
          className="md:col-span-4"
        />
        <TextField
          label={t.grindSetting}
          name="grindSetting"
          defaultValue={brew?.grindSetting ?? ""}
          placeholder="26 clicks"
          className="md:col-span-4"
        />
        <p className="text-body text-muted-foreground md:col-span-12">
          {liveRatio
            ? fill(t.liveRatio, { value: liveRatio })
            : t.liveRatioEmpty}
          {computedEy ? fill(t.liveExtraction, { value: computedEy }) : ""}
        </p>
      </Section>

      <Section label={taste.heading}>
        <div className="md:col-span-12">
          <ScaleInput
            label={taste.rating}
            name="rating"
            defaultValue={brew?.rating}
          />
          <ScaleInput
            label={taste.aroma}
            name="tasteAroma"
            defaultValue={brew?.tasteAroma}
          />
          <ScaleInput
            label={taste.sweetness}
            name="tasteSweetness"
            defaultValue={brew?.tasteSweetness}
          />
          <ScaleInput
            label={taste.acidity}
            name="tasteAcidity"
            defaultValue={brew?.tasteAcidity}
          />
          <ScaleInput
            label={taste.bitterness}
            name="tasteBitterness"
            defaultValue={brew?.tasteBitterness}
          />
          <ScaleInput
            label={taste.body}
            name="tasteBody"
            defaultValue={brew?.tasteBody}
          />
        </div>
        <TextAreaField
          label={taste.notes}
          name="notes"
          defaultValue={brew?.notes ?? ""}
          placeholder="How did it taste? What would you change?"
          className="md:col-span-12"
        />
      </Section>

      <Section label={t.sectionVisibility}>
        <div className="md:col-span-12">
          <RadioField
            label={t.whoCanSee}
            name="isPublic"
            options={["Private", "Public"]}
            defaultValue={
              brew ? (brew.isPublic ? "Public" : "Private") : "Private"
            }
          />
          <p className="text-small text-muted-foreground mt-2">
            {t.visibilityHint}
          </p>
        </div>
      </Section>

      {state.formError ? (
        <p role="alert" className="text-body text-destructive">
          {state.formError}
        </p>
      ) : state.fieldErrors ? (
        <p role="alert" className="text-body text-destructive">
          {t.fixErrors}
        </p>
      ) : null}
      <div className="text-body flex items-center gap-8">
        <Button type="submit" disabled={pending}>
          {pending
            ? t.saving
            : (submitLabel ?? (brew ? t.saveChanges : t.saveBrew))}
        </Button>
        <Link
          href={cancelHref}
          className="text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          {t.cancel}
        </Link>
      </div>
    </form>
  )
}

export { BrewForm }
