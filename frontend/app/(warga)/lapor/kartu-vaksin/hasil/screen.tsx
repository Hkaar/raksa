"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Camera, NotebookPen, ScanText } from "lucide-react"

import { EditFieldSheet } from "@/components/raksa/edit-field-sheet"
import { LabeledInput } from "@/components/raksa/labeled-input"
import { Screen } from "@/components/raksa/screen"
import vaccineCardThumb from "@/public/demo/vaccine-card-thumb.png"
import { demo } from "@/lib/demo-data"
import { fmtDayTime } from "@/lib/format"
import { useI18n } from "@/lib/i18n/provider"
import type { VaccineRow } from "@/lib/types"

import { updateDraft, useDraftMedia, useReportDraft } from "../../report-draft"
import { Disclaimer, Findings, ResultFooter, ResultList, ResultRow, ResultSummary, SubpageBar } from "../../result-parts"

type Field = VaccineRow["field"]

/** Placeholder for empty manual rows (`?manual=1`). */
const EMPTY = "—"

/**
 * Kartu vaksin — Hasil baca (`cnrdA`): AI-read vaccine card fields, editable per row.
 * `?manual=1` starts with every field empty for manual entry.
 */
export function VaccineCardResultScreen() {
  const router = useRouter()
  const manual = useSearchParams().get("manual") === "1"
  const { m, t, locale } = useI18n()
  const copy = m.vaccineCard.result
  const card = demo.reportDemo.vaccineCard
  const draft = useReportDraft()
  const { photoUrl } = useDraftMedia()
  const [edits, setEdits] = useState<Partial<Record<Field, string>>>({})
  const [editing, setEditing] = useState<Field | null>(null)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")

  const base: VaccineRow[] = manual
    ? card.rows.map((r) => ({ ...r, value: null, status: "tidak_jelas" }))
    : draft.vaccineRows
  const rows: VaccineRow[] = base.map((r) => {
    const edited = edits[r.field]
    return edited === undefined ? r : { ...r, value: { id: edited, en: edited }, status: "dikonfirmasi" }
  })

  const save = () => {
    const value = text.trim()
    if (editing && value) setEdits((e) => ({ ...e, [editing]: value }))
  }

  const thumb = manual ? (
    <NotebookPen strokeWidth={1.75} aria-hidden className="size-7 text-muted-foreground" />
  ) : photoUrl ? (
    <Image src={photoUrl} alt="" fill unoptimized sizes="76px" className="object-cover" />
  ) : (
    <Image src={vaccineCardThumb} alt="" fill sizes="76px" className="object-cover" />
  )

  return (
    <Screen>
      <SubpageBar title={copy.title} />
      <div className="flex w-full flex-1 flex-col gap-5 px-5 py-2">
        <ResultSummary
          thumb={thumb}
          title={manual ? copy.title : card.title[locale]}
          sub={manual ? copy.manualSub : t(copy.photographedAt, { time: fmtDayTime(card.photographedAt, locale) })}
        />

        <Findings
          title={copy.findings}
          hint={
            <span className="flex shrink-0 items-center gap-1.5 text-sm/[normal] text-primary">
              {manual ? (
                <NotebookPen strokeWidth={1.75} aria-hidden className="size-4" />
              ) : (
                <ScanText strokeWidth={1.75} aria-hidden className="size-4" />
              )}
              {manual ? copy.manualHint : m.enums.aiStatus.dibaca_ai}
            </span>
          }
        >
          <ResultList>
            {rows.map((row) => {
              const empty = row.value === null
              return (
                <ResultRow
                  key={row.field}
                  label={copy.fields[row.field]}
                  value={row.value ? row.value[locale] : manual ? EMPTY : m.enums.aiStatus.tidak_jelas}
                  muted={empty}
                  badge={
                    row.status === "dikonfirmasi"
                      ? { label: m.enums.aiStatus.dikonfirmasi, tone: "ok" }
                      : row.status === "tidak_jelas" && !manual
                        ? { label: copy.unclear, tone: "soon" }
                        : undefined
                  }
                  onEdit={() => {
                    setText(row.value ? row.value[locale] : "")
                    setEditing(row.field)
                    setOpen(true)
                  }}
                />
              )
            })}
          </ResultList>
        </Findings>

        <Disclaimer>{copy.disclaimer}</Disclaimer>
      </div>

      <ResultFooter
        primary={copy.use}
        onPrimary={() => {
          updateDraft({ vaccineStatus: "divaksin", vaccineSource: manual ? "manual" : "ai", vaccineRows: rows })
          router.push("/lapor/konfirmasi")
        }}
        secondary={copy.retake}
        secondaryIcon={Camera}
        onSecondary={() => router.push("/lapor/kartu-vaksin")}
      />

      <EditFieldSheet open={open} onOpenChange={setOpen} title={editing ? copy.fields[editing] : ""} onSave={save}>
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
