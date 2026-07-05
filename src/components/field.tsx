import { cn } from "@/lib/utils"

// Editorial field language: labels are demoted with parentheses (same size,
// gray parens), values stay black; secondary detail is gray. Rows sit on the
// 12-col grid (label 2 / value 4 / detail 6) and are separated by hairlines.

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
      <h2 className="text-3xl font-medium">{label}</h2>
      <div className="grid gap-x-5 gap-y-8 md:grid-cols-12">{children}</div>
    </section>
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
        "border-border text-body grid grid-cols-[6.5rem_1fr] items-baseline gap-x-3 border-b py-3 md:grid-cols-12 md:gap-x-5",
        className,
      )}
    >
      <p className="md:col-span-2">
        <Paren>{label}</Paren>
      </p>
      <p className="md:col-span-4">{value}</p>
      {detail ? (
        <p className="text-muted-foreground col-start-2 md:col-span-6 md:col-start-auto">
          {detail}
        </p>
      ) : null}
    </div>
  )
}

export { Paren, Row, Section }
