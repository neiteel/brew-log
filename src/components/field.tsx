import { cn } from "@/lib/utils"

// Editorial field language: labels are demoted with parentheses (same size,
// gray parens), values stay black; secondary detail is gray. Rows are
// separated by hairlines.
//
// Data rows are measured, not full-bleed. On a 1500px shell a 12-col split put
// "(Cupping) 87" — nine pixels of ink — on a 1400px rule with 681px of ruled
// emptiness after it, which reads as a row that failed to load rather than a
// spare one. Headings stay full width; rows stop where their content stops.
// Shared by TasteScale and ScaleInput so every hairline on a page ends on the
// same vertical.
const DATA_ROW_MEASURE = "max-w-[52rem]"

function Paren({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground">({children})</span>
}

// A top-left chapter marker for a group of fields. Kept a tier quieter
// (foreground/40) than field labels (muted-foreground, ~65%) so it reads as
// structure rather than competing with the labels underneath it.
function Section({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-8">
      <h2 className="text-h2 font-medium">{label}</h2>
      <div className="grid gap-x-5 gap-y-8 md:grid-cols-12">{children}</div>
    </section>
  )
}

// A parameter as a headline number: quiet paren label, foreground value, unit
// and any secondary fact demoted around it. Used where the figures themselves
// are the content (a brew's recipe) rather than a row in a reference table.
function Figure({
  label,
  value,
  unit,
  note,
}: {
  label: string
  value: React.ReactNode
  unit?: string
  note?: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-small">
        <Paren>{label}</Paren>
      </p>
      <p className="text-h2 font-medium wrap-anywhere tabular-nums">
        {value}
        {unit ? <span className="text-muted-foreground"> {unit}</span> : null}
      </p>
      {note ? (
        <p className="text-small text-muted-foreground wrap-anywhere">{note}</p>
      ) : null}
    </div>
  )
}

function Row({
  label,
  value,
  detail,
  className,
}: {
  label: string
  value: React.ReactNode
  detail?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "border-border text-body grid grid-cols-[6.5rem_1fr] items-baseline gap-x-3 border-b py-3 md:gap-x-5",
        // With a detail the value is bounded so the two columns sit adjacent;
        // without one it takes the rest of the measure, so prose (notes, a
        // roaster's story) gets the full line instead of wrapping early
        // against an empty track.
        detail
          ? "md:grid-cols-[8rem_minmax(0,16rem)_1fr]"
          : "md:grid-cols-[8rem_1fr]",
        DATA_ROW_MEASURE,
        className,
      )}
    >
      <p>
        <Paren>{label}</Paren>
      </p>
      <p className="wrap-anywhere">{value}</p>
      {detail ? (
        <p className="text-muted-foreground col-start-2 wrap-anywhere md:col-start-auto">
          {detail}
        </p>
      ) : null}
    </div>
  )
}

export { DATA_ROW_MEASURE, Figure, Paren, Row, Section }
