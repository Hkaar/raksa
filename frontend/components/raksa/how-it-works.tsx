"use client"

import { MapPin, MessageCircleHeart, ShieldCheck, type LucideIcon } from "lucide-react"
import { motion } from "motion/react"

import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition, fadeUp, staggerParent } from "@/lib/motion"
import { cn } from "@/lib/utils"

const STEP_GAP = 0.08

/** Badge outlines from Beranda `H2HTF` (60×60): circle, rounded hexagon (r 12), rounded pentagon (r 14), point up. */
const CIRCLE = "M30 0A30 30 0 1 1 30 60A30 30 0 1 1 30 0Z"
const HEXAGON =
  "M24.63 2.68A12 12 0 0 1 35.37 2.68L53.37 11.68A12 12 0 0 1 60 22.42L60 37.58A12 12 0 0 1 53.37 48.32L35.37 57.32A12 12 0 0 1 24.63 57.32L6.63 48.32A12 12 0 0 1 0 37.58L0 22.42A12 12 0 0 1 6.63 11.68Z"
const PENTAGON =
  "M21.5 6.49A14 14 0 0 1 38.5 6.49L52.24 16.99A14 14 0 0 1 57.12 32.25L51.59 50.13A14 14 0 0 1 38.21 60L21.79 60A14 14 0 0 1 8.41 50.13L2.88 32.25A14 14 0 0 1 7.76 16.99Z"

type Step = { icon: LucideIcon; shape: string; fill: string; ink: string; label: string; sub: string }

/** "3 langkah, kami temani" stepper (`How It Works` in Beranda `H2HTF`): three tinted icon badges
 * joined by dotted connectors. Steps stagger in; each connector's dots then appear left to right. */
export function HowItWorks({ className }: { className?: string }) {
  const { m } = useI18n()
  const h = m.chrome.howItWorks
  const steps: Step[] = [
    { icon: MessageCircleHeart, shape: CIRCLE, fill: "text-primary-container", ink: "text-on-primary-container", ...h.tell },
    { icon: ShieldCheck, shape: HEXAGON, fill: "text-tertiary-container", ink: "text-on-tertiary-container", ...h.check },
    { icon: MapPin, shape: PENTAGON, fill: "text-success-container", ink: "text-on-success-container", ...h.facility },
  ]
  return (
    <motion.ol
      className={cn("flex w-full items-start", className)}
      variants={staggerParent(STEP_GAP)}
      initial="hidden"
      animate="show"
    >
      {steps.map(({ icon: Icon, shape, fill, ink, label, sub }, i) => (
        <li key={label} className={cn("flex items-start", i > 0 && "flex-1")}>
          {i > 0 ? (
            <span aria-hidden className="flex h-[60px] flex-1 items-center justify-center gap-[5px]">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="size-1 rounded-full bg-border"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={easeTransition(DURATION.quick, 0.04 + STEP_GAP * i + DURATION.quick + d * 0.06)}
                />
              ))}
            </span>
          ) : null}
          <motion.span variants={fadeUp} className="flex w-[100px] shrink-0 flex-col items-center gap-2.5 text-center">
            <span className="relative flex size-[60px] items-center justify-center">
              <svg aria-hidden viewBox="0 0 60 60" className={cn("absolute inset-0 size-full", fill)}>
                <path d={shape} fill="currentColor" />
              </svg>
              <Icon aria-hidden strokeWidth={1.75} className={cn("relative size-[26px]", ink)} />
            </span>
            <span className="w-full text-sm/4 font-semibold text-foreground">{label}</span>
            <span className="w-full text-xs/4 text-muted-foreground">{sub}</span>
          </motion.span>
        </li>
      ))}
    </motion.ol>
  )
}
