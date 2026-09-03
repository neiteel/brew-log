import { cn } from "@/lib/utils"

// Text-link button: plain underlined text, no decoration.
function TextButton({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={cn(
        // The underline is the affordance, so a disabled TextButton drops it.
        // Kept in the base rather than passed per call site: it was passed at
        // one of two, and the one that missed it was the AI panel's Regenerate
        // at zero quota — gray, underlined, and still reading as clickable at
        // the exact moment it could do nothing.
        "text-body hover:text-muted-foreground disabled:text-muted-foreground font-medium underline underline-offset-4 disabled:no-underline",
        className,
      )}
    >
      {children}
    </button>
  )
}

export { TextButton }
