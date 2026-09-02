import { cn } from "@/lib/utils"

// The system's one button. It is not a new primitive: this shape already
// existed twice — the AI panels' inverting bordered box and the Google row's
// quiet outline — so this names the two and deletes the duplication.
//
// Reserved for actions that commit: saving a record, creating an account,
// changing a password. Navigation, destructive actions and utilities stay
// underlined text (TextButton), which is what makes a button mean something
// when one appears. Sharp corners, matching the inputs; the only color is the
// foreground.
const base =
  "text-body inline-flex items-center justify-center gap-3 border px-4 py-2 font-medium transition-colors " +
  "disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"

const variants = {
  // The page's commit action. Inverts on hover, so the strongest element on
  // the page is also the one that responds most.
  primary:
    "border-foreground text-foreground hover:bg-foreground hover:text-background",
  // An alternative route to the same destination — a second way to sign in,
  // not a second decision. Present, outlined, and quieter than the commit.
  quiet: "border-border-strong text-foreground hover:bg-muted",
}

function Button({
  variant = "primary",
  className,
  ...props
}: React.ComponentProps<"button"> & { variant?: keyof typeof variants }) {
  return (
    <button {...props} className={cn(base, variants[variant], className)} />
  )
}

export { Button }
