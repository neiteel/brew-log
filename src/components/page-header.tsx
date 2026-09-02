import { cn } from "@/lib/utils"

// The page-level dateline: a small tracked-out kicker above the big h1, then
// an optional gray subtitle line below it. Uppercase + tracking marks it as a
// category tag rather than body text, so it reads distinctly from the plain
// gray meta text used elsewhere (list-row dates, hints).
//
// The treatment above was documented but never implemented, which is why
// /brews/new rendered "Brew" and "3 of 50 brews used" as two identical gray
// lines. Uppercase is a no-op on zh-Hant, so the tracking carries the tag
// reading in both languages.
function PageHeader({
  kicker,
  title,
  subtitle,
  className,
}: {
  kicker?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn("space-y-4", className)}>
      {kicker ? (
        <p className="text-small text-muted-foreground tracking-[0.08em] uppercase">
          {kicker}
        </p>
      ) : null}
      <h1 className="text-h1 font-medium wrap-anywhere">{title}</h1>
      {subtitle ? (
        <p className="text-body text-muted-foreground wrap-anywhere">
          {subtitle}
        </p>
      ) : null}
    </header>
  )
}

export { PageHeader }
