import { cn } from "@/lib/utils"

// The vertical rhythm between a page's major sections (header, then each
// content section). Sized toward the top of the editorial range so sections
// read as separate chapters rather than a continuous scroll.
function PageShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-20 md:space-y-36", className)}>{children}</div>
  )
}

export { PageShell }
