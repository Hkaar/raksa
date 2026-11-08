import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-transparent bg-clip-padding text-center leading-tight font-medium transition-[color,background-color,border-color,opacity,transform] duration-[160ms] ease-[var(--ease-raksa)] outline-none active:scale-[0.98] motion-reduce:active:scale-100 select-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
  {
    variants: {
      variant: {
        /** Button/Utama */
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        /** Button/Bingkai */
        outline: "border-outline bg-transparent text-primary hover:bg-state-hover",
        /** Button/Darurat — white button on the urgent card */
        emergency: "bg-white text-urgent-on-white hover:bg-white/90 dark:bg-urgent-foreground dark:text-urgent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        ghost: "text-foreground hover:bg-state-hover",
        destructive: "bg-destructive text-urgent-foreground hover:bg-destructive/90",
        /** Button/Teks */
        link: "bg-transparent text-primary hover:bg-state-hover",
      },
      size: {
        /** 56px design size (Utama, Bingkai, Darurat) */
        default: "h-14 px-6 text-base tracking-[0.15px]",
        /** 48px (Teks) */
        sm: "h-12 px-3 text-sm tracking-[0.1px] [&_svg:not([class*='size-'])]:size-[18px]",
        icon: "size-12",
        "icon-sm": "size-10 [&_svg:not([class*='size-'])]:size-5",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
