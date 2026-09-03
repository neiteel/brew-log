"use client"

import { useId, useState } from "react"

import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"

import { cn } from "@/lib/utils"

// Data-entry form fields. Editorial restraint (monochrome, sharp corners, one
// typeface) is kept, but the control layer follows functional-form convention:
// a visible bordered box so the fill target is obvious, a solid high-contrast
// label (not a demoted gray paren — that's for read-only rows), persistent hint
// text for examples instead of a vanishing placeholder, and an inline error that
// reds the field and states what to fix.

const fieldBase =
  "w-full border border-border-strong bg-transparent rounded-none px-3 py-2 outline-none " +
  "placeholder:text-muted-foreground transition-colors " +
  "focus:border-foreground"

const fieldError = "border-destructive focus:border-destructive"

// A solid, high-contrast field label. Required fields get an asterisk; the
// majority here are optional, so marking the minority reads cleaner than
// tagging every optional field.
function FieldLabel({
  htmlFor,
  label,
  required,
}: {
  htmlFor?: string
  label: string
  required?: boolean
}) {
  const content = (
    <>
      {label}
      {required ? <span className="text-muted-foreground"> *</span> : null}
    </>
  )
  // A real <label> when it points at one input; a plain caption for a group
  // (e.g. the radio scale) where no single control owns it.
  return htmlFor ? (
    <label htmlFor={htmlFor} className="text-foreground block font-medium">
      {content}
    </label>
  ) : (
    <span className="text-foreground block font-medium">{content}</span>
  )
}

// Renders the inline error (destructive) or, when there's none, the hint (gray).
// Returns its id so the input can wire aria-describedby to it.
function FieldMessage({
  id,
  hint,
  error,
}: {
  id: string
  hint?: string
  error?: string
}) {
  if (error) {
    return (
      <p id={id} className="text-small text-destructive">
        {error}
      </p>
    )
  }
  if (hint) {
    return (
      <p id={id} className="text-small text-muted-foreground">
        {hint}
      </p>
    )
  }
  return null
}

function TextField({
  label,
  className,
  options,
  hint,
  error,
  ...props
}: React.ComponentProps<"input"> & {
  label: string
  options?: string[]
  hint?: string
  error?: string
}) {
  const id = useId()
  const listId = useId()
  const msgId = useId()
  const hasMessage = Boolean(error || hint)
  return (
    <div className={cn("text-body min-w-0 space-y-1.5", className)}>
      <FieldLabel htmlFor={id} label={label} required={props.required} />
      <input
        {...props}
        id={id}
        list={options ? listId : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasMessage ? msgId : undefined}
        className={cn(fieldBase, error && fieldError)}
      />
      {options ? (
        <datalist id={listId}>
          {options.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      ) : null}
      <FieldMessage id={msgId} hint={hint} error={error} />
    </div>
  )
}

function SelectField({
  label,
  className,
  children,
  hint,
  error,
  ...props
}: React.ComponentProps<"select"> & {
  label: string
  hint?: string
  error?: string
}) {
  const id = useId()
  const msgId = useId()
  const hasMessage = Boolean(error || hint)
  return (
    <div className={cn("text-body min-w-0 space-y-1.5", className)}>
      <FieldLabel htmlFor={id} label={label} required={props.required} />
      <span className="relative block">
        <select
          {...props}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? msgId : undefined}
          className={cn(fieldBase, "appearance-none pr-8", error && fieldError)}
        >
          {children}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 8 5"
          className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-2 -translate-y-1/2"
        >
          <path d="M0 0 4 5 8 0Z" fill="currentColor" />
        </svg>
      </span>
      <FieldMessage id={msgId} hint={hint} error={error} />
    </div>
  )
}

function TextAreaField({
  label,
  className,
  hint,
  error,
  ...props
}: React.ComponentProps<"textarea"> & {
  label: string
  hint?: string
  error?: string
}) {
  const id = useId()
  const msgId = useId()
  const hasMessage = Boolean(error || hint)
  return (
    <div className={cn("text-body min-w-0 space-y-1.5", className)}>
      <FieldLabel htmlFor={id} label={label} required={props.required} />
      <textarea
        rows={3}
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasMessage ? msgId : undefined}
        className={cn(fieldBase, "resize-y", error && fieldError)}
      />
      <FieldMessage id={msgId} hint={hint} error={error} />
    </div>
  )
}

// Editorial radio row for a small fixed set of exclusive choices (e.g. a
// roast scale). All options are visible at once as hairline dots; the
// selected one inks its dot and label black, the rest stay gray. RadioGroup
// submits the value via its own name-bound hidden input.
//
// Options carry a separate `value` and `label`: what gets stored is English
// (methods, roast levels, Public/Private are compared and filtered on), while
// what the reader sees follows their locale.
function RadioField({
  label,
  name,
  defaultValue,
  options,
  className,
  required,
  value: valueProp,
  onValueChange,
}: {
  label: string
  name: string
  defaultValue?: string | null
  options: { value: string; label: string }[]
  className?: string
  required?: boolean
  value?: string
  onValueChange?: (value: string) => void
}) {
  const [internal, setInternal] = useState(defaultValue ?? "")
  const value = valueProp ?? internal
  const setValue = (next: string) => {
    setInternal(next)
    onValueChange?.(next)
  }
  return (
    <div className={cn("text-body space-y-2", className)}>
      <FieldLabel label={label} required={required} />
      <RadioGroup
        name={name}
        value={value}
        onValueChange={(next: string) => setValue(next)}
        required={required}
        className="flex flex-wrap gap-x-6 gap-y-2 py-2"
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="has-data-checked:text-foreground text-muted-foreground hover:text-foreground group flex cursor-pointer items-center gap-2 py-1 transition-colors"
          >
            <Radio.Root
              value={option.value}
              className="border-border-strong group-hover:border-foreground data-checked:border-foreground focus-visible:outline-foreground flex size-3 shrink-0 items-center justify-center rounded-full border outline-none focus-visible:outline-1 focus-visible:outline-offset-2"
            >
              <Radio.Indicator className="bg-foreground size-1.5 rounded-full" />
            </Radio.Root>
            {option.label}
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}

export { TextField, SelectField, TextAreaField, RadioField }
