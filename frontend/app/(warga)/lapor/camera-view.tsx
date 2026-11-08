"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import Image, { type StaticImageData } from "next/image"
import { useRouter } from "next/navigation"
import { CameraOff, X, Zap, ZapOff, type LucideIcon } from "lucide-react"

import { Screen } from "@/components/raksa/screen"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useI18n } from "@/lib/i18n/provider"
import { requestCamera, stopStream } from "@/lib/media"
import { cn } from "@/lib/utils"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const

type Facing = "environment" | "user"
type CameraState = {
  stream: MediaStream | null
  error: "denied" | "unavailable" | null
  torchSupported: boolean
  torchOn: boolean
}

export type Camera = {
  facing: Facing
  stream: MediaStream | null
  error: "denied" | "unavailable" | null
  /** True once the current stream is playing in the `<video>`. */
  live: boolean
  torchSupported: boolean
  torchOn: boolean
  attachVideo: (el: HTMLVideoElement | null) => void
  /** Current video frame as a JPEG; `null` when no frame is available. */
  captureFrame: () => Promise<Blob | null>
  onPlaying: () => void
  flip: () => void
  toggleTorch: () => Promise<void>
}

/**
 * Live camera for the lapor capture screens. Requests the camera for the current facing mode,
 * stops every track when the facing changes or the screen unmounts.
 */
export function useCamera(initialFacing: Facing = "environment"): Camera {
  const [facing, setFacing] = useState<Facing>(initialFacing)
  const [state, setState] = useState<CameraState>({ stream: null, error: null, torchSupported: false, torchOn: false })
  const [playing, setPlaying] = useState<MediaStream | null>(null)
  const videoEl = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    let cancelled = false
    let current: MediaStream | null = null
    requestCamera(facing).then((res) => {
      if (cancelled) {
        if ("stream" in res) stopStream(res.stream)
        return
      }
      if ("stream" in res) {
        current = res.stream
        const track = res.stream.getVideoTracks()[0]
        const caps = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined
        setState({ stream: res.stream, error: null, torchSupported: Boolean(caps?.torch), torchOn: false })
      } else {
        setState({ stream: null, error: res.error, torchSupported: false, torchOn: false })
      }
    })
    return () => {
      cancelled = true
      stopStream(current)
    }
  }, [facing])

  const stream = state.stream
  const attachVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      videoEl.current = el
      if (el && el.srcObject !== stream) el.srcObject = stream
    },
    [stream],
  )

  const flip = useCallback(() => setFacing((f) => (f === "environment" ? "user" : "environment")), [])

  const toggleTorch = useCallback(async () => {
    const track = stream?.getVideoTracks()[0]
    if (!track) return
    const next = !state.torchOn
    try {
      await track.applyConstraints({ advanced: [{ torch: next }] } as unknown as MediaTrackConstraints)
      setState((s) => (s.stream === stream ? { ...s, torchOn: next } : s))
    } catch {
      // Torch not controllable on this device; keep the current state.
    }
  }, [stream, state.torchOn])

  const captureFrame = useCallback(() => {
    const video = videoEl.current
    if (!video || video.videoWidth === 0) return Promise.resolve(null)
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height)
    const { promise, resolve } = Promise.withResolvers<Blob | null>()
    canvas.toBlob(resolve, "image/jpeg", 0.9)
    return promise
  }, [])

  return {
    facing,
    stream,
    error: state.error,
    live: stream !== null && playing === stream,
    torchSupported: state.torchSupported,
    torchOn: state.torchOn,
    attachVideo,
    captureFrame,
    onPlaying: () => setPlaying(stream),
    flip,
    toggleTorch,
  }
}

/** Round 44px translucent button of the camera top bar (`E1WsTe` Close / Flash). */
function TopButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-black/30 text-white transition-colors duration-[160ms] ease-[var(--ease-raksa)] hover:bg-black/45 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring before:absolute before:-inset-0.5 before:content-['']"
    >
      {children}
    </button>
  )
}

/** Labeled 48px side action under the viewfinder (`E1WsTe` Galeri / Balik, `Y3eAG` Isi manual). */
export function SideAction({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group/side flex w-[72px] shrink-0 flex-col items-center gap-1.5 rounded-md outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-40"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-[160ms] ease-[var(--ease-raksa)] group-hover/side:bg-white/20">
        <Icon {...ICON} className="size-[22px]" />
      </span>
      <span className="text-xs font-medium whitespace-nowrap text-[#C1C7CE]">{label}</span>
    </button>
  )
}

