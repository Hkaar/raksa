"use client"

import { motion, useTransform } from "motion/react"

import { useProgressTween } from "@/components/raksa/motion"
import { useI18n } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

/** ObservationTimeline (pen `ydsVy`): progress of the animal observation, day 1 → day n. */
export function ObservationTimeline({
  day,
  durationDays,
  className,
}: {
  /** Current observation day; 0 = not started. */
  day: number
  durationDays: number
  className?: string
}) {
  const { m, t } = useI18n()
  const copy = m.caseUi.observationTimeline
  const clamped = Math.min(Math.max(day, 0), durationDays)
  const progress = useProgressTween(clamped / durationDays)
  const width = useTransform(progress, (v) => `${v * 100}%`)

  return (
    <div className={cn("flex w-full flex-col gap-2.5", className)}>
      <div
        role="progressbar"
        aria-label={t(copy.label, { day: clamped, total: durationDays })}
        aria-valuemin={0}
        aria-valuemax={durationDays}
        aria-valuenow={clamped}
        className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <motion.div className="h-full rounded-full bg-primary" style={{ width }} />
      </div>
      <div className="flex w-full items-start justify-between text-base whitespace-nowrap text-muted-foreground">
        <span>{t(copy.day, { n: 1 })}</span>
        <span>{t(copy.day, { n: durationDays })}</span>
      </div>
    </div>
  )
}
