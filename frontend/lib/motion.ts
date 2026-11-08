import type { Transition, Variants } from "motion/react"

/** Design easing `cubic-bezier(0.22,1,0.36,1)` (`--ease-raksa`). */
export const EASE = [0.22, 1, 0.36, 1] as const

/** Durations from the design guidance (seconds). */
export const DURATION = { enter: 0.22, card: 0.2, sheet: 0.26, quick: 0.16 } as const

export const easeTransition = (duration: number = DURATION.enter, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE,
})

/** Layout/indicator moves (selection pills, tab indicator, progress fills). */
export const LAYOUT_SPRING: Transition = { type: "spring", stiffness: 520, damping: 42, mass: 0.9 }

/** Screen / block enter: fade + 8px rise. Reduced motion drops the transform via `MotionConfig`. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: easeTransition() },
}

/** Parent of `fadeUp` children; staggers them by `gap` seconds. */
export const staggerParent = (gap = 0.05, delayChildren = 0.04): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren } },
})
