"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Droplets, Images, SwitchCamera } from "lucide-react"

import woundLive from "@/public/demo/wound-live.png"
import { useI18n } from "@/lib/i18n/provider"
import { createRecorder } from "@/lib/media"
import { cn } from "@/lib/utils"

import { CameraView, CaptureButton, SideAction, useCamera } from "../camera-view"
import { setDraftMedia } from "../report-draft"

const MIN_SECONDS = 5
const MAX_SECONDS = 10

const clock = (s: number) => `0:${String(s).padStart(2, "0")}`

/** Scan luka — Rekam (`E1WsTe`): records the wound for 5–10 s, then goes to the analysis. */
export function ScanScreen() {
  const router = useRouter()
  const { m, t } = useI18n()
  const copy = m.scan.camera
  const camera = useCamera()
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const recorder = useRef<MediaRecorder | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const submitVideo = (blob: Blob) => {
    setDraftMedia("videoUrl", blob)
    router.push("/lapor/scan/analisis")
  }

  // Elapsed time while recording; auto-stop at 10 s.
  useEffect(() => {
    if (!recording) return
    const started = performance.now()
    const id = window.setInterval(() => {
      const seconds = Math.min(MAX_SECONDS, Math.floor((performance.now() - started) / 1000))
      setElapsed(seconds)
      if (seconds >= MAX_SECONDS && recorder.current?.state === "recording") recorder.current.stop()
    }, 200)
    return () => window.clearInterval(id)
  }, [recording])

  // Leaving the screen mid-recording discards the clip.
  useEffect(
    () => () => {
      const active = recorder.current
      if (active && active.state !== "inactive") {
        active.onstop = null
        active.stop()
      }
    },
    [],
  )

  const start = () => {
    if (!camera.stream) return
    const rec = createRecorder(camera.stream)
    const chunks: Blob[] = []
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }
    rec.onstop = () => {
      setRecording(false)
      submitVideo(new Blob(chunks, { type: rec.mimeType || "video/webm" }))
    }
    recorder.current = rec
    rec.start(250)
    setElapsed(0)
    setRecording(true)
  }

  const stop = () => {
    if (elapsed >= MIN_SECONDS && recorder.current?.state === "recording") recorder.current.stop()
  }

  const canStop = elapsed >= MIN_SECONDS

  return (
    <CameraView
      camera={camera}
      poster={woundLive}
      reticle={{ width: 300, height: 300, top: 150, color: "white", scanLineTop: 170 }}
      topCenter={
        <div className="flex items-center gap-2 rounded-full bg-black/30 px-3.5 py-2">
          <span
            aria-hidden
            className={cn(
              "size-2.5 rounded-full bg-destructive",
              recording ? "animate-pulse motion-reduce:animate-none" : "opacity-60",
            )}
          />
          <span role="timer" className="text-sm font-medium whitespace-nowrap text-white tabular-nums">
            {t(copy.timer, { elapsed: clock(elapsed), max: clock(MAX_SECONDS) })}
          </span>
        </div>
      }
      guideIcon={Droplets}
      guide={copy.guide}
      deniedText={copy.denied}
      title={copy.title}
      sub={copy.sub}
      flashLabels={{ on: copy.flashOn, off: copy.flashOff }}
      left={
        <SideAction
          icon={Images}
          label={copy.gallery}
          disabled={recording}
          onClick={() => fileInput.current?.click()}
        />
      }
      center={
        <CaptureButton
          label={recording ? (canStop ? copy.stop : copy.stopTooEarly) : copy.record}
          onClick={recording ? stop : start}
          disabled={recording ? !canStop : !camera.live}
        >
          <span
            className={cn(
              "bg-destructive transition-all duration-[160ms] ease-[var(--ease-raksa)]",
              recording ? "size-[30px] rounded-sm" : "size-16 rounded-full",
            )}
          />
        </CaptureButton>
      }
      right={
        <SideAction icon={SwitchCamera} label={copy.flip} disabled={recording || !camera.stream} onClick={camera.flip} />
      }
      hiddenInput={
        <input
          ref={fileInput}
          type="file"
          accept="video/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) submitVideo(file)
          }}
        />
      }
    />
  )
}
