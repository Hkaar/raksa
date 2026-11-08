"use client"

import { useSyncExternalStore, type Ref } from "react"
import { ClockAlert, OctagonAlert } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { LogoHeader } from "@/components/raksa/logo"
import { UrgencyBadge } from "@/components/raksa/status-badges"
import { caseText } from "@/lib/case-text"
import { demo } from "@/lib/demo-data"
import { addHours, fmtDateTime, fmtTime, fmtWeekdayDate } from "@/lib/format"
import { useI18n } from "@/lib/i18n/provider"
import type { Case } from "@/lib/types"
import { cn } from "@/lib/utils"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const
const noopSubscribe = () => () => {}

/** Kartu laporan (pen `hDj7e`): fixed 1080×1350 shareable card with a QR code to the case page. */
export function ReportCard({ caseData: c, ref, className }: { caseData: Case; ref?: Ref<HTMLDivElement>; className?: string }) {
  const { locale, m, t } = useI18n()
  const copy = m.caseUi.reportCard
  const text = caseText(c, m)
  const origin = useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => demo.meta.siteUrl,
  )
  const today = c.urgency === "HARI_INI"
  const deadlineAt = addHours(c.bittenAt, 24)

  const rows = [
    [
      [copy.biteTime, fmtDateTime(c.bittenAt, locale)],
      [copy.category, text.category],
    ],
    [
      [copy.wound, text.wound],
      [copy.animal, text.animal],
    ],
    [
      [copy.vaccine, text.vaccine],
      [copy.desa, text.desa],
    ],
  ] as const

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-[1350px] w-[1080px] shrink-0 flex-col items-start gap-8 overflow-hidden bg-card p-16 font-sans text-foreground",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between">
        <LogoHeader />
        <p className="text-[45px]/[50px] font-bold whitespace-nowrap">{t(copy.caseTitle, { code: c.code })}</p>
      </div>

      <div
        className={cn(
          "flex w-full items-center gap-8 rounded-xl px-11 py-9",
          today ? "bg-urgent text-urgent-foreground" : "border-2 border-soon-border bg-soon-bg text-foreground",
        )}
      >
        {today ? (
          <OctagonAlert {...ICON} className="size-24 shrink-0" />
        ) : (
          <ClockAlert {...ICON} className="size-24 shrink-0 text-soon" />
        )}
        <div className="flex flex-1 flex-col gap-2">
          <p className={cn("text-[88px]/[92px] font-medium whitespace-nowrap", !today && "text-soon-text")}>
            {m.enums.urgency[c.urgency]}
          </p>
          <p className="text-[36px]/[49px]">
            {today
              ? m.caseUi.urgencyCard.todaySubtitle
              : t(m.caseUi.urgencyCard.within24Subtitle, {
                  date: fmtWeekdayDate(deadlineAt, locale),
                  time: fmtTime(deadlineAt, locale),
                })}
          </p>
        </div>
      </div>

      <dl className="flex w-full flex-col">
        {rows.map((row) => (
          <div key={row[0][0]} className="flex w-full items-start gap-12 border-b-2 border-border py-5">
            {row.map(([label, value]) => (
              <div key={label} className="flex flex-1 flex-col gap-1.5">
                <dt className="text-[28px] whitespace-nowrap text-muted-foreground">{label}</dt>
                <dd className="text-[36px]/[47px] font-bold">{value}</dd>
              </div>
            ))}
          </div>
        ))}
      </dl>

      <div className="flex w-full items-center gap-10">
        <div className="size-[220px] shrink-0 rounded-sm border-2 border-border bg-card p-3">
          <QRCodeSVG
            value={`${origin}/kasus/${c.code}`}
            size={192}
            marginSize={0}
            fgColor="currentColor"
            bgColor="transparent"
            title={t(copy.qrLabel, { code: c.code })}
            className="size-[192px]"
          />
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <p className="text-[28px]/[38px] font-bold">{copy.scan}</p>
          <p className="text-[28px]/[39px] text-muted-foreground">{copy.disclaimer}</p>
          <p className="text-[28px] whitespace-nowrap text-muted-foreground">
            {t(copy.created, { date: fmtDateTime(c.reportedAt, locale) })}
          </p>
        </div>
      </div>
    </div>
  )
}

/** Kartu laporan preview (pen `wMP4a` in `ZRxtB`): wordmark, case code, urgency badge, summary line. */
export function ReportCardMini({ caseData: c, className }: { caseData: Case; className?: string }) {
  const { m, t } = useI18n()
  return (
    <div className={cn("flex w-full min-w-0 flex-col items-start gap-3.5 rounded-xl border border-border bg-card p-5", className)}>
      <div className="flex w-full items-center justify-between gap-3">
        <p className="text-sm font-bold tracking-[1px] whitespace-nowrap text-muted-foreground">{m.common.appName}</p>
        <p className="text-base font-medium whitespace-nowrap text-foreground">
          {t(m.caseUi.reportCard.caseTitle, { code: c.code })}
        </p>
      </div>
      <UrgencyBadge urgency={c.urgency} />
      <p className="w-full text-base/6 text-muted-foreground">{caseText(c, m).summary}</p>
    </div>
  )
}
