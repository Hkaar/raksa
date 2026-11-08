import * as React from "react"
import { cn } from "cn"

/** Input (`zj0ki`): 56px field, 1px outline border, 12px radius, body-large text. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-14 w-full min-w-0 rounded-md border border-outline bg-transparent px-4 py-2 text-base/6 tracking-[0.5px] text-foreground transition-[border-color] duration-[120ms] ease-[var(--ease-raksa)] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-2 focus-visible:border-primary focus-visible:px-[15px] focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-2 aria-invalid:border-destructive aria-invalid:px-[15px]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