/** Corner path of the reticle (`E1WsTe` Corner), 40×40, rotated per corner. */
function Corner({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden
      className={cn("absolute size-10 origin-top-left overflow-visible", className)}
    >
      <path
        d="M0 40v-28a12 12 0 0 1 12-12h28"
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** Moves the scan line up and down inside the reticle; skipped with reduced motion. */
function useScanLineRef(height: number) {
  return useCallback(
    (el: HTMLDivElement | null) => {
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      const animation = el.animate([{ top: "16px" }, { top: `${height - 18}px` }], {
        duration: 2000,
        iterations: Infinity,
        direction: "alternate",
        easing: "cubic-bezier(0.22,1,0.36,1)",
      })
      return () => animation.cancel()
    },
    [height],
  )
}

/**
 * Full-bleed camera screen layout shared by the wound scan (`E1WsTe`) and vaccine card
 * (`Y3eAG`/`kDuvX`) screens: viewfinder (poster until the stream plays), top bar, reticle,
 * guide card, then title + three controls on the dark base.
 */
export function CameraView({
  camera,
  poster,
  blurred = false,
  reticle,
  topCenter,
  guideIcon: GuideIcon,
  guide,
  deniedText,
  title,
  sub,
  left,
  center,
  right,
  flashLabels,
  hiddenInput,
}: {
  camera: Camera
  poster: StaticImageData
  /** `kDuvX`: blurred poster, white reticle without scan line. */
  blurred?: boolean
  /** `scanLineTop` = resting position of the scan line (design), `null` hides it. */
  reticle: { width: number; height: number; top: number; color: "white" | "primary"; scanLineTop: number | null }
  topCenter: ReactNode
  guideIcon: LucideIcon
  guide: string
  deniedText: string
  title: string
  sub: string
  left: ReactNode
  center: ReactNode
  right: ReactNode
  flashLabels: { on: string; off: string }
  hiddenInput?: ReactNode
}) {
  const router = useRouter()
  const { m } = useI18n()
  const { error, live, stream, facing, torchSupported, torchOn, attachVideo, onPlaying, toggleTorch } = camera
  const denied = error !== null
  const scanLineRef = useScanLineRef(reticle.height)

  return (
    <Screen layout="immersive" className="h-dvh min-h-0 overflow-hidden bg-[#0A0F12] md:items-center md:pt-6">
      {/* Mobile = the full-bleed design. md+: the same column centered at 480px on the dark base, viewfinder rounded. */}
      <div className="relative flex min-h-0 w-full flex-1 flex-col justify-between overflow-hidden rounded-b-xl md:max-w-[480px] md:rounded-xl">
        <Image
          src={poster}
          alt=""
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className={cn(
            "object-cover transition-opacity duration-200",
            blurred && "scale-105 blur-[7px]",
            denied && "opacity-40",
            live && "opacity-0",
          )}
        />
        {stream ? (
          <video
            ref={attachVideo}
            autoPlay
            playsInline
            muted
            onPlaying={onPlaying}
            className={cn(
              "absolute inset-0 size-full object-cover",
              facing === "user" && "-scale-x-100",
              !live && "opacity-0",
            )}
          />
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[180px] bg-linear-to-b from-black/65 to-transparent" />

        <div className="relative z-10 flex h-[76px] w-full shrink-0 items-center justify-between px-4 pt-3">
          <TopButton label={m.common.close} onClick={() => router.back()}>
            <X {...ICON} className="size-5" />
          </TopButton>
          {topCenter}
          {torchSupported ? (
            <TopButton
              label={torchOn ? flashLabels.off : flashLabels.on}
              onClick={() => void toggleTorch()}
            >
              {torchOn ? <Zap {...ICON} className="size-5" /> : <ZapOff {...ICON} className="size-5" />}
            </TopButton>
          ) : (
            <span aria-hidden className="size-11 shrink-0" />
          )}
        </div>

        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-1/2 z-10 -translate-x-1/2",
            reticle.color === "white" ? "text-white" : "text-primary-fixed-dim",
          )}
          style={{ width: reticle.width, height: reticle.height, top: reticle.top }}
        >
          <Corner className="top-0 left-0" />
          <Corner className="top-0 left-full rotate-90" />
          <Corner className="top-full left-full rotate-180" />
          <Corner className="top-full left-0 -rotate-90" />
          {reticle.scanLineTop !== null ? (
            <div
              ref={scanLineRef}
              className="absolute left-4 h-0.5 w-[calc(100%-32px)] bg-linear-to-r from-[#8BD3EA]/0 via-[#8BD3EA] to-[#8BD3EA]/0"
              style={{ top: reticle.scanLineTop }}
            />
          ) : null}
        </div>

        <div className="relative z-10 flex w-full shrink-0 flex-col gap-2 px-5 pb-5">
          {denied ? (
            <Alert variant="overlay">
              <CameraOff {...ICON} />
              <AlertDescription>{deniedText}</AlertDescription>
            </Alert>
          ) : null}
          {/* The blurred-photo message (`kDuvX`) is a result, so it stays even without a camera. */}
          {!denied || blurred ? (
            <Alert variant="overlay" role={blurred ? "alert" : "note"}>
              <GuideIcon {...ICON} />
              <AlertDescription>{guide}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col items-center gap-[18px] px-8 pt-5 pb-[max(32px,env(safe-area-inset-bottom))] md:max-w-[480px]">
        <div className="flex flex-col items-center gap-1 text-center" aria-live="polite">
          <h1 className="text-base font-medium text-white">{title}</h1>
          <p className="text-sm text-[#C1C7CE]">{sub}</p>
        </div>
        <div className="flex w-full items-center justify-between">
          {left}
          {center}
          {right}
        </div>
      </div>
      {hiddenInput}
    </Screen>
  )
}

/** 84px capture button ring (`E1WsTe` Record Button / `Y3eAG` shutter). */
export function CaptureButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-[84px] shrink-0 items-center justify-center rounded-full bg-white/25 transition-opacity duration-[160ms] ease-[var(--ease-raksa)] outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}
