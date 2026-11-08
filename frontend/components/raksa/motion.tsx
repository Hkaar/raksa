"use client"

import { useEffect } from "react"
import { animate, motion, useMotionValue, useReducedMotion, type HTMLMotionProps, type MotionValue } from "motion/react"

import { DURATION, easeTransition, fadeUp, staggerParent } from "@/lib/motion"

/** Staggered enter for a group: direct `StaggerItem` children fade up one after another. */
export function Stagger({
  gap,
  delay,
  ...props
}: HTMLMotionProps<"div"> & { gap?: number; delay?: number }) {
  return <motion.div variants={staggerParent(gap, delay)} initial="hidden" animate="show" {...props} />
}

/** Child of `Stagger` (inherits its `hidden`/`show` state). */
export function StaggerItem(props: HTMLMotionProps<"div">) {
  return <motion.div variants={fadeUp} {...props} />
}

/** Standalone fade-up on mount (optionally delayed). */
export function Reveal({ delay = 0, ...props }: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={easeTransition(DURATION.enter, delay)}
      {...props}
    />
  )
}

/**
 * Progress fills: a motion value that tweens from 0 to `target` on mount and between targets
 * (300ms ease-raksa; instant with reduced motion). Map it with `useTransform` to width/left styles.
 */
export function useProgressTween(target: number): MotionValue<number> {
  const reduce = useReducedMotion()
  const value = useMotionValue(0)
  useEffect(() => {
    const controls = animate(value, target, reduce ? { duration: 0 } : easeTransition(0.3))
    return () => controls.stop()
  }, [value, target, reduce])
  return value
}
