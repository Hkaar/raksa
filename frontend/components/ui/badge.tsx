import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "group/badge inline-flex h-8 w-fit shrink-0 items-center justify-center gap-2 overflow-hidden rounded-sm border border-transparent px-3 py-1.5 text-sm leading-5 font-medium tracking-[0.1px] whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-[18px] [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        /** Badge/WHO — category / risk chips */
        who: "border-outline text-foreground",
        /** Badge/HARI_INI */
        urgent: "bg-urgent text-urgent-foreground",
        /** Badge/DALAM_24_JAM */
        soon: "bg-soon-bg text-soon-text",
        /** Badge/Info */
        info: "bg-secondary-container text-on-secondary-container",
        /** Badge/OK */
        ok: "bg-ok-bg text-ok-text",
        /** Badge/Demo */
        demo: "border-outline-variant text-muted-foreground",
        /** Badge/Eskalasi */
        escalation: "border-outline text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
