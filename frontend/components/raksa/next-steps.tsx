"use client"

import { CalendarDays, Droplets, Hospital, Syringe } from "lucide-react"
import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition, fadeUp, staggerParent } from "@/lib/motion"
import { cn } from "@/lib/utils"

const ICONS = [Droplets, Hospital, Syringe, CalendarDays] as const
const STEP_GAP = 0.06

/** NextSteps as used on Hasil `ZRxtB` (pen `H79lAz` with the circles overridden to transparent): four steps on a vertical connector.
 * Steps stagger in, then the connector grows downwards behind the dots. */
export function NextSteps({ className }: { className?: string }) {
  const { m } = useI18n()
  const copy = m.caseUi.nextSteps
  const last = copy.steps.length - 1

  return (
    <section className={cn("flex w-full flex-col gap-4", className)}>
      <h2 className="text-base/6 font-medium text-foreground">{copy.title}</h2>
      <motion.ol
        className="relative flex w-full flex-col"
        variants={staggerParent(STEP_GAP)}
        initial="hidden"
        animate="show"
      >
        <motion.span
          aria-hidden
          className="absolute top-[18px] bottom-[18px] left-[17px] w-0.5 origin-top bg-border"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={easeTransition(DURATION.sheet, STEP_GAP * copy.steps.length)}
        />
        {copy.steps.map((step, i) => {
          const Icon = ICONS[i]
          return (
            <motion.li key={step.title} variants={fadeUp} className="relative flex w-full items-start gap-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-primary">
                <Icon strokeWidth={1.75} aria-hidden className="size-[18px]" />
              </span>
              <div className={cn("flex flex-1 flex-col gap-0.5 pt-1.5", i < last && "pb-5")}>
                <p className="text-base/6 font-medium text-foreground">{step.title}</p>
                <p className="text-base/6 text-muted-foreground">{step.desc}</p>
              </div>
            </motion.li>
          )
        })}
      </motion.ol>
    </section>
  )
}
