import * as React from "react"
import { cn } from "cn"

/** Textarea (`NzaIq`): 160px min height, 1px outline border, 12px radius, body-large text. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-40 w-full resize-none rounded-md border border-outline bg-transparent px-4 py-2.5 text-base/6 tracking-[0.5px] text-foreground transition-[border-color] duration-[120ms] ease-[var(--ease-raksa)] outline-none placeholder:text-muted-foreground focus-visible:border-2 focus-visible:border-primary focus-visible:px-[15px] focus-visible:py-[9px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-2 aria-invalid:border-destructive aria-invalid:px-[15px] aria-invalid:py-[9px]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
