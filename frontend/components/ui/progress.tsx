"use client"

import * as React from "react"
import { cn } from "cn"
import { motion } from "motion/react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { easeTransition } from "@/lib/motion"

/**
 * Progress (`ydsVy` track): 8px muted track, primary fill, fully rounded.
 * Queue cards (`xt6J3`) use `className="h-1.5 rounded-xs"` (fill follows the track radius).
 * The fill tweens from empty on mount and between values (300ms ease-raksa; instant with reduced motion).
 */
function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "group/progress relative flex h-2 w-full items-center overflow-hidden rounded-full bg-muted",
        className
      )}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator data-slot="progress-indicator" asChild>
        <motion.div
          className="size-full flex-1 rounded-[inherit] bg-primary"
          initial={{ x: "-100%" }}
          animate={{ x: `-${100 - (value || 0)}%` }}
          transition={easeTransition(0.3)}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
