"use client"

import { CalendarClock, Droplet, Dog, Hand, Keyboard, MapPin, MicOff } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { AppHeader } from "@/components/raksa/app-header"
import { MicButton } from "@/components/raksa/mic-button"
import { BottomBar } from "@/components/raksa/bottom-bar"
import { FlowHeader } from "@/components/raksa/flow-header"
import { LabeledTextarea } from "@/components/raksa/labeled-input"
import { Screen } from "@/components/raksa/screen"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { isBiteStory } from "@/lib/demo-ai"
import { demo } from "@/lib/demo-data"
import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition, fadeUp, staggerParent } from "@/lib/motion"
import { createRecorder, requestMic, stopStream } from "@/lib/media"

import { updateDraft } from "./report-draft"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const
const MAX_RECORD_S = 60

export function LaporScreen() {
  const params = useSearchParams()
  const micDenied = params.get("keadaan") === "mikrofon-ditolak"
  if (micDenied || params.get("mode") === "ketik") return <TypedStory micDenied={micDenied} />
  return <VoiceStory />
}

function VoiceStory() {
  const router = useRouter()
  const { m, locale } = useI18n()
  const v = m.lapor.voice
  const [state, setState] = useState<"idle" | "recording" | "processing">("idle")
  const [elapsed, setElapsed] = useState(0)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const timersRef = useRef<number[]>([])

  useEffect(
    () => () => {
      timersRef.current.forEach((id) => window.clearTimeout(id))
      if (recorderRef.current?.state === "recording") recorderRef.current.stop()
      stopStream(streamRef.current)
    },
    [],
  )

  function finish() {
    timersRef.current.forEach((id) => window.clearInterval(id))
    timersRef.current = []
    if (recorderRef.current?.state === "recording") recorderRef.current.stop()
    stopStream(streamRef.current)
    streamRef.current = null
    setState("processing")
    timersRef.current.push(
      window.setTimeout(() => {
        updateDraft({ story: demo.reportDemo.storyTranscript[locale] })
        router.push("/lapor/pertanyaan/1")
      }, 1200),
    )
  }

  async function start() {
    const result = await requestMic()
    if ("error" in result) {
      router.replace("/lapor?keadaan=mikrofon-ditolak")
      return
    }
    streamRef.current = result.stream
    const recorder = createRecorder(result.stream)
    recorderRef.current = recorder
    recorder.start()
    const startedAt = Date.now()
    setElapsed(0)
    setState("recording")
    timersRef.current.push(
      window.setInterval(() => {
        const s = Math.floor((Date.now() - startedAt) / 1000)
        setElapsed(Math.min(s, MAX_RECORD_S))
        if (s >= MAX_RECORD_S) finish()
      }, 250),
    )
  }

  const elapsedLabel = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`
  const hints = [
    { icon: CalendarClock, label: v.hints.when },
    { icon: MapPin, label: v.hints.where },
    { icon: Dog, label: v.hints.animal },
    { icon: Hand, label: v.hints.bodyPart },
    { icon: Droplet, label: v.hints.bleeding },
  ]

  return (
    <Screen>
      <FlowHeader step={1} total={3} />
      <div className="flex flex-1 flex-col items-center gap-6 px-6 pt-5 pb-2">
        <div className="flex w-full flex-col items-center gap-2.5">
          <h1 className="text-[32px]/[normal] font-bold text-foreground">{v.title}</h1>
          <p className="w-full text-center text-base/6 text-muted-foreground">{v.sub}</p>
        </div>
        <MicButton
          state={state}
          onClick={state === "idle" ? start : state === "recording" ? finish : undefined}
          elapsedLabel={elapsedLabel}
        />
        <div className="flex flex-col items-center gap-1" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={state}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={easeTransition(DURATION.quick)}
              className="text-base font-medium text-foreground"
            >
              {state === "idle" ? v.micTitle : state === "recording" ? v.recordingTitle : v.processingTitle}
            </motion.p>
          </AnimatePresence>
          <p className="text-sm text-muted-foreground tabular-nums">
            {state === "recording" ? `${elapsedLabel} / 1:00` : v.micSub}
          </p>
        </div>
        <div className="flex w-full flex-col items-center gap-2.5">
          <p className="text-xs font-medium tracking-[0.6px] text-muted-foreground">{v.hintsLabel}</p>
          <motion.ul
            variants={staggerParent(0.04, 0.12)}
            initial="hidden"
            animate="show"
            className="flex max-w-[330px] flex-wrap justify-center gap-x-2 gap-y-2.5"
          >
            {hints.map(({ icon: Icon, label: hint }) => (
              <motion.li
                key={hint}
                variants={fadeUp}
                className="flex items-center gap-1.5 rounded-full bg-card px-3 py-2 outline outline-1 -outline-offset-[0.5px] outline-border"
              >
                <Icon {...ICON} className="size-[15px] text-primary" />
                <span className="text-sm font-medium text-foreground">{hint}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-3 px-6 pt-5 pb-7">
        <Button asChild variant="secondary" className="w-full bg-muted text-primary hover:bg-surface-container-highest [&_svg]:size-5">
          <Link href="/lapor?mode=ketik">
            <Keyboard {...ICON} />
            {v.typeInstead}
          </Link>
        </Button>
        <Link
          href="/lapor/formulir"
          className="relative inline-flex h-4 items-center rounded-xs text-sm font-medium text-primary before:absolute before:inset-x-0 before:-inset-y-4 before:content-[''] focus-visible:outline-3 focus-visible:outline-focus-ring"
        >
          {v.formLink}
        </Link>
      </div>
    </Screen>
  )
}

function TypedStory({ micDenied }: { micDenied: boolean }) {
  const router = useRouter()
  const { m } = useI18n()
  const ty = m.lapor.typed
  const [text, setText] = useState("")
  const [tab, setTab] = useState("story")
  const [error, setError] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const story = text.trim()
    if (!story) {
      setError(true)
      return
    }
    if (isBiteStory(story)) {
      updateDraft({ story })
      router.push("/lapor/pertanyaan/1")
    } else {
      router.push("/lapor/bukan-gigitan")
    }
  }

  function goTo(next: string) {
    setTab(next)
    if (next === "voice") router.push("/lapor")
    if (next === "form") router.push("/lapor/formulir")
  }

  return (
    <Screen>
      <AppHeader />
      <form onSubmit={submit} noValidate className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-6 px-4 py-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-[32px]/[35px] font-bold text-foreground">{ty.title}</h1>
            <p className="text-base/[26px] text-muted-foreground">{ty.sub}</p>
          </div>
          <Tabs value={tab} onValueChange={goTo}>
            <TabsList aria-label={ty.title}>
              <TabsTrigger value="story">{ty.tabs.story}</TabsTrigger>
              <TabsTrigger value="voice" disabled={micDenied}>
                {ty.tabs.voice}
              </TabsTrigger>
              <TabsTrigger value="form">{ty.tabs.form}</TabsTrigger>
            </TabsList>
          </Tabs>
          {micDenied ? (
            <Alert>
              <MicOff {...ICON} />
              <AlertDescription>{ty.micDenied}</AlertDescription>
            </Alert>
          ) : null}
          <LabeledTextarea
            label={ty.label}
            placeholder={ty.placeholder}
            value={text}
            maxLength={1000}
            fieldClassName="h-[200px]"
            error={error ? m.common.required : undefined}
            onChange={(e) => {
              setText(e.target.value)
              if (error) setError(false)
            }}
          />
        </div>
        <BottomBar>
          <Button type="submit">{ty.submit}</Button>
        </BottomBar>
      </form>
    </Screen>
  )
}
