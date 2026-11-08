"use client"

import { LoaderCircle, Mic, Square } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { useI18n } from "@/lib/i18n/provider"
import { DURATION, EASE, easeTransition } from "@/lib/motion"
import { cn } from "@/lib/utils"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const

/** Halo breathing while recording (1400ms loop, design "mic recording pulsing ring"). */
const PULSE = { duration: 1.4, ease: EASE, repeat: Infinity } as const
const HALOS = ["inset-0 bg-primary/5", "inset-6 bg-primary/9", "inset-[46px] bg-primary/14"] as const

/**
 * Mic button with halos as drawn on the voice screen `B7QRK` (112px gradient button inside 240px halos).
 * Recording: halos breathe and a ring pulses outwards (looping only without reduced motion);
 * the icon cross-fades between idle / recording / processing.
 */
export function MicButton({
  state,
  onClick,
  elapsedLabel,
  className,
}: {
  state: "idle" | "recording" | "processing"
  onClick?: () => void
  /** e.g. "0:12", announced with the recording label. */
  elapsedLabel?: string
  className?: string
}) {
  const { m } = useI18n()
  const reduce = useReducedMotion()
  const pulsing = state === "recording" && !reduce
  const label =
    state === "idle" ? m.chrome.mic.start : state === "recording" ? m.chrome.mic.stop : m.chrome.mic.processing
  return (
    <div className={cn("relative flex size-60 shrink-0 items-center justify-center", className)}>
      {HALOS.map((halo, i) => (
        <motion.span
          key={halo}
          aria-hidden
          className={cn("absolute rounded-full", halo)}
          animate={pulsing ? { scale: [1, 1.04 - i * 0.01, 1] } : { scale: 1 }}
          transition={pulsing ? { ...PULSE, delay: i * 0.12 } : easeTransition(DURATION.quick)}
        />
      ))}
      <AnimatePresence>
        {state === "recording" ? (
          <motion.span
            key="ring"
            aria-hidden
            className="pointer-events-none absolute inset-16 rounded-full bg-primary"
            initial={{ opacity: 0, scale: 1 }}
            animate={pulsing ? { opacity: [0.6, 0], scale: [1, 1.35] } : { opacity: 0.2, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={pulsing ? PULSE : easeTransition(DURATION.quick)}
          />
        ) : null}
      </AnimatePresence>
      <button
        type="button"
        onClick={onClick}
        disabled={state === "processing"}
        aria-busy={state === "processing" || undefined}
        aria-pressed={state === "recording"}
        aria-label={elapsedLabel && state === "recording" ? `${label} (${elapsedLabel})` : label}
        className="relative flex size-28 items-center justify-center rounded-full bg-linear-to-b from-primary to-primary-hover text-primary-foreground transition-opacity duration-[160ms] ease-[var(--ease-raksa)] hover:opacity-90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-progress"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={state}
            className="flex"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={easeTransition(DURATION.quick)}
          >
            {state === "idle" ? (
              <Mic {...ICON} className="size-[42px]" />
            ) : state === "recording" ? (
              <Square {...ICON} className="size-9" />
            ) : (
              <LoaderCircle {...ICON} className="size-[42px] animate-spin motion-reduce:animate-none" />
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  )
}
