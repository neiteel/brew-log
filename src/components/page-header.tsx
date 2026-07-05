import { cn } from "@/lib/utils"

// The page-level dateline: a small tracked-out kicker above the big h1, then
// an optional gray subtitle line below it. Uppercase + tracking marks it as a
// category tag rather than body text, so it reads distinctly from the plain
// gray meta text used elsewhere (list-row dates, hints).
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
        <p className="text-muted-foreground text-sm">{kicker}</p>
      ) : null}
      <h1 className="text-h1 font-medium">{title}</h1>
      {subtitle ? (
        <p className="text-body text-muted-foreground">{subtitle}</p>
      ) : null}
    </header>
  )
}

export { PageHeader }
