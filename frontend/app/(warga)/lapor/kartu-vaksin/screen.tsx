"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { EyeOff, Images, LoaderCircle, PencilLine, Sun } from "lucide-react"

import vaccineCard from "@/public/demo/vaccine-card.png"
import { useI18n } from "@/lib/i18n/provider"

import { CameraView, CaptureButton, SideAction, useCamera } from "../camera-view"
import { setDraftMedia } from "../report-draft"

const PROCESSING_MS = 1200

/**
 * Kartu vaksin — Kamera (`Y3eAG`); `?keadaan=buram` shows the unreadable-photo state (`kDuvX`).
 * The shutter grabs the current video frame; reading the card is simulated with demo data.
 */
export function VaccineCardScreen() {
  const router = useRouter()
  const blurry = useSearchParams().get("keadaan") === "buram"
  const { m } = useI18n()
  const copy = m.vaccineCard.camera
  const camera = useCamera()
  const [processing, setProcessing] = useState(false)
  const timer = useRef<number | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  const submitPhoto = (blob: Blob) => {
    setDraftMedia("photoUrl", blob)
    setProcessing(true)
    timer.current = window.setTimeout(() => router.push("/lapor/kartu-vaksin/hasil"), PROCESSING_MS)
  }

  const capture = async () => {
    if (processing) return
    const blob = await camera.captureFrame()
    if (blob) submitPhoto(blob)
  }

  return (
    <CameraView
      camera={camera}
      poster={vaccineCard}
      blurred={blurry}
      reticle={{ width: 330, height: 210, top: 200, color: blurry ? "white" : "primary", scanLineTop: blurry ? null : 104 }}
      topCenter={
        <div className="flex items-center gap-2 rounded-full bg-black/30 px-3.5 py-2 text-sm font-medium whitespace-nowrap text-white">
          <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-destructive" />
          {copy.pill}
        </div>
      }
      guideIcon={blurry ? EyeOff : Sun}
      guide={blurry ? copy.blurryGuide : copy.guide}
      deniedText={copy.denied}
      title={processing ? copy.processing : blurry ? copy.blurryTitle : copy.title}
      sub={blurry ? copy.blurrySub : copy.sub}
      flashLabels={{ on: copy.flashOn, off: copy.flashOff }}
      left={
        <SideAction
          icon={Images}
          label={copy.gallery}
          disabled={processing}
          onClick={() => fileInput.current?.click()}
        />
      }
      center={
        <CaptureButton label={copy.shutter} onClick={capture} disabled={!processing && !camera.live}>
          <span className="flex size-16 items-center justify-center rounded-full bg-white">
            {processing ? (
              <LoaderCircle
                strokeWidth={1.75}
                aria-hidden
                className="size-7 animate-spin text-primary motion-reduce:animate-none"
              />
            ) : null}
          </span>
        </CaptureButton>
      }
      right={
        <SideAction
          icon={PencilLine}
          label={copy.manual}
          disabled={processing}
          onClick={() => router.push("/lapor/kartu-vaksin/hasil?manual=1")}
        />
      }
      hiddenInput={
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) submitPhoto(file)
          }}
        />
      }
    />
  )
}
