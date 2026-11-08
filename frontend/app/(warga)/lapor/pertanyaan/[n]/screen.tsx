"use client"

import { ArrowRight, Droplet } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { FlowHeader } from "@/components/raksa/flow-header"
import { Screen } from "@/components/raksa/screen"
import { Button } from "@/components/ui/button"
import { demo } from "@/lib/demo-data"
import { useI18n } from "@/lib/i18n/provider"

import { QuestionChoices, stepSlide } from "../../question-field"
import { updateDraft, useReportDraft, type ReportDraft } from "../../report-draft"

/** Last question shown in this tab; tells whether the next mount moved forward or back. */
let lastStep: number | null = null

/** Pertanyaan lanjutan (`NpAQ3`): one follow-up question per step. */
export function QuestionScreen({ step }: { step: number }) {
  const router = useRouter()
  const { m } = useI18n()
  const draft = useReportDraft()
  const questions = demo.reportDemo.followUpQuestions
  const field = questions[step - 1]
  const value = draft[field] as string | undefined
  const help = (m.questions.help as Partial<Record<string, string>>)[field]
  const titleId = `question-${field}`
  const [dir] = useState(() => (lastStep !== null && step < lastStep ? -1 : 1))
  /** Set by "Lanjut": the question slides out, then the router moves on. */
  const [leavingTo, setLeavingTo] = useState<string | null>(null)

  useEffect(() => {
    lastStep = step
  }, [step])

  return (
    <Screen>
      <FlowHeader step={step} total={questions.length} />
      <div className="flex flex-1 flex-col">
        <AnimatePresence custom={1} onExitComplete={() => leavingTo && router.push(leavingTo)}>
          {leavingTo ? null : (
            <motion.div
              key={step}
              custom={dir}
              variants={stepSlide}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-1 flex-col items-center gap-6 px-6 pt-5 pb-2"
            >
              {field === "bleeding" ? (
                <div className="flex size-24 items-center justify-center rounded-full">
                  <Droplet aria-hidden strokeWidth={1.75} className="size-14 text-destructive" />
                </div>
              ) : null}
              <div className="flex w-full flex-col items-center gap-2">
                <h1 id={titleId} className="w-full text-center text-[28px]/[31px] font-bold text-foreground">
                  {m.questions.title[field]}
                </h1>
                {help ? <p className="text-center text-base text-muted-foreground">{help}</p> : null}
              </div>
              <QuestionChoices
                field={field}
                value={value}
                variant="prominent"
                withDescriptions
                labelledBy={titleId}
                onValueChange={(next) => updateDraft({ [field]: next } as Partial<ReportDraft>)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex w-full flex-col gap-3 px-6 pt-5 pb-7">
        <Button
          className="h-[58px] w-full [&_svg]:size-5"
          disabled={!value}
          onClick={() => {
            if (!leavingTo) setLeavingTo(step < questions.length ? `/lapor/pertanyaan/${step + 1}` : "/lapor/scan")
          }}
        >
          {m.questions.next}
          <ArrowRight aria-hidden strokeWidth={1.75} />
        </Button>
      </div>
    </Screen>
  )
}
