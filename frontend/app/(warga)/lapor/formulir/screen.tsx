"use client"

import { ArrowLeft, WifiOff } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { AppHeader } from "@/components/raksa/app-header"
import { BottomBar } from "@/components/raksa/bottom-bar"
import { LabeledInput, LabeledSelect } from "@/components/raksa/labeled-input"
import { Screen } from "@/components/raksa/screen"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { demo } from "@/lib/demo-data"
import { useI18n } from "@/lib/i18n/provider"
import type { Kecamatan } from "@/lib/types"

import { QuestionChoices, stepSlide } from "../question-field"
import { updateDraft, useReportDraft, type ReportDraft } from "../report-draft"

const PER_PAGE = 2

/** Isi formulir singkat (`kbpfq`): 2 questions per page, then the location step (`DHGIR`). */
export function FormScreen() {
  const router = useRouter()
  const { m, t } = useI18n()
  const noAi = useSearchParams().get("keadaan") === "tanpa-ai"
  const draft = useReportDraft()
  const questions = demo.reportDemo.formQuestions
  const pageCount = Math.ceil(questions.length / PER_PAGE)
  const [page, setPage] = useState(0)
  /** 1 = forward, -1 = back; drives the page slide direction. */
  const [dir, setDir] = useState(1)
  const [kecamatan, setKecamatan] = useState<Kecamatan | "">("")
  const [desa, setDesa] = useState("")
  const [showErrors, setShowErrors] = useState(false)
  const isLocation = page === pageCount

  function back() {
    if (page === 0) router.back()
    else {
      setDir(-1)
      setPage(page - 1)
    }
  }

  function next() {
    if (!isLocation) {
      setDir(1)
      setPage(page + 1)
      window.scrollTo({ top: 0 })
      return
    }
    if (!kecamatan || !desa.trim()) {
      setShowErrors(true)
      return
    }
    updateDraft({ kecamatan, desa: desa.trim() })
    router.push("/lapor/konfirmasi")
  }

  const backButton = (
    <button
      type="button"
      onClick={back}
      aria-label={m.common.back}
      className="inline-flex size-12 items-center justify-center rounded-full text-muted-foreground transition-colors duration-[160ms] hover:bg-state-hover focus-visible:outline-3 focus-visible:outline-focus-ring"
    >
      <ArrowLeft aria-hidden strokeWidth={1.75} className="size-5" />
    </button>
  )

  return (
    <Screen>
      <AppHeader trailing={backButton} />
      <form
        noValidate
        className="flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault()
          next()
        }}
      >
        <div className="flex flex-1 flex-col overflow-x-clip">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            {isLocation ? (
              <motion.div
                key="location"
                custom={dir}
                variants={stepSlide}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-1 flex-col gap-6 px-4 py-8"
              >
                <div className="flex flex-col gap-3">
                  <h1 className="text-[32px]/[35px] font-bold text-foreground">{m.lapor.location.title}</h1>
                  <p className="text-base/[26px] text-muted-foreground">{m.lapor.location.sub}</p>
                </div>
                <LabeledSelect
                  label={m.lapor.location.kecamatan}
                  placeholder={m.lapor.location.kecamatanPlaceholder}
                  options={demo.kecamatan.map((k) => ({ value: k, label: m.enums.kecamatan[k] }))}
                  value={kecamatan || undefined}
                  onValueChange={(v) => setKecamatan(v as Kecamatan)}
                  error={showErrors && !kecamatan ? m.common.required : undefined}
                />
                <LabeledInput
                  label={m.lapor.location.desa}
                  placeholder={m.lapor.location.desaPlaceholder}
                  value={desa}
                  onChange={(e) => setDesa(e.target.value)}
                  autoComplete="off"
                  error={showErrors && !desa.trim() ? m.lapor.location.desaRequired : undefined}
                />
              </motion.div>
            ) : (
              <motion.div
                key={page}
                custom={dir}
                variants={stepSlide}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-1 flex-col gap-5 px-4 py-8"
              >
                {noAi ? (
                  <Alert>
                    <WifiOff aria-hidden strokeWidth={1.75} />
                    <AlertDescription>{m.lapor.form.noAi}</AlertDescription>
                  </Alert>
                ) : null}
                <h1 className="text-[32px]/[35px] font-bold text-foreground">{m.lapor.form.title}</h1>
                {questions.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE).map((field) => (
                  <fieldset key={field} className="flex flex-col gap-3">
                    <legend id={`form-${field}`} className="mb-3 text-base/[22px] font-medium text-foreground">
                      {m.questions.title[field]}
                    </legend>
                    <QuestionChoices
                      field={field}
                      value={draft[field] as string}
                      layout={field === "species" ? "grid-2" : "list"}
                      labelledBy={`form-${field}`}
                      onValueChange={(v) => updateDraft({ [field]: v } as Partial<ReportDraft>)}
                    />
                  </fieldset>
                ))}
                <p className="text-base text-muted-foreground">
                  {t(m.lapor.form.progress, {
                    from: page * PER_PAGE + 1,
                    to: Math.min(questions.length, page * PER_PAGE + PER_PAGE),
                    total: questions.length,
                  })}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <BottomBar>
          <Button type="submit">{m.lapor.form.next}</Button>
        </BottomBar>
      </form>
    </Screen>
  )
}
