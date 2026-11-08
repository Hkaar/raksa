"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Tabs as TabsPrimitive } from "radix-ui"
import { CheckIcon } from "lucide-react"
import { motion } from "motion/react"

import { LAYOUT_SPRING } from "@/lib/motion"

/** Active value + per-instance id so the active indicator can slide between triggers (`layoutId`). */
const TabsContext = React.createContext<{ value: string | undefined; layoutId: string } | null>(null)

function Tabs({
  className,
  orientation = "horizontal",
  value,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const layoutId = `tabs-indicator-${React.useId()}`
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const current = value ?? uncontrolled
  const ctx = React.useMemo(() => ({ value: current, layoutId }), [current, layoutId])
  return (
    <TabsContext value={ctx}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => {
          setUncontrolled(next)
          onValueChange?.(next)
        }}
        {...props}
      />
    </TabsContext>
  )
}

/** Tabs (`GonW7`): M3 segmented button — pill outline, 40px segments split by 1px outline dividers. */
const tabsListVariants = cva("group/tabs-list flex w-full items-stretch", {
  variants: {
    variant: {
      default: "overflow-hidden rounded-full border border-outline",
      line: "gap-1 border-b border-border",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

/**
 * Active segment = secondary-container fill + check icon (18px), label-large text. The fill
 * (default) / underline (line) is one shared `layoutId` element that slides to the new trigger.
 */
function TabsTrigger({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const tabs = React.useContext(TabsContext)
  const active = tabs?.value === value
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "group/tabs-trigger relative isolate inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 px-3 text-sm font-medium tracking-[0.1px] whitespace-nowrap text-foreground transition-colors duration-[160ms] ease-[var(--ease-raksa)] outline-none focus-visible:z-10 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
        "group-data-[variant=default]/tabs-list:not-first:border-s group-data-[variant=default]/tabs-list:not-first:border-outline group-data-[variant=default]/tabs-list:hover:bg-state-hover group-data-[variant=default]/tabs-list:data-[state=active]:text-on-secondary-container",
        "group-data-[variant=line]/tabs-list:-mb-px group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-transparent group-data-[variant=line]/tabs-list:data-[state=active]:text-primary",
        className
      )}
      value={value}
      {...props}
    >
      {active && tabs ? (
        <motion.span
          aria-hidden
          layoutId={tabs.layoutId}
          transition={LAYOUT_SPRING}
          className="absolute -z-10 group-data-[variant=default]/tabs-list:inset-0 group-data-[variant=default]/tabs-list:bg-secondary-container group-data-[variant=line]/tabs-list:inset-x-0 group-data-[variant=line]/tabs-list:-bottom-0.5 group-data-[variant=line]/tabs-list:h-0.5 group-data-[variant=line]/tabs-list:bg-primary"
        />
      ) : null}
      <CheckIcon
        strokeWidth={1.75}
        aria-hidden
        className="hidden group-data-[variant=default]/tabs-list:group-data-[state=active]/tabs-trigger:block"
      />
      {children}
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
