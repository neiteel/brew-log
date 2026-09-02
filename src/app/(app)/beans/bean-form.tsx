"use client"

import type { beans } from "@/lib/db/schema"
import type { Messages } from "@/lib/i18n"
import type { Route } from "next"
import type { BeanFormState } from "./actions"
import type { BeanScanFields } from "./scan"

import { useActionState } from "react"
import Link from "next/link"

import { Button } from "@/components/button"
import { Section } from "@/components/field"
import { RadioField, TextAreaField, TextField } from "@/components/text-input"

const ROAST_LEVELS = [
  "Light",
  "Medium-Light",
  "Medium",
  "Medium-Dark",
  "Dark",
  "Unknown",
]

// Type-or-pick suggestions (free text still allowed). Common coffee processes…
const PROCESSES = [
  "Washed",
  "Natural",
  "Honey",
  "White Honey",
  "Yellow Honey",
  "Red Honey",
  "Black Honey",
  "Pulped Natural",
  "Anaerobic Natural",
  "Anaerobic Washed",
  "Carbonic Maceration",
  "Wet-Hulled",
  "Experimental",
]

// …and coffee-growing origins alongside common roastery countries.
const COUNTRIES = [
  "Ethiopia",
  "Kenya",
  "Colombia",
  "Brazil",
  "Guatemala",
  "Costa Rica",
  "Panama",
  "Honduras",
  "El Salvador",
  "Nicaragua",
  "Mexico",
  "Peru",
  "Bolivia",
  "Ecuador",
  "Rwanda",
  "Burundi",
  "Tanzania",
  "Uganda",
  "Democratic Republic of the Congo",
  "Yemen",
  "India",
  "Indonesia",
  "Papua New Guinea",
  "Vietnam",
  "China",
  "Thailand",
  "Myanmar",
  "Laos",
  "Philippines",
  "Jamaica",
  "Dominican Republic",
  "Cuba",
  "Zambia",
  "Malawi",
  "United Kingdom",
  "United States",
  "Canada",
  "Japan",
  "South Korea",
  "Taiwan",
  "Hong Kong",
  "Singapore",
  "Australia",
  "New Zealand",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Portugal",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Ireland",
  "Sweden",
  "Norway",
  "Denmark",
]

type Bean = typeof beans.$inferSelect

// Values read off a scanned bag photo, used to pre-fill an empty form. Inputs
// are uncontrolled, so the parent remounts this form (via `key`) when a new
// scan arrives to refresh the `defaultValue`s.
function BeanForm<T extends string>({
  action,
  bean,
  prefill,
  cancelHref,
  t,
}: {
  action: (prev: BeanFormState, formData: FormData) => Promise<BeanFormState>
  bean?: Bean
  prefill?: BeanScanFields | null
  cancelHref: Route<T>
  /** Only the form slice — the strings this form actually renders. */
  t: Messages["form"]
}) {
  const [state, formAction, pending] = useActionState(action, {
    fieldErrors: null,
    formError: null,
  })
  const fieldError = (name: string) => state.fieldErrors?.[name]

  // Prefer a scanned value, then an existing bean's value, then empty. Numbers
  // are coerced to strings for the text inputs.
  const initial = (key: keyof BeanScanFields) =>
    prefill?.[key] ?? bean?.[key] ?? ""

  return (
    <form action={formAction} className="space-y-10 md:space-y-12">
      <Section label={t.sectionIdentity}>
        <TextField
          label={t.name}
          name="name"
          defaultValue={initial("name")}
          placeholder="Ibis"
          required
          error={fieldError("name")}
          className="md:col-span-4"
        />
        <TextField
          label={t.roastery}
          name="roastery"
          defaultValue={initial("roastery")}
          placeholder="Scarlett Coffee Roastery"
          required
          error={fieldError("roastery")}
          className="md:col-span-4"
        />
        <TextField
          label={t.roasterLocation}
          name="roasteryCountry"
          defaultValue={initial("roasteryCountry")}
          placeholder="United Kingdom"
          options={COUNTRIES}
          className="md:col-span-4"
        />
      </Section>

      <Section label={t.sectionOrigin}>
        <TextField
          label={t.origin}
          name="originCountry"
          defaultValue={initial("originCountry")}
          placeholder="Brazil"
          options={COUNTRIES}
          className="md:col-span-4"
        />
        <TextField
          label={t.region}
          name="region"
          defaultValue={initial("region")}
          placeholder="Sul de Minas"
          className="md:col-span-4"
        />
        <TextField
          label={t.altitude}
          name="altitude"
          defaultValue={initial("altitude")}
          placeholder="1,150–1,250 m"
          className="md:col-span-4"
        />
        <TextField
          label={t.varietals}
          name="varietals"
          defaultValue={initial("varietals")}
          placeholder="Red Catuaí, Yellow Catuaí"
          className="md:col-span-6"
        />
        <TextField
          label={t.process}
          name="process"
          defaultValue={initial("process")}
          placeholder="Natural"
          options={PROCESSES}
          className="md:col-span-6"
        />
      </Section>

      <Section label={t.sectionRoast}>
        <RadioField
          label={t.roastLevel}
          name="roastLevel"
          defaultValue={prefill?.roastLevel ?? bean?.roastLevel ?? "Light"}
          options={ROAST_LEVELS}
          className="md:col-span-12"
        />
        <TextField
          label={t.roastDate}
          name="roastDate"
          type="date"
          defaultValue={initial("roastDate")}
          error={fieldError("roastDate")}
          className="md:col-span-4"
        />
        <TextField
          label={t.cuppingScore}
          name="cuppingScore"
          inputMode="decimal"
          defaultValue={initial("cuppingScore")}
          placeholder="86.5"
          hint={t.cuppingHint}
          error={fieldError("cuppingScore")}
          className="md:col-span-4"
        />
      </Section>

      <Section label={t.sectionPurchase}>
        <TextField
          label={t.price}
          name="price"
          defaultValue={bean?.price ?? ""}
          placeholder="£8.50 / 225 g"
          className="md:col-span-4"
        />
        <TextField
          label={t.weight}
          name="weightG"
          inputMode="numeric"
          defaultValue={initial("weightG")}
          placeholder="225"
          hint={t.weightHint}
          error={fieldError("weightG")}
          className="md:col-span-4"
        />
        <TextField
          label={t.productUrl}
          name="productUrl"
          inputMode="url"
          defaultValue={bean?.productUrl ?? ""}
          placeholder="https://…"
          error={fieldError("productUrl")}
          className="md:col-span-8"
        />
      </Section>

      <Section label={t.sectionNotes}>
        <TextAreaField
          label={t.flavorNotes}
          name="flavorNotes"
          defaultValue={initial("flavorNotes")}
          placeholder="Almond, Raisins, Strawberries"
          rows={2}
          className="md:col-span-12"
        />
        <TextAreaField
          label={t.moreInfo}
          name="moreInfo"
          defaultValue={bean?.moreInfo ?? ""}
          placeholder="Story, lot number, anything else."
          className="md:col-span-12"
        />
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
          {pending ? t.saving : bean ? t.saveChanges : t.saveBean}
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

export { BeanForm }
