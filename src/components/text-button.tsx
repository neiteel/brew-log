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
        "text-body hover:text-muted-foreground disabled:text-muted-foreground font-medium underline underline-offset-4",
        className,
      )}
    >
      {children}
    </button>
  )
}

export { TextButton }
