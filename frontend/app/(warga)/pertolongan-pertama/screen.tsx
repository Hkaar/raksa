"use client"

import { ArrowRight, Pause, Play, ShieldPlus, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { FirstAidIllustration } from "@/components/raksa/first-aid-illustration"
import { SoapScene } from "@/components/raksa/first-aid-scenes"
import { LogoHeader } from "@/components/raksa/logo"
import { Screen } from "@/components/raksa/screen"
import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition } from "@/lib/motion"
import { cn } from "@/lib/utils"

const TOTAL_MS = 15 * 60 * 1000
/** Step 1 (soap) runs 15:00–14:00; step 2 (rinse) 14:00–00:00; step 3 (antiseptic) at 00:00. */
const SOAP_MS = 60 * 1000
const RING_R = 108
const RING_C = 2 * Math.PI * RING_R
/** Arc gap between the remaining (active) arc and the elapsed track on each side (≈9.5°, per `E8Ofxp`). */
const RING_GAP = (9.5 / 360) * RING_C

type Status = "idle" | "running" | "paused" | "done"

function fmtClock(ms: number) {
  const s = Math.ceil(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
}

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: easeTransition(DURATION.quick),
}

/** Countdown ring (`Timer Ring` in `BIUma`/`E8Ofxp`): remaining arc clockwise from the top, elapsed track behind it. */
function TimerRing({ remaining, label }: { remaining: number; label: string }) {
  const frac = remaining / TOTAL_MS
  const activeLen = RING_C * frac
  const trackLen = frac <= 0 ? RING_C : Math.max(0, RING_C - activeLen - 2 * RING_GAP)
  const trackStart = frac <= 0 ? 0 : activeLen + RING_GAP
  const tween =
    "transition-[stroke-dasharray,stroke-dashoffset,opacity] duration-1000 ease-linear motion-reduce:transition-none"

  return (
    <div className="relative flex size-[232px] shrink-0 flex-col items-center justify-center gap-1" role="timer" aria-live="off">
      <svg aria-hidden viewBox="0 0 232 232" className="absolute inset-0 size-full -rotate-90">
        <circle
          cx="116"
          cy="116"
          r={RING_R}
          fill="none"
          stroke="#004C69"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${trackLen} ${RING_C}`}
          strokeDashoffset={-trackStart}
          opacity={trackLen > 0 ? 1 : 0}
          className={tween}
        />
        <circle
          cx="116"
          cy="116"
          r={RING_R}
          fill="none"
          stroke="#7DD0FF"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${RING_C} ${RING_C}`}
          strokeDashoffset={RING_C - activeLen}
          opacity={frac > 0 ? 1 : 0}
          className={tween}
        />
      </svg>
      <span className="relative text-[57px]/[64px] font-normal tracking-[-0.25px] tabular-nums">{fmtClock(remaining)}</span>
      <span className="relative text-sm font-medium tracking-[0.1px] text-[#C1C7CE]">{label}</span>
    </div>
  )
}

/** Current scene step (0 soap, 1 rinse, 2 antiseptic) and each step's segment fill (0–1). */
function sceneProgress(status: Status, remaining: number) {
  const elapsed = TOTAL_MS - remaining
  const step = status === "done" || remaining <= 0 ? 2 : status === "idle" || elapsed < SOAP_MS ? 0 : 1
  const rinse = Math.min(1, Math.max(0, (elapsed - SOAP_MS) / (TOTAL_MS - SOAP_MS)))
  // The one-minute soap step and the antiseptic moment show full; rinse fills with the timer (`E8Ofxp`).
  const fills = [1, step === 2 ? 1 : step === 1 ? rinse : 0, step === 2 ? 1 : 0]
  return { step, fills }
}

