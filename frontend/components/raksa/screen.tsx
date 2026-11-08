"use client"

import { motion, type HTMLMotionProps } from "motion/react"

import { DURATION, easeTransition } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * How a screen adapts above the mobile design width (`md` = 768px):
 * - `compact`: the 390px mobile design, shown as a centered 480px app card on a tinted backdrop.
 * - `wide`: content page up to 1200px; the screen lays out its own `md:`/`lg:` columns.
 * - `immersive`: full-bleed (camera, first aid, splash); the screen centers its own content column.
 */
export type ScreenLayout = "compact" | "wide" | "immersive"

const LAYOUT: Record<ScreenLayout, string> = {
  compact:
    "md:min-h-[min(844px,calc(100dvh-4rem))] md:w-full md:max-w-[480px] md:overflow-clip md:rounded-xl md:border md:border-border md:shadow-[0_24px_64px_-24px_var(--shadow-float)]",
  wide: "mx-auto w-full max-w-[1200px]",
  immersive: "w-full",
}

/** Screen root: `<main>` with the design's screen-enter motion (fade + 8px rise, 220ms). */
export function Screen({
  layout = "compact",
  className,
  ...props
}: Omit<HTMLMotionProps<"main">, "layout"> & { layout?: ScreenLayout }) {
  const main = (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={easeTransition(DURATION.enter)}
      className={cn("flex min-h-dvh flex-col bg-background", LAYOUT[layout], className)}
      {...props}
    />
  )
  if (layout !== "compact") return main
  return (
    <div className="flex w-full flex-1 flex-col md:min-h-dvh md:items-center md:justify-center md:bg-surface-container-low md:px-6 md:py-8">
      {main}
    </div>
  )
}
