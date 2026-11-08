"use client"

import { ClockAlert } from "lucide-react"
import { motion, useTransform } from "motion/react"
import { useProgressTween } from "@/components/raksa/motion"
import { fmtDayTime, fmtRemaining } from "@/lib/format"
import { useI18n } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

const TICKS = [0.25, 0.5, 0.75] as const

/** DeadlineMeter (pen `FPDDl`): time left until the 24-hour deadline with an elapsed bar. */
export function DeadlineMeter({
  bittenAt,
  deadlineAt,
  now,
  className,
}: {
  bittenAt: string
  deadlineAt: string
  /** Demo clock (`demo.meta.now`). */
  now: string
  className?: string
}) {
  const { locale, m } = useI18n()
  const copy = m.caseUi.deadlineMeter
  const start = new Date(bittenAt).getTime()
  const end = new Date(deadlineAt).getTime()
  const current = new Date(now).getTime()
  const elapsed = Math.min(1, Math.max(0, (current - start) / (end - start)))
  const progress = useProgressTween(elapsed)
  const width = useTransform(progress, (v) => `${v * 100}%`)
  const left = useTransform(progress, (v) => `calc(${v * 100}% - ${v * 16}px)`)

  return (
    <div className={cn("flex w-full flex-col gap-3.5", className)}>
      <div className="flex w-full items-end justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-base/6 whitespace-nowrap text-muted-foreground">{copy.remaining}</p>
          <p className="text-[32px]/[35px] font-bold whitespace-nowrap text-foreground">
            {fmtRemaining(end - current, locale)}
          </p>
        </div>
        <p className="flex items-center gap-1.5 pb-1 text-base/6 font-medium whitespace-nowrap text-soon-text">
          <ClockAlert strokeWidth={1.75} aria-hidden className="size-[18px] text-soon" />
          {copy.limit}
        </p>
      </div>

      <div
        role="progressbar"
        aria-label={copy.limit}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(elapsed * 100)}
        className="relative h-6 w-full"
      >
        <div className="absolute inset-x-0 top-[9px] h-1.5 rounded-xs bg-border" />
        {TICKS.map((tick) => (
          <div
            key={tick}
            className="absolute top-[7px] h-2.5 w-0.5 bg-background"
            style={{ left: `${tick * 100}%` }}
          />
        ))}
        <motion.div className="absolute top-[9px] left-0 h-1.5 min-w-1.5 rounded-xs bg-soon" style={{ width }} />
        <motion.div className="absolute top-1 size-4 rounded-full border-3 border-soon bg-card" style={{ left }} />
      </div>

      <div className="flex w-full items-start justify-between">
        <div className="flex flex-col items-start">
          <p className="text-sm/[21px] whitespace-nowrap text-muted-foreground">{copy.bitten}</p>
          <p className="text-base/6 font-medium whitespace-nowrap text-foreground">{fmtDayTime(bittenAt, locale)}</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-sm/[21px] whitespace-nowrap text-muted-foreground">{copy.deadline}</p>
          <p className="text-base/6 font-medium whitespace-nowrap text-foreground">
            {fmtDayTime(deadlineAt, locale)}
          </p>
        </div>
      </div>
    </div>
  )
}
