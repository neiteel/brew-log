"use client"

import type { beans } from "@/lib/db/schema"
import type { Route } from "next"
import type { BeanFormState } from "./actions"

import { useActionState } from "react"
import Link from "next/link"

import { Section } from "@/components/field"
import { TextButton } from "@/components/text-button"
import { RadioField, TextAreaField, TextField } from "@/components/text-input"

const ROAST_LEVELS = ["Light", "Medium-Light", "Medium", "Medium-Dark", "Dark"]

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

function BeanForm<T extends string>({
  action,
  bean,
  cancelHref,
}: {
  action: (prev: BeanFormState, formData: FormData) => Promise<BeanFormState>
  bean?: Bean
  cancelHref: Route<T>
}) {
  const [state, formAction, pending] = useActionState(action, {
    fieldErrors: null,
    formError: null,
  })
  const fieldError = (name: string) => state.fieldErrors?.[name]

  return (
    <form action={formAction} className="space-y-10 md:space-y-12">
      <Section label="Identity">
        <TextField
          label="Name"
          name="name"
          defaultValue={bean?.name}
          placeholder="Ibis"
          required
          error={fieldError("name")}
          className="md:col-span-4"
        />
        <TextField
          label="Roastery"
          name="roastery"
          defaultValue={bean?.roastery}
          placeholder="Scarlett Coffee Roastery"
          required
          error={fieldError("roastery")}
          className="md:col-span-4"
        />
        <TextField
          label="Roaster location"
          name="roasteryCountry"
          defaultValue={bean?.roasteryCountry ?? ""}
          placeholder="United Kingdom"
          options={COUNTRIES}
          className="md:col-span-4"
        />
      </Section>

      <Section label="Origin">
        <TextField
          label="Origin"
          name="originCountry"
          defaultValue={bean?.originCountry ?? ""}
          placeholder="Brazil"
          options={COUNTRIES}
          className="md:col-span-4"
        />
        <TextField
          label="Region"
          name="region"
          defaultValue={bean?.region ?? ""}
          placeholder="Sul de Minas"
          className="md:col-span-4"
        />
        <TextField
          label="Altitude"
          name="altitude"
          defaultValue={bean?.altitude ?? ""}
          placeholder="1,150–1,250 m"
          className="md:col-span-4"
        />
        <TextField
          label="Varietals"
          name="varietals"
          defaultValue={bean?.varietals ?? ""}
          placeholder="Red Catuaí, Yellow Catuaí"
          className="md:col-span-6"
        />
        <TextField
          label="Process"
          name="process"
          defaultValue={bean?.process ?? ""}
          placeholder="Natural"
          options={PROCESSES}
          className="md:col-span-6"
        />
      </Section>

      <Section label="Roast">
        <RadioField
          label="Roast level"
          name="roastLevel"
          defaultValue={bean?.roastLevel}
          options={ROAST_LEVELS}
          className="md:col-span-12"
        />
        <TextField
          label="Roast date"
          name="roastDate"
          type="date"
          defaultValue={bean?.roastDate ?? ""}
          error={fieldError("roastDate")}
          className="md:col-span-4"
        />
        <TextField
          label="Cupping score"
          name="cuppingScore"
          inputMode="decimal"
          defaultValue={bean?.cuppingScore ?? ""}
          placeholder="86.5"
          hint="0–100"
          error={fieldError("cuppingScore")}
          className="md:col-span-4"
        />
      </Section>

      <Section label="Purchase">
        <TextField
          label="Price"
          name="price"
          defaultValue={bean?.price ?? ""}
          placeholder="£8.50 / 225 g"
          className="md:col-span-4"
        />
        <TextField
          label="Weight"
          name="weightG"
          inputMode="numeric"
          defaultValue={bean?.weightG ?? ""}
          placeholder="225"
          hint="grams"
          error={fieldError("weightG")}
          className="md:col-span-4"
        />
        <TextField
          label="Product URL"
          name="productUrl"
          inputMode="url"
          defaultValue={bean?.productUrl ?? ""}
          placeholder="https://…"
          error={fieldError("productUrl")}
          className="md:col-span-8"
        />
      </Section>

      <Section label="Notes">
        <TextAreaField
          label="Flavor notes"
          name="flavorNotes"
          defaultValue={bean?.flavorNotes ?? ""}
          placeholder="Almond, Raisins, Strawberries"
          rows={2}
          className="md:col-span-12"
        />
        <TextAreaField
          label="More info"
          name="moreInfo"
          defaultValue={bean?.moreInfo ?? ""}
          placeholder="Story, lot number, anything else."
          className="md:col-span-12"
        />
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
          {pending ? "Saving…" : bean ? "Save changes" : "Save bean"}
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

export { BeanForm }
