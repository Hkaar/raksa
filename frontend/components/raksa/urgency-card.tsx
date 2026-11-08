"use client"

import { ClockAlert, MapPin, OctagonAlert } from "lucide-react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { fmtTime, fmtWeekdayDate } from "@/lib/format"
import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition } from "@/lib/motion"
import type { Urgency } from "@/lib/types"
import { cn } from "@/lib/utils"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const

/** UrgencyCard/HARI_INI (pen `NnBGf`) and UrgencyCard/DALAM_24_JAM (pen `kvsm4`). */
export function UrgencyCard({
  urgency,
  reasons = [],
  deadlineAt,
  onFindRabiesCenter,
  className,
}: {
  urgency: Urgency
  /** Already-localized reason labels; shown after "Karena: " on HARI_INI. */
  reasons?: string[]
  /** ISO deadline for DALAM_24_JAM (bite time + 24 h). */
  deadlineAt?: string
  /** Renders the "Cari Rabies Center terdekat" button when provided. */
  onFindRabiesCenter?: () => void
  className?: string
}) {
  const { locale, m, t } = useI18n()
  const copy = m.caseUi.urgencyCard
  const today = urgency === "HARI_INI"

  return (
    <motion.section
      role="alert"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={easeTransition(DURATION.card)}
      className={cn(
        "flex w-full flex-col gap-5 rounded-xl p-5 min-[360px]:p-6",
        today ? "bg-urgent text-urgent-foreground" : "border border-soon-border bg-soon-bg text-foreground",
        className,
      )}
    >
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center gap-2.5">
          {today ? (
            <OctagonAlert {...ICON} className="size-8 shrink-0" />
          ) : (
            <ClockAlert {...ICON} className="size-8 shrink-0 text-soon" />
          )}
          <h2 className={cn("min-w-0 text-[32px]/[37px] font-bold", !today && "text-soon-text")}>
            {m.enums.urgency[urgency]}
          </h2>
        </div>
        <p className="text-base/[23px] font-medium">
          {today
            ? copy.todaySubtitle
            : deadlineAt
              ? t(copy.within24Subtitle, {
                  date: fmtWeekdayDate(deadlineAt, locale),
                  time: fmtTime(deadlineAt, locale),
                })
              : null}
        </p>
      </div>

      {today ? (
        reasons.length > 0 && (
          <p className="w-full border-t border-urgent-foreground/25 pt-4 text-base/6">
            {copy.reasonsPrefix}
            {reasons.join(copy.reasonSeparator)}
          </p>
        )
      ) : (
        <p className="w-full border-t border-soon-border pt-4 text-base/6">{copy.within24Required}</p>
      )}

      {onFindRabiesCenter && (
        <Button
          type="button"
          variant={today ? "emergency" : "default"}
          // Full-width and centered: the narrower inset only matters on ≤360px cards, where it keeps one line.
          className="w-full px-4"
          onClick={onFindRabiesCenter}
        >
          <MapPin {...ICON} />
          {copy.findRabiesCenter}
        </Button>
      )}
    </motion.section>
  )
}
