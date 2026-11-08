"use client"

import * as React from "react"
import { cn } from "cn"
import { Dialog as SheetPrimitive } from "radix-ui"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/provider"
import { XIcon } from "lucide-react"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

/** Scrim: on-surface at 50% (`Y0BFDe` Overlay #171C1F80). */
function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-foreground/50 duration-[260ms] ease-[var(--ease-raksa)] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:duration-100",
        className
      )}
      {...props}
    />
  )
}

/**
 * Sheet (`zEBuR`). Bottom side (default) = mobile bottom sheet: surface-container-low fill,
 * 28px top radius, 16/24/32 padding, 20px gap, drag handle, 48px close button aligned with the
 * header row, translateY 100%→0 in 260ms ease-raksa (fade only with reduced motion).
 * From `md` up the bottom sheet stays anchored to the bottom as a centered ≤560px panel.
 * Usage: <Sheet><SheetContent><SheetHeader><SheetTitle/><SheetDescription/></SheetHeader>
 * …body…<SheetFooter/></SheetContent></Sheet>
 */
function SheetContent({
  className,
  children,
  side = "bottom",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  const { m } = useI18n()
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-5 overflow-y-auto bg-surface-container-low text-foreground outline-none duration-[260ms] ease-[var(--ease-raksa)] data-open:animate-in data-closed:animate-out motion-reduce:duration-100",
          "data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:mx-auto data-[side=bottom]:max-h-[calc(100dvh-48px)] data-[side=bottom]:w-full data-[side=bottom]:max-w-[480px] md:data-[side=bottom]:max-w-[560px] md:data-[side=bottom]:max-h-[calc(100dvh-96px)] data-[side=bottom]:rounded-t-xl data-[side=bottom]:px-6 data-[side=bottom]:pt-4 data-[side=bottom]:pb-[calc(32px+env(safe-area-inset-bottom))] data-[side=bottom]:data-open:slide-in-from-bottom data-[side=bottom]:data-closed:slide-out-to-bottom motion-reduce:data-[side=bottom]:data-open:slide-in-from-bottom-0 motion-reduce:data-[side=bottom]:data-closed:slide-out-to-bottom-0 motion-reduce:data-open:fade-in-0 motion-reduce:data-closed:fade-out-0",
          "data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:rounded-b-xl data-[side=top]:p-6 data-[side=top]:data-open:slide-in-from-top data-[side=top]:data-closed:slide-out-to-top",
          "data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:p-6 data-[side=left]:sm:max-w-sm data-[side=left]:data-open:slide-in-from-left data-[side=left]:data-closed:slide-out-to-left",
          "data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:p-6 data-[side=right]:sm:max-w-sm data-[side=right]:data-open:slide-in-from-right data-[side=right]:data-closed:slide-out-to-right",
          className
        )}
        {...props}
      >
        {side === "bottom" && (
          <div data-slot="sheet-handle" aria-hidden className="flex w-full shrink-0 justify-center">
            <div className="h-1 w-8 rounded-xs bg-muted-foreground/40" />
          </div>
        )}
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute text-muted-foreground",
                side === "bottom" ? "end-6 top-10" : "end-4 top-4"
              )}
            >
              <XIcon strokeWidth={1.75} aria-hidden />
              <span className="sr-only">{m.common.close}</span>
            </Button>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

/** SheetHeader: row height matches the 48px close button; leaves room for it on the right. */
function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex min-h-12 flex-col justify-center gap-1 pe-12", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-3", className)}
      {...props}
    />
  )
}

/** SheetTitle: 22px, regular weight. */
function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-[22px]/7 font-normal text-foreground", className)}
      {...props}
    />
  )
}

/** SheetDescription: 16/26 on-surface-variant. */
function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-base/[26px] text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
