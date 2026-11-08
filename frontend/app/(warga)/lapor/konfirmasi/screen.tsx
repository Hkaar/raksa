"use client"

import { ArrowRight, Camera, ChevronRight, CircleQuestionMark, LoaderCircle, Mic, ScanText } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { EditFieldSheet } from "@/components/raksa/edit-field-sheet"
import { FlowHeader } from "@/components/raksa/flow-header"
import { LabeledInput, LabeledSelect } from "@/components/raksa/labeled-input"
import { Screen } from "@/components/raksa/screen"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { demo } from "@/lib/demo-data"
import { fmtDayTime } from "@/lib/format"
import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition, fadeUp, staggerParent } from "@/lib/motion"
import type { Kecamatan, QuestionField } from "@/lib/types"

import { QuestionChoices } from "../question-field"
import { updateDraft, useReportDraft, type ReportDraft } from "../report-draft"
import { submitReport } from "../submit-report"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const

type RowKey = "event" | "wound" | "animal" | "victim"

const ROW_FIELDS: Record<Exclude<RowKey, "event">, QuestionField[]> = {
  wound: ["contact", "bodyPart", "bleeding", "woundCount"],
  animal: ["species", "ownership", "condition", "animalNow"],
  victim: ["ageGroup", "accompanied"],
}

/** ISO with offset → `datetime-local` value in Bali time (+08:00). */
function toLocalInput(iso: string) {
  const shifted = new Date(new Date(iso).getTime() + 8 * 3600_000)
  return shifted.toISOString().slice(0, 16)
}

/** `datetime-local` value (Bali time) → ISO with +08:00. */
function fromLocalInput(value: string) {
  return `${value}:00+08:00`
}

