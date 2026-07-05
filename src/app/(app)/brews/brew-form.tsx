"use client"

import type { brews } from "@/lib/db/schema"
import type { Route } from "next"
import type { BrewFormState } from "./actions"

import { useActionState, useState } from "react"
import Link from "next/link"

import { Section } from "@/components/field"
import { ScaleInput } from "@/components/scale-input"
import { TextButton } from "@/components/text-button"
import {
  RadioField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/text-input"
import { formatTime } from "@/lib/format"

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

function ratio(dose: number, out: number) {
  if (!dose || !out) return null
  const r = out / dose
  return `1:${r >= 3 ? r.toFixed(1) : r.toFixed(2)}`
}

function BrewForm<T extends string>({
  action,
  brew,
  beanOptions,
  defaultBeanId,
  defaultDate,
  cancelHref,
}: {
  action: (prev: BrewFormState, formData: FormData) => Promise<BrewFormState>
  brew?: Brew
  beanOptions: BeanOption[]
  defaultBeanId?: string
  defaultDate: string
  cancelHref: Route<T>
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
  const isEspresso = /espresso/i.test(method)

  const doseN = Number(dose) || 0
  const outN = isEspresso ? Number(brewWeight) || 0 : Number(water) || 0
  const liveRatio = ratio(doseN, outN)
  const computedEy =
    isEspresso && doseN && Number(brewWeight) && Number(tds)
      ? ((Number(brewWeight) * Number(tds)) / doseN).toFixed(1)
      : null

  return (
    <form action={formAction} className="space-y-10 md:space-y-12">
      <Section label="Brew">
        <SelectField
          label="Bean"
          name="beanId"
          defaultValue={brew?.beanId ?? defaultBeanId ?? ""}
          required
          error={fieldError("beanId")}
          className="md:col-span-6"
        >
          <option value="">— pick a bean</option>
          {beanOptions.map((bean) => (
            <option key={bean.id} value={bean.id}>
              {bean.name} — {bean.roastery}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Date"
          name="brewedAt"
          type="date"
          defaultValue={
            brew ? brew.brewedAt.toISOString().slice(0, 10) : defaultDate
          }
          error={fieldError("brewedAt")}
          className="md:col-span-6"
        />
        <RadioField
          label="Method"
          name="methodChoice"
          options={METHODS}
          value={methodChoice}
          onValueChange={setMethodChoice}
          className="md:col-span-12"
        />
        {methodChoice === "Other" ? (
          <TextField
            label="Custom method"
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

      <Section label="Recipe">
        <TextField
          label="Dose, g"
          name="coffeeG"
          inputMode="decimal"
          value={dose}
          onChange={(event) => setDose(event.target.value)}
          placeholder="18"
          error={fieldError("coffeeG")}
          className="md:col-span-4"
        />
        {isEspresso ? (
          <TextField
            label="Yield, g"
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
            label="Water, g"
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
          label="Temperature, °C"
          name="temperatureC"
          inputMode="decimal"
          defaultValue={brew?.temperatureC ?? ""}
          placeholder="94"
          hint="0–100"
          error={fieldError("temperatureC")}
          className="md:col-span-4"
        />
        <TextField
          label="Time"
          name="timeSeconds"
          defaultValue={formatTime(brew?.timeSeconds) ?? ""}
          placeholder="2:25"
          hint="mm:ss, or seconds"
          error={fieldError("timeSeconds")}
          className="md:col-span-4"
        />
        {isEspresso ? (
          <>
            <TextField
              label="TDS, %"
              name="tds"
              inputMode="decimal"
              value={tds}
              onChange={(event) => setTds(event.target.value)}
              placeholder="10.25"
              hint="typically 8–12"
              error={fieldError("tds")}
              className="md:col-span-4"
            />
            <TextField
              label="Extraction yield, %"
              name="extractionYield"
              inputMode="decimal"
              defaultValue={brew?.extractionYield ?? ""}
              placeholder={computedEy ?? "20.5"}
              hint={
                computedEy
                  ? `auto ~${computedEy} if left blank`
                  : "typically 18–22"
              }
              error={fieldError("extractionYield")}
              className="md:col-span-4"
            />
          </>
        ) : null}
        <TextField
          label="Grinder"
          name="grinder"
          defaultValue={brew?.grinder ?? ""}
          placeholder="Comandante"
          options={GRINDERS}
          className="md:col-span-4"
        />
        <TextField
          label="Grind setting"
          name="grindSetting"
          defaultValue={brew?.grindSetting ?? ""}
          placeholder="26 clicks"
          className="md:col-span-4"
        />
        <p className="text-body text-muted-foreground md:col-span-12">
          {liveRatio ? `Ratio ${liveRatio}` : "Ratio —"}
          {computedEy ? ` · Extraction ~${computedEy}%` : ""}
        </p>
      </Section>

      <Section label="Taste">
        <div className="md:col-span-12">
          <ScaleInput
            label="Rating"
            name="rating"
            defaultValue={brew?.rating}
          />
          <ScaleInput
            label="Aroma"
            name="tasteAroma"
            defaultValue={brew?.tasteAroma}
          />
          <ScaleInput
            label="Sweetness"
            name="tasteSweetness"
            defaultValue={brew?.tasteSweetness}
          />
          <ScaleInput
            label="Acidity"
            name="tasteAcidity"
            defaultValue={brew?.tasteAcidity}
          />
          <ScaleInput
            label="Bitterness"
            name="tasteBitterness"
            defaultValue={brew?.tasteBitterness}
          />
          <ScaleInput
            label="Body"
            name="tasteBody"
            defaultValue={brew?.tasteBody}
          />
        </div>
        <TextAreaField
          label="Notes"
          name="notes"
          defaultValue={brew?.notes ?? ""}
          placeholder="How did it taste? What would you change?"
          className="md:col-span-12"
        />
      </Section>

      <Section label="Visibility">
        <div className="md:col-span-12">
          <RadioField
            label="Who can see this brew"
            name="isPublic"
            options={["Private", "Public"]}
            defaultValue={
              brew ? (brew.isPublic ? "Public" : "Private") : "Private"
            }
          />
          <p className="text-small text-muted-foreground mt-2">
            Public brews appear on your page and in explore.
          </p>
        </div>
      </Section>

      {state.formError ? (
        <p className="text-body text-destructive">{state.formError}</p>
      ) : state.fieldErrors ? (
        <p className="text-body text-destructive">
          Please fix the highlighted fields.
        </p>
      ) : null}
      <div className="text-body flex items-center gap-8">
        <TextButton type="submit" disabled={pending}>
          {pending ? "Saving…" : brew ? "Save changes" : "Save brew"}
        </TextButton>
        <Link
          href={cancelHref}
          className="text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}

export { BrewForm }
