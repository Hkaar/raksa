"use client"

import { useState } from "react"
import { BellRing, Info, PawPrint, Save, TriangleAlert } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { AppHeader } from "@/components/raksa/app-header"
import { BottomBar } from "@/components/raksa/bottom-bar"
import { ChoiceGroup, ChoiceItem } from "@/components/raksa/choice-group"
import { DecorHills } from "@/components/raksa/decor-hills"
import { ObservationTimeline } from "@/components/raksa/observation-timeline"
import { Reveal } from "@/components/raksa/motion"
import { Screen } from "@/components/raksa/screen"
import { SavedBadge } from "@/components/raksa/status-badges"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { caseView } from "@/lib/case-view"
import { cn } from "@/lib/utils"
import { addHours, fmtDate, fmtWeekdayDate } from "@/lib/format"
import { demo, getCaseByOwnerToken } from "@/lib/demo-data"
import { addOwnerReport, useDemoStore } from "@/lib/demo-store"
import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition } from "@/lib/motion"
import type { AnimalStatus } from "@/lib/types"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const
const STATUSES = ["sehat", "sakit", "mati", "hilang"] as const satisfies readonly AnimalStatus[]

export function OwnerScreen({ token }: { token: string }) {
  const { m, t, locale } = useI18n()
  const copy = m.owner
  const store = useDemoStore()
  const c = getCaseByOwnerToken(token)!
  const view = caseView(c, store)
  const [choice, setChoice] = useState<AnimalStatus | undefined>()
  const [sent, setSent] = useState<{ status: AnimalStatus; day: number } | null>(null)

  const header = <AppHeader context={copy.context} logoHref={null} />
  const obs = view.observation

  if (!obs) {
    return (
      <Screen>
        {header}
        <div className="px-4 py-8">
          <Alert>
            <Info {...ICON} />
            <AlertDescription>{copy.inactive}</AlertDescription>
          </Alert>
        </div>
      </Screen>
    )
  }

  const reset = () => {
    setSent(null)
    setChoice(undefined)
  }

  const day = view.observationDay
  const submit = () => {
    if (!choice) return
    addOwnerReport(c.code, choice)
    setSent({ status: choice, day })
  }

  const mode = sent === null ? "form" : sent.status === "sehat" ? "saved" : "sent"

  let body: React.ReactNode
  if (sent?.status === "sehat") {
    // "Senin 9 Nov" (design writes weekday and date without a comma).
    const next = fmtWeekdayDate(addHours(demo.meta.now, 24), locale).replace(",", "")
    body = (
      <>
        <DecorHills className="pointer-events-none absolute inset-x-0 bottom-0 z-0" />
        <div className="relative z-[2] flex flex-1 flex-col items-start gap-5 px-6 pt-12 pb-6">
          <SavedBadge />
          <h1 className="text-[32px]/[35px] font-bold text-foreground">{t(copy.savedTitle, { day: sent.day })}</h1>
          <p className="text-base/[26px] text-muted-foreground">{t(copy.savedNext, { date: next })}</p>
          <ObservationTimeline day={view.observationDay} durationDays={obs.durationDays} />
        </div>
        <BottomBar className="relative z-[3] bg-transparent">
          <Button onClick={reset}>{copy.done}</Button>
        </BottomBar>
      </>
    )
  } else if (sent) {
    body = (
      <>
        <div className="flex flex-1 flex-col items-start gap-5 px-6 pt-12 pb-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <BellRing {...ICON} className="size-7 text-primary" />
          </div>
          <h1 className="text-[32px]/[35px] font-bold text-foreground">{copy.sentTitle}</h1>
          <Alert>
            <Info {...ICON} />
            <AlertDescription>{copy.sentAlert}</AlertDescription>
          </Alert>
          <Badge variant="ok">
            <Save {...ICON} />
            {copy.sent}
          </Badge>
        </div>
        <BottomBar>
          <Button onClick={reset}>{copy.done}</Button>
        </BottomBar>
      </>
    )
  } else {
    body = (
      <>
        <div className="flex flex-1 flex-col gap-9 px-4 py-8">
          <section className="flex flex-col">
            <h2 className="text-base font-medium text-foreground">{copy.summaryTitle}</h2>
            <dl className="flex flex-col gap-3 border-b border-border py-3">
              {[
                [copy.species, m.enums.species[c.animal.species]],
                [copy.desa, c.desa],
                [copy.bittenDate, fmtDate(c.bittenAt, locale)],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5 text-base/[normal]">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="flex flex-col gap-3">
            <p className="text-[22px]/[25px] font-bold text-foreground">
              {t(copy.day, { day, total: obs.durationDays })}
            </p>
            <ObservationTimeline day={day} durationDays={obs.durationDays} />
          </section>
          <section className="flex flex-col gap-3">
            <h1 id="owner-question" className="text-[32px]/[35px] font-bold text-foreground">
              {copy.question}
            </h1>
            <ChoiceGroup
              value={choice}
              onValueChange={(v) => setChoice(v as AnimalStatus)}
              indicator={false}
              aria-labelledby="owner-question"
            >
              {STATUSES.map((s, i) => (
                <Reveal key={s} delay={0.1 + i * 0.04} className="flex">
                  <ChoiceItem
                    value={s}
                    label={copy.status[s]}
                    icon={s === "sehat" ? PawPrint : TriangleAlert}
                    emphasis={s !== "sehat"}
                  />
                </Reveal>
              ))}
            </ChoiceGroup>
          </section>
        </div>
        <BottomBar>
          <Button disabled={!choice} onClick={submit}>
            {t(copy.submit, { day })}
          </Button>
        </BottomBar>
      </>
    )
  }

  return (
    <Screen className={cn(mode === "saved" && "relative overflow-hidden")}>
      {header}
      {/* Form ↔ saved/sent states cross-fade. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={easeTransition(DURATION.card)}
          className="flex flex-1 flex-col"
        >
          {body}
        </motion.div>
      </AnimatePresence>
    </Screen>
  )
}
