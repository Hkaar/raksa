"use client"

import { ClockAlert, ListChecks, OctagonAlert, Plus } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { addHours, fmtTime, fmtWeekdayDate } from "@/lib/format"
import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition, fadeUp, staggerParent } from "@/lib/motion"
import type { Case, OutcomeCode } from "@/lib/types"
import { cn } from "@/lib/utils"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const

/** Rules whose outcome is the urgency itself are what the diagram shows; the list holds the rest. */
const URGENCY_OUTCOMES: readonly OutcomeCode[] = ["HARI_INI", "DALAM_24_JAM"]

/** Reveal order when the sheet opens: input tiles → "+" → connector → result card → rules. */
const STEP = { inputs: 0.08, plus: 0.16, connector: 0.22, result: 0.36, rules: 0.48 } as const

function InputTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-[20px] bg-card p-3.5">
      <p className="text-[13px]/[normal] text-muted-foreground">{label}</p>
      <p className="text-[17px]/[normal] font-bold text-foreground">{value}</p>
    </div>
  )
}

/** Body of the "Kenapa hasilnya begini?" sheet (`Y0BFDe`): input → urgency diagram, met rules, footer note. */
function WhySheetContent({ caseData: c }: { caseData: Case }) {
  const { locale, m, t } = useI18n()
  const copy = m.why
  const reduced = useReducedMotion()
  const today = c.urgency === "HARI_INI"
  const deadlineAt = addHours(c.bittenAt, 24)
  const rules = c.explanation.rules.filter((r) => !URGENCY_OUTCOMES.includes(r.outcome))
  const UrgencyIcon = today ? OctagonAlert : ClockAlert

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-[22px]/[25px]">{copy.title}</SheetTitle>
      </SheetHeader>

      <div className="flex w-full flex-col gap-5">
        <div className="flex w-full flex-col items-center rounded-xl bg-muted p-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={easeTransition(DURATION.enter, STEP.inputs)}
            className="relative flex w-full items-stretch gap-3"
          >
            <InputTile label={copy.wound} value={m.enums.woundCategory[c.woundCategory]} />
            <InputTile label={copy.animalRisk} value={m.enums.animalRisk[c.animalRisk]} />
            <motion.span
              aria-hidden
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={easeTransition(DURATION.card, STEP.plus)}
              className="absolute top-[18px] left-1/2 -ml-[15px] flex size-[30px] items-center justify-center rounded-full bg-foreground text-background outline-3 outline-muted"
            >
              <Plus {...ICON} className="size-4" />
            </motion.span>
          </motion.div>

          <svg aria-hidden viewBox="0 0 310 28" preserveAspectRatio="none" className="h-7 w-full overflow-visible">
            <motion.path
              d="M 74.5 0 V 8 Q 74.5 14 80.5 14 H 229.5 Q 235.5 14 235.5 8 V 0 M 155 14 V 28"
              fill="none"
              stroke="var(--outline)"
              strokeWidth={2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: reduced ? 1 : 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={easeTransition(DURATION.sheet, STEP.connector)}
            />
          </svg>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={easeTransition(DURATION.enter, STEP.result)}
            className={cn(
              "flex w-full items-center gap-3.5 rounded-[20px] px-4 py-3.5",
              today ? "bg-urgent text-urgent-foreground" : "bg-soon-bg text-soon-text outline outline-1 -outline-offset-1 outline-soon-border",
            )}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                today ? "bg-white/15" : "bg-card/60 text-soon",
              )}
            >
              <UrgencyIcon {...ICON} className="size-[22px]" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-xl/[normal] font-bold tracking-[0.2px]">{m.enums.urgency[c.urgency]}</p>
              <p className="text-sm/5">
                {today
                  ? copy.todayAction
                  : t(m.caseUi.urgencyCard.within24Subtitle, {
                      date: fmtWeekdayDate(deadlineAt, locale),
                      time: fmtTime(deadlineAt, locale),
                    })}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex w-full flex-col gap-4">
          <SheetDescription className="text-sm/[22px] font-medium text-muted-foreground">{copy.rulesTitle}</SheetDescription>
          {rules.length > 0 ? (
            <motion.ul
              variants={staggerParent(0.06, STEP.rules)}
              initial="hidden"
              animate="show"
              className="flex w-full flex-col gap-4"
            >
              {rules.map((rule) => (
                <motion.li key={rule.condition} variants={fadeUp} className="flex w-full flex-col gap-0.5">
                  <p className="text-base/[22px] text-foreground">{m.enums.ruleCondition[rule.condition]}</p>
                  <p className="text-sm/[normal] font-medium text-primary">{m.enums.ruleOutcome[rule.outcome]}</p>
                </motion.li>
              ))}
            </motion.ul>
          ) : null}
        </div>

        <p className="flex w-full items-center gap-2.5 rounded-md bg-muted px-4 py-3.5 text-sm/5 text-muted-foreground">
          <ListChecks {...ICON} className="size-[18px] shrink-0" />
          <span className="flex-1">{copy.footer}</span>
        </p>
      </div>
    </>
  )
}

/** Bottom sheet explaining a case result (`Y0BFDe`). */
export function WhySheet({
  caseData,
  open,
  onOpenChange,
}: {
  caseData: Case
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <WhySheetContent caseData={caseData} />
      </SheetContent>
    </Sheet>
  )
}