/** Illustrated step card (pen `Scene Card`, `hbiJN`/`UoOW1`): animated scene, step meta, 3-part progress. */
function SceneCard({ status, remaining }: { status: Status; remaining: number }) {
  const { m, t } = useI18n()
  const steps = m.firstAid.steps
  const { step, fills } = sceneProgress(status, remaining)
  const current = steps[step]

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-lg bg-white/4">
      <div className="relative h-[168px] w-full bg-[radial-gradient(ellipse_50%_60%_at_50%_55%,#7DD0FF24,#7DD0FF00)]">
        <AnimatePresence initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={easeTransition(0.24)}
            className="absolute inset-0 flex items-center justify-center"
          >
            {step === 0 ? (
              <SoapScene className="h-[168px] w-auto" />
            ) : step === 1 ? (
              <FirstAidIllustration className="h-[160px] w-auto text-[#7DD0FF]" />
            ) : (
              <ShieldPlus aria-hidden strokeWidth={1.25} className="size-[88px] text-[#7DD0FF]" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div aria-live="polite" className="flex flex-col gap-2 px-4 pt-3.5 pb-4">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold tracking-[1px] text-[#7DD0FF] uppercase">
            {t(m.common.stepOf, { n: step + 1, total: steps.length })}
          </span>
          <span className="font-medium whitespace-nowrap text-[#C4E7FF] tabular-nums">{current.window}</span>
        </div>
        <p className="text-lg font-medium">{current.title}</p>
        <p className="text-[13px]/[1.4] text-[#A9D8F5]">{current.next}</p>
        <div aria-hidden className="flex gap-1 pt-1">
          {fills.map((fill, i) => (
            <div key={i} className="h-1 flex-1 overflow-hidden rounded-[2px] bg-white/12">
              <div
                className="h-full origin-left rounded-[2px] bg-[#7DD0FF] transition-transform duration-1000 ease-linear motion-reduce:transition-none"
                style={{ transform: `scaleX(${fill})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Pertolongan pertama (pen `BIUma` idle, `E8Ofxp` running). Always-dark screen in both
 * themes, so the design's literal dark palette is used instead of theme tokens.
 */
export function FirstAidScreen() {
  const { m } = useI18n()
  const f = m.firstAid
  const [status, setStatus] = useState<Status>("idle")
  const [remaining, setRemaining] = useState(TOTAL_MS)
  const endAt = useRef(0)

  // Countdown: recompute remaining from the stored end timestamp every second.
  useEffect(() => {
    if (status !== "running") return
    const id = window.setInterval(() => {
      const left = Math.max(0, endAt.current - Date.now())
      setRemaining(left)
      if (left === 0) {
        window.clearInterval(id)
        setStatus("done")
        navigator.vibrate?.(400)
        toast(f.done.toast)
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [status, f.done.toast])

  // Keep the screen awake while counting.
  useEffect(() => {
    if (status !== "running") return
    let lock: WakeLockSentinel | null = null
    let cancelled = false
    navigator.wakeLock
      ?.request("screen")
      .then((l) => {
        if (cancelled) void l.release().catch(() => {})
        else lock = l
      })
      .catch(() => {})
    return () => {
      cancelled = true
      void lock?.release().catch(() => {})
    }
  }, [status])

  function start() {
    endAt.current = Date.now() + remaining
    setStatus("running")
  }
  function pause() {
    setRemaining(Math.max(0, endAt.current - Date.now()))
    setStatus("paused")
  }

  const headline = status === "idle" ? f.idle.headline : status === "done" ? f.done.headline : f.running.headline
  const ctaClass =
    "flex h-[58px] w-full items-center justify-center gap-2.5 rounded-full text-base font-medium transition-colors duration-[160ms] ease-[var(--ease-raksa)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#7DD0FF] [&_svg]:size-5"
  const whiteCta = cn(ctaClass, "bg-white text-[#001E2C] hover:bg-[#E4F2FB]")

  return (
    <Screen layout="immersive" className="bg-[linear-gradient(180deg,#001E2C_0%,#06202E_100%)] text-white">
      <header className="flex h-[76px] shrink-0 items-center justify-between pt-3 pr-2 pl-5 md:pr-6 md:pl-8">
        <LogoHeader inverse />
        <Link
          href="/beranda"
          aria-label={m.common.close}
          className="relative flex size-11 items-center justify-center rounded-full bg-white/8 transition-colors before:absolute before:-inset-0.5 before:content-[''] hover:bg-white/15 focus-visible:outline-3 focus-visible:outline-[#7DD0FF]"
        >
          <X aria-hidden strokeWidth={1.75} className="size-5" />
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col lg:max-w-[960px]">
        <div className="flex flex-1 flex-col items-center gap-7 px-6 pt-4 pb-6 md:justify-center lg:gap-12">
          <div className="relative flex w-full justify-center text-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.h1 key={headline} {...fade} className="text-[32px]/[normal] font-bold">
                {headline}
              </motion.h1>
            </AnimatePresence>
          </div>

          <div className="flex w-full flex-col items-center gap-7 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className="flex justify-center">
              <TimerRing remaining={remaining} label={f.timeSub} />
            </div>

            <SceneCard status={status} remaining={remaining} />
          </div>
        </div>

        <footer className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-3.5 px-6 pb-7">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={status} {...fade} className="w-full">
              {status === "idle" ? (
                <button type="button" onClick={start} className={whiteCta}>
                  <Play aria-hidden strokeWidth={1.75} />
                  {f.idle.cta}
                </button>
              ) : status === "done" ? (
                <Link href="/lapor" className={whiteCta}>
                  {f.done.cta}
                  <ArrowRight aria-hidden strokeWidth={1.75} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={status === "running" ? pause : start}
                  className={cn(ctaClass, "bg-white/12 text-white outline-1 -outline-offset-[0.5px] outline-white/20 hover:bg-white/20")}
                >
                  {status === "running" ? <Pause aria-hidden strokeWidth={1.75} /> : <Play aria-hidden strokeWidth={1.75} />}
                  {status === "running" ? f.running.pause : f.running.resume}
                </button>
              )}
            </motion.div>
          </AnimatePresence>
          {status !== "done" ? (
            <Link href="/lapor" className="relative inline-flex h-4 items-center gap-1.5 rounded-xs text-sm font-medium text-[#C4E7FF] before:absolute before:inset-x-0 before:-inset-y-4 before:content-[''] [&_svg]:size-4">
              {status === "idle" ? f.idle.skip : f.running.skip}
              <ArrowRight aria-hidden strokeWidth={1.75} />
            </Link>
          ) : null}
        </footer>
      </div>
    </Screen>
  )
}