/** Konfirmasi (`a6OIN`): AI-read summary the user checks before submitting. */
export function ConfirmScreen() {
  const router = useRouter()
  const { m, t, locale } = useI18n()
  const k = m.konfirmasi
  const draft = useReportDraft()
  const [editing, setEditing] = useState<RowKey | null>(null)
  const [temp, setTemp] = useState<Partial<ReportDraft>>({})
  const [submitting, setSubmitting] = useState(false)

  const rows: { key: RowKey; value: string }[] = [
    { key: "event", value: [fmtDayTime(draft.bittenAt, locale), draft.desa].filter(Boolean).join(" · ") },
    {
      key: "wound",
      value: t(k.woundTemplate, {
        contact: m.enums.contact[draft.contact],
        bodyPart: k.inline.bodyPart[draft.bodyPart],
        bleeding: k.inline.bleeding[draft.bleeding],
        count: m.enums.woundCount[draft.woundCount],
      }),
    },
    {
      key: "animal",
      value: t(k.animalTemplate, {
        species: k.inline.species[draft.species],
        ownership: k.inline.ownership[draft.ownership],
        condition: k.inline.condition[draft.condition],
        animalNow: k.inline.animalNow[draft.animalNow],
      }),
    },
    {
      key: "victim",
      value: t(k.victimTemplate, {
        ageGroup: m.enums.ageGroup[draft.ageGroup],
        accompanied: k.inline.accompanied[draft.accompanied],
      }),
    },
  ]

  function open(key: RowKey) {
    setTemp(
      key === "event"
        ? { bittenAt: draft.bittenAt, kecamatan: draft.kecamatan, desa: draft.desa }
        : Object.fromEntries(ROW_FIELDS[key].map((f) => [f, draft[f]])),
    )
    setEditing(key)
  }

  async function confirm() {
    setSubmitting(true)
    const outcome = await submitReport(draft)
    const target = `/kasus/${demo.reportDemo.resultCaseCode}/hasil`
    if (outcome === "not_saved") toast.warning(k.notSavedDemo)
    router.push(outcome === "failed" ? `${target}?keadaan=gagal-simpan` : target)
  }

  const merged = { ...draft, ...temp }

  return (
    <Screen>
      <FlowHeader step={2} total={3} />
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px]/8 font-bold text-foreground">{k.title}</h1>
          <p className="text-base/6 text-muted-foreground">{k.help}</p>
        </div>
        {draft.vaccineStatus === "tidak_jelas" ? (
          <section className="flex flex-col gap-3 rounded-xl bg-muted p-4" role="status">
            <div className="flex gap-3">
              <CircleQuestionMark {...ICON} className="size-[22px] shrink-0 text-foreground" />
              <div className="flex flex-1 flex-col gap-0.5">
                <p className="text-base font-medium text-foreground">{k.vaccineUnclear}</p>
                <p className="text-sm/5 text-muted-foreground">{k.vaccineUnclearHelp}</p>
              </div>
            </div>
            <Link
              href="/lapor/kartu-vaksin"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-card text-sm font-medium text-foreground outline outline-[1.5px] -outline-offset-[0.75px] outline-outline transition-colors duration-[160ms] hover:bg-surface-container-low focus-visible:outline-3 focus-visible:outline-focus-ring"
            >
              <Camera {...ICON} className="size-[18px]" />
              {k.photoVaccineCard}
            </Link>
          </section>
        ) : null}
        <p className="flex items-center gap-1.5 px-1 text-[13px] font-bold tracking-[0.5px] text-primary">
          <ScanText {...ICON} className="size-4" />
          {k.aiRead}
        </p>
        <motion.ul
          variants={staggerParent(0.05, 0.08)}
          initial="hidden"
          animate="show"
          className="flex w-full flex-col overflow-hidden rounded-xl bg-card outline outline-1 -outline-offset-[0.5px] outline-border"
        >
          {rows.map((row) => (
            <motion.li key={row.key} variants={fadeUp} className="border-b border-border last:border-b-0">
              <button
                type="button"
                onClick={() => open(row.key)}
                className="flex w-full items-center gap-3 px-5 py-4 text-start transition-colors duration-[160ms] hover:bg-state-hover focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus-ring"
              >
                <span className="flex flex-1 flex-col gap-1">
                  <span className="text-[13px]/[normal] font-bold tracking-[0.5px] text-muted-foreground">{k.rows[row.key]}</span>
                  <AnimatePresence mode="wait" initial={false}>
                    {/* Cross-fades when the value changes (saved from the edit sheet). */}
                    <motion.span
                      key={row.value}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={easeTransition(DURATION.quick)}
                      className="text-base/[normal] font-medium text-foreground"
                    >
                      {row.value}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <ChevronRight {...ICON} className="size-[18px] shrink-0 text-muted-foreground" />
              </button>
            </motion.li>
          ))}
        </motion.ul>
      </div>
      <div className="flex w-full flex-col items-center gap-1 px-5 pt-4 pb-6">
        <Button className="h-[58px] w-full [&_svg]:size-5" onClick={confirm} disabled={submitting} aria-busy={submitting || undefined}>
          {k.confirm}
          {submitting ? (
            <LoaderCircle {...ICON} className="animate-spin motion-reduce:animate-none" />
          ) : (
            <ArrowRight {...ICON} />
          )}
        </Button>
        <Link
          href="/lapor"
          className="inline-flex h-11 items-center gap-1.5 rounded-xs text-sm font-medium text-primary focus-visible:outline-3 focus-visible:outline-focus-ring"
        >
          <Mic {...ICON} className="size-4" />
          {k.editByVoice}
        </Link>
      </div>

      <EditFieldSheet
        open={editing !== null}
        onOpenChange={(o) => {
          if (!o) setEditing(null)
        }}
        title={editing ? k.rows[editing] : ""}
        onSave={() => updateDraft(temp)}
      >
        {editing === "event" ? (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-bitten-at">{k.bittenAtLabel}</Label>
              <Input
                id="edit-bitten-at"
                type="datetime-local"
                value={merged.bittenAt ? toLocalInput(merged.bittenAt) : ""}
                onChange={(e) => {
                  if (e.target.value) setTemp((p) => ({ ...p, bittenAt: fromLocalInput(e.target.value) }))
                }}
              />
            </div>
            <LabeledSelect
              label={m.lapor.location.kecamatan}
              placeholder={m.lapor.location.kecamatanPlaceholder}
              options={demo.kecamatan.map((kc) => ({ value: kc, label: m.enums.kecamatan[kc] }))}
              value={merged.kecamatan || undefined}
              onValueChange={(v) => setTemp((p) => ({ ...p, kecamatan: v as Kecamatan }))}
            />
            <LabeledInput
              label={m.lapor.location.desa}
              placeholder={m.lapor.location.desaPlaceholder}
              value={merged.desa}
              onChange={(e) => setTemp((p) => ({ ...p, desa: e.target.value }))}
            />
          </>
        ) : editing ? (
          ROW_FIELDS[editing].map((field) => (
            <fieldset key={field} className="flex flex-col gap-3">
              <legend id={`edit-${field}`} className="mb-3 text-base font-medium text-foreground">
                {m.questions.title[field]}
              </legend>
              <QuestionChoices
                field={field}
                value={merged[field] as string}
                labelledBy={`edit-${field}`}
                onValueChange={(v) => setTemp((p) => ({ ...p, [field]: v }))}
              />
            </fieldset>
          ))
        ) : null}
      </EditFieldSheet>
    </Screen>
  )
}
