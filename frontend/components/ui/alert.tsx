import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * Alert (`pXCpd`). Put a lucide icon as the first child (`strokeWidth={1.75} aria-hidden`), then
 * `AlertTitle` and/or `AlertDescription`; an optional `AlertAction` follows.
 * - `default` — secondary-container info alert used across screens (mic/camera/location denied,
 *   offline, not-saved, disclaimer). 24px icon.
 * - `muted` — neutral note box (`cnrdA` disclaimer): muted fill, 16px radius, 20px primary icon.
 * - `check` — "needs check" box (`a6OIN` vaccine): muted fill, 28px radius, 22px icon, title +
 *   description, `AlertAction` renders full width below the text.
 * - `overlay` — guide card over the camera (`kDuvX`): translucent primary-deep with blur, white text.
 * - `destructive` — error colors (urgent-bg / urgent-text).
 */
const alertVariants = cva(
  "group/alert relative grid w-full grid-cols-1 items-start gap-y-0.5 text-start has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 *:[svg]:row-span-2 *:[svg]:shrink-0 *:[svg]:text-current",
  {
    variants: {
      variant: {
        default:
          "rounded-md bg-secondary-container p-4 text-on-secondary-container has-data-[slot=alert-action]:pe-18 *:[svg:not([class*='size-'])]:size-6",
        muted:
          "rounded-lg bg-muted p-3.5 text-muted-foreground has-data-[slot=alert-action]:pe-18 *:[svg]:text-primary *:[svg:not([class*='size-'])]:size-5",
        check:
          "rounded-xl bg-muted p-4 text-foreground *:[svg:not([class*='size-'])]:size-[22px] *:data-[slot=alert-action]:static *:data-[slot=alert-action]:col-span-full *:data-[slot=alert-action]:mt-2.5 *:data-[slot=alert-description]:text-sm/5 *:data-[slot=alert-description]:tracking-normal *:data-[slot=alert-description]:text-muted-foreground",
        overlay:
          "items-center rounded-lg bg-primary-deep/80 px-3.5 py-3 text-white backdrop-blur-[8px] has-data-[slot=alert-action]:pe-18 *:[svg]:text-primary-fixed-dim *:[svg:not([class*='size-'])]:size-5 *:data-[slot=alert-description]:text-sm/5 *:data-[slot=alert-description]:tracking-normal",
        destructive:
          "rounded-md bg-urgent-bg p-4 text-urgent-text has-data-[slot=alert-action]:pe-18 *:[svg]:text-destructive *:[svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      data-variant={variant}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

/** Title: title-medium (16px/500). */
function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "text-base font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

/** Description: 14/21, +0.25 tracking, inherits the variant color. */
function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm/[21px] tracking-[0.25px] group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 end-2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction, alertVariants }
