"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Play, RotateCcw, VideoOff } from "lucide-react"

import { EditFieldSheet } from "@/components/raksa/edit-field-sheet"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LabeledInput } from "@/components/raksa/labeled-input"
import { Screen } from "@/components/raksa/screen"
import woundThumb from "@/public/demo/wound-thumb.png"
import { demo } from "@/lib/demo-data"
import { useI18n } from "@/lib/i18n/provider"
import type { ScanFlag, ScanRow } from "@/lib/types"

import { updateDraft, useDraftMedia, useReportDraft } from "../../report-draft"
import { Disclaimer, Findings, ResultFooter, ResultList, ResultRow, ResultSummary, SubpageBar } from "../../result-parts"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const

/** Only warning flags are shown as badges (`H3lkO`); `tercatat`/`perkiraan` rows have none. */
const WARN_FLAGS: readonly ScanFlag[] = ["area_berisiko", "perlu_perhatian"]

/** Scan luka — Hasil AI (`H3lkO`): what the AI read from the wound video; rows are editable. */
export function ScanResultScreen() {
  const router = useRouter()
  const { m, locale } = useI18n()
  const copy = m.scan.result
  const draft = useReportDraft()
  const { videoUrl } = useDraftMedia()
  const video = useRef<HTMLVideoElement>(null)
  const [editing, setEditing] = useState<ScanRow["field"] | null>(null)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")

  const save = () => {
    const value = text.trim()
    if (!editing || !value) return
    updateDraft({
      scanRows: draft.scanRows.map((r) => (r.field === editing ? { ...r, value: { id: value, en: value } } : r)),
    })
  }

  const playBadge = (
    <span className="flex size-7 items-center justify-center rounded-full bg-white/90 text-primary-deep">
      <Play {...ICON} className="size-3.5" />
    </span>
  )

  return (
    <Screen>
      <SubpageBar title={copy.title} />
      <div className="flex w-full flex-1 flex-col gap-5 px-5 py-2">
        <ResultSummary
          title={
            draft.scan === null
              ? demo.reportDemo.scanResult.title[locale]
              : draft.scan.mode === "ai"
                ? copy.aiTitle
                : copy.manualTitle
          }
          thumb={
            videoUrl ? (
              <button
                type="button"
                aria-label={copy.playVideo}
                onClick={() => {
                  const el = video.current
                  if (!el) return
                  if (el.paused) void el.play()
                  else el.pause()
                }}
                className="relative flex size-full items-center justify-center"
              >
                <video
                  ref={video}
                  src={`${videoUrl}#t=0.1`}
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 size-full object-cover"
                />
                <span className="relative">{playBadge}</span>
              </button>
            ) : (
              <>
                <Image src={woundThumb} alt="" fill sizes="76px" className="object-cover" />
                <span aria-hidden className="relative">
                  {playBadge}
                </span>
              </>
            )
          }
        />

        {draft.scan?.mode === "manual" ? (
          <Alert>
            <VideoOff {...ICON} />
            <AlertDescription>{copy.manualReason[draft.scan.reason ?? "ai_unavailable"]}</AlertDescription>
          </Alert>
        ) : null}

        {draft.scanRows.length > 0 ? (
          <Findings title={copy.findings} hint={copy.hint}>
            <ResultList>
              {draft.scanRows.map((row) => (
                <ResultRow
                  key={row.field}
                  label={copy.fields[row.field]}
                  value={row.value[locale]}
                  badge={WARN_FLAGS.includes(row.flag) ? { label: m.enums.scanFlag[row.flag], tone: "soon" } : undefined}
                  onEdit={() => {
                    setText(row.value[locale])
                    setEditing(row.field)
                    setOpen(true)
                  }}
                />
              ))}
            </ResultList>
          </Findings>
        ) : null}

        <Disclaimer>{copy.disclaimer}</Disclaimer>
      </div>

      <ResultFooter
        primary={copy.use}
        onPrimary={() => router.push("/lapor/konfirmasi")}
        secondary={copy.retake}
        secondaryIcon={RotateCcw}
        onSecondary={() => router.push("/lapor/scan")}
      />

      <EditFieldSheet
        open={open}
        onOpenChange={setOpen}
        title={editing ? copy.fields[editing] : ""}
        onSave={save}
      >
        {editing ? (
          <LabeledInput
            label={copy.fields[editing]}
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
        ) : null}
      </EditFieldSheet>
    </Screen>
  )
}
