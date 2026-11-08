"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Check, CircleDashed, LoaderCircle, Video } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"

import { AiConsentSheet } from "@/components/raksa/ai-consent-sheet"
import { Screen } from "@/components/raksa/screen"
import woundVideoThumb from "@/public/demo/wound-video-thumb.png"
import { getAiConsent, setAiConsent } from "@/lib/ai-consent"
import { ApiError, scanWound } from "@/lib/api"
import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition, fadeUp, staggerParent } from "@/lib/motion"
import { scanDraftPatch } from "@/lib/scan-result"
import { cn } from "@/lib/utils"

import { getDraftBlob, updateDraft, useDraftMedia } from "../../report-draft"
import { SubpageBar } from "../../result-parts"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const
const STEP_MS = 1500
/** Duration shown on the sample thumbnail (`q45po`). */
const SAMPLE_DURATION = "0:08"

const clock = (seconds: number) => {
  const s = Math.round(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

/** Scan luka — Menganalisis (`q45po`): uploads the wound video while the checklist runs, then the result. */
export function ScanAnalysisScreen() {
  const router = useRouter()
  const { m } = useI18n()
  const copy = m.scan.analysis
  const { videoUrl } = useDraftMedia()
  const [active, setActive] = useState(0)
  const [duration, setDuration] = useState<number | null>(null)
  const [scanDone, setScanDone] = useState(false)
  const [consentOpen, setConsentOpen] = useState(false)
  /** StrictMode runs mount effects twice; upload once. */
  const startedRef = useRef(false)

  async function runScan(video: Blob) {
    try {
      updateDraft(scanDraftPatch(await scanWound(video)))
    } catch (e) {
      const rejected = e instanceof ApiError && [413, 415, 422].includes(e.status)
      updateDraft({ scan: { mode: "manual", reason: rejected ? "rejected" : "ai_unavailable" }, scanRows: [] })
    } finally {
      setScanDone(true)
    }
  }

  function decline() {
    setAiConsent("declined")
    setConsentOpen(false)
    toast(copy.declined)
    router.replace("/lapor/konfirmasi")
  }

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    void (async () => {
      const video = getDraftBlob("videoUrl")
      // No recorded video (opened from the demo index): keep the simulated checklist and demo rows.
      if (!video) {
        setScanDone(true)
        return
      }
      const consent = getAiConsent()
      if (consent === "declined") {
        toast(copy.declined)
        router.replace("/lapor/konfirmasi")
      } else if (consent === null) setConsentOpen(true)
      else await runScan(video)
    })()
    // Mount-only: runs the upload once per visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (active >= copy.steps.length) {
      router.replace("/lapor/scan/hasil")
      return
    }
    // The last step spins until the upload returns.
    if (active === copy.steps.length - 1 && !scanDone) return
    const id = window.setTimeout(() => setActive((a) => a + 1), STEP_MS)
    return () => window.clearTimeout(id)
  }, [active, copy.steps.length, router, scanDone])

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

  // Metadata can load before React's media listeners see it, so the ref reads it on attach too.
  // MediaRecorder WebM reports `Infinity` until seeked past the end; the real value then arrives
  // in `durationchange`, after which the poster frame is restored.
  const readDuration = (el: HTMLVideoElement | null) => {
    if (!el || el.readyState < HTMLMediaElement.HAVE_METADATA) return
    if (Number.isFinite(el.duration)) {
      if (el.dataset.probing) {
        delete el.dataset.probing
        el.currentTime = 0.1
      }
      setDuration(el.duration)
    } else if (el.duration === Infinity && !el.dataset.probing) {
      el.dataset.probing = "1"
      el.currentTime = Number.MAX_SAFE_INTEGER
    }
  }

  const durationLabel = videoUrl ? (duration !== null ? clock(duration) : null) : SAMPLE_DURATION

  return (
    <Screen>
      <SubpageBar title={copy.title} />
      <div className="flex w-full flex-1 flex-col items-center gap-7 px-6 pt-4 pb-8">
        <div className="relative h-[300px] w-[260px] shrink-0 overflow-hidden rounded-xl bg-muted">
          {videoUrl ? (
            <video
              ref={readDuration}
              src={`${videoUrl}#t=0.1`}
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => readDuration(e.currentTarget)}
              onDurationChange={(e) => readDuration(e.currentTarget)}
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
      <AiConsentSheet
        open={consentOpen}
        onDismiss={decline}
        onDecide={(granted) => {
          if (!granted) return decline()
          setAiConsent("granted")
          setConsentOpen(false)
          const video = getDraftBlob("videoUrl")
          if (video) void runScan(video)
          else setScanDone(true)
        }}
      />
    </Screen>
  )
}
