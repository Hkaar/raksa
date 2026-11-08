"use client"

import { MotionConfig } from "motion/react"
import type { ReactNode } from "react"

import { EASE } from "@/lib/motion"

/** App-wide motion defaults: design easing; `prefers-reduced-motion` keeps fades but drops transforms. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.22, ease: EASE }}>
      {children}
    </MotionConfig>
  )
}
