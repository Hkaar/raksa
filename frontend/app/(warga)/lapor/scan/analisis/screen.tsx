"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Check, CircleDashed, LoaderCircle, Video } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { Screen } from "@/components/raksa/screen"
import woundVideoThumb from "@/public/demo/wound-video-thumb.png"
import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition, fadeUp, staggerParent } from "@/lib/motion"
import { cn } from "@/lib/utils"

import { useDraftMedia } from "../../report-draft"
import { SubpageBar } from "../../result-parts"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const
const STEP_MS = 1500
/** Duration shown on the sample thumbnail (`q45po`). */
const SAMPLE_DURATION = "0:08"

const clock = (seconds: number) => {
  const s = Math.round(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

/** Scan luka — Menganalisis (`q45po`): simulated analysis checklist, then the result. */
export function ScanAnalysisScreen() {
  const router = useRouter()
  const { m } = useI18n()
  const copy = m.scan.analysis
  const { videoUrl } = useDraftMedia()
  const [active, setActive] = useState(0)
  const [duration, setDuration] = useState<number | null>(null)

  useEffect(() => {
    if (active >= copy.steps.length) {
      router.replace("/lapor/scan/hasil")
      return
    }
    const id = window.setTimeout(() => setActive((a) => a + 1), STEP_MS)
    return () => window.clearTimeout(id)
  }, [active, copy.steps.length, router])

  // Scan band sweeps over the thumbnail; static with reduced motion.
  const sweepRef = useCallback((el: HTMLDivElement | null) => {
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const animation = el.animate([{ top: "0px" }, { top: "228px" }], {
      duration: 1800,
      iterations: Infinity,
      direction: "alternate",
      easing: "cubic-bezier(0.22,1,0.36,1)",
    })
    return () => animation.cancel()
  }, [])

  const durationLabel = videoUrl ? (duration !== null ? clock(duration) : null) : SAMPLE_DURATION

  return (
    <Screen>
      <SubpageBar title={copy.title} />
      <div className="flex w-full flex-1 flex-col items-center gap-7 px-6 pt-4 pb-8">
        <div className="relative h-[300px] w-[260px] shrink-0 overflow-hidden rounded-xl bg-muted">
          {videoUrl ? (
            <video
              src={`${videoUrl}#t=0.1`}
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => {
                const d = e.currentTarget.duration
                if (Number.isFinite(d)) setDuration(d)
              }}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <Image src={woundVideoThumb} alt="" fill priority sizes="260px" className="object-cover" />
          )}
          <div className="absolute inset-0 bg-linear-to-b from-transparent from-30% to-[#0B2A3C]/70" />
          <div ref={sweepRef} aria-hidden className="absolute inset-x-0 top-[120px] h-[72px]">
            <div className="h-[70px] w-full bg-linear-to-b from-[#8BD3EA]/0 to-[#8BD3EA]/35" />
            <div className="h-0.5 w-full bg-primary-fixed-dim" />
          </div>
          {durationLabel ? (
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1.5 text-white">
              <Video {...ICON} className="size-3.5" />
              <span className="text-xs font-medium tabular-nums">{durationLabel}</span>
            </div>
          ) : null}
        </div>

        <div className="flex w-full flex-col items-center gap-2 text-center">
          <h1 className="text-[28px]/[normal] font-bold text-foreground">{copy.headline}</h1>
          <p className="text-base/[normal] text-muted-foreground">{copy.sub}</p>
        </div>

        <motion.ol
          variants={staggerParent(0.05, 0.1)}
          initial="hidden"
          animate="show"
          aria-live="polite"
          className="flex w-full flex-col gap-1 rounded-xl bg-card p-2 outline outline-1 -outline-offset-[0.5px] outline-border"
        >
          {copy.steps.map((label, i) => {
            const status = i < active ? "done" : i === active ? "active" : "pending"
            return (
              <motion.li key={label} variants={fadeUp} className="flex items-center gap-3 px-2 py-2.5">
                <span className="relative flex size-7 shrink-0 items-center justify-center">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={status}
                      initial={status === "done" ? { opacity: 0, scale: 0.4 } : { opacity: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: status === "active" ? 0.6 : 1 }}
                      transition={easeTransition(DURATION.card)}
                      className="flex"
                    >
                      {status === "done" ? (
                        <Check {...ICON} className="size-5 text-ok-text" />
                      ) : status === "active" ? (
                        <LoaderCircle {...ICON} className="size-5 animate-spin text-primary motion-reduce:animate-none" />
                      ) : (
                        <CircleDashed {...ICON} className="size-5 text-muted-foreground" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span
                  className={cn(
                    "text-base transition-colors duration-200 ease-[var(--ease-raksa)]",
                    status === "pending" ? "text-muted-foreground" : "text-foreground",
                    status === "active" && "font-medium",
                  )}
                >
                  {label}
                  <span className="sr-only">
                    {" — "}
                    {status === "done" ? copy.stepDone : status === "active" ? copy.stepActive : copy.stepPending}
                  </span>
                </span>
              </motion.li>
            )
          })}
        </motion.ol>
      </div>
    </Screen>
  )
}
