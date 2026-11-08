"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bell, MapPin, Navigation, TriangleAlert } from "lucide-react"
import { AppHeader } from "@/components/raksa/app-header"
import { BottomBar } from "@/components/raksa/bottom-bar"
import { Stagger, StaggerItem } from "@/components/raksa/motion"
import { ObservationTimeline } from "@/components/raksa/observation-timeline"
import { Screen } from "@/components/raksa/screen"
import { InfoBadge, UrgencyBadge } from "@/components/raksa/status-badges"
import { UrgencyCard } from "@/components/raksa/urgency-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { caseView, type TimelineEntry } from "@/lib/case-view"
import { caseText } from "@/lib/case-text"
import { demo, getCase, mapsDirectionsUrl, nearestRabiesCenters } from "@/lib/demo-data"
import { useDemoStore } from "@/lib/demo-store"
import { fmtDayMonth, fmtDayTime, fmtFullDayTime, fmtTime } from "@/lib/format"
import { format, useI18n } from "@/lib/i18n/provider"
import type { Case } from "@/lib/types"
import { requestUserPosition, useUserOrigin } from "@/lib/user-location"
import { cn } from "@/lib/utils"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const
/** Duration shown on the empty timeline before an officer starts the observation. */
const DEFAULT_DURATION = 14

export function StatusScreen({ code }: { code: string }) {
  const c = getCase(code) as Case
  const { locale, m, t } = useI18n()
  const copy = m.status
  const router = useRouter()
  const view = caseView(c, useDemoStore())
  const text = caseText(c, m)
  const nearest = nearestRabiesCenters(useUserOrigin())[0]

  const ownership = format(m.caseUi.reportCard.animalOwnership[c.animal.ownership], {
    species: m.enums.species[c.animal.species].toLowerCase(),
  })
  const animal = `${ownership.charAt(0).toUpperCase()}${ownership.slice(1)}, ${m.enums.animalNow[c.animal.animalNow].toLowerCase()}`

  async function findRabiesCenter() {
    router.push((await requestUserPosition()) ? `/kasus/${c.code}/hasil#rabies-center` : "/rabies-center")
  }

  function eventText(e: TimelineEntry) {
    switch (e.kind) {
      case "bitten":
        return t(copy.events.bitten, { desa: e.desa })
      case "reported":
        return copy.events.reported
      case "observationStarted":
        return t(copy.events.observationStarted, { n: e.durationDays })
      case "lastReport":
        return e.status === "sehat"
          ? t(copy.events.stillMonitored, { day: e.day })
          : t(copy.events.escalated, { status: m.enums.animalStatus[e.status].toLowerCase() })
    }
  }

  const summaryRows: { label: string; value: string }[] = [
    { label: copy.biteTime, value: fmtFullDayTime(c.bittenAt, locale) },
    { label: copy.category, value: text.category },
    { label: copy.wound, value: text.wound },
    { label: copy.animal, value: animal },
    { label: copy.desa, value: text.desa },
  ]

  const obs = view.observation
  const lastReport = view.lastReport

  const action = view.escalated ? (
    <Button asChild>
      <a href={mapsDirectionsUrl(nearest)} target="_blank" rel="noopener noreferrer">
        <Navigation {...ICON} />
        {copy.routeNearest}
      </a>
    </Button>
  ) : (
    <Button asChild>
      <Link href={`/kasus/${c.code}/hasil#rabies-center`}>
        <MapPin {...ICON} />
        {copy.seeCenters}
      </Link>
    </Button>
  )

  return (
    <Screen layout="wide">
      <AppHeader className="md:px-8" />
      {/* Mobile = design (`IWpFX`/`f9Nnc`); lg: observation + timeline left, summary + action right. */}
      <Stagger className="flex w-full flex-col gap-9 px-4 py-8 md:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-x-12 lg:pb-12">
        <div className="contents lg:flex lg:flex-col lg:gap-9">
          <StaggerItem className="flex w-full flex-col gap-1.5">
            <p className="text-base text-muted-foreground">{t(copy.eyebrow, { code: c.code })}</p>
            <h1 className="text-[32px]/[35px] font-bold text-foreground">{copy.title}</h1>
          </StaggerItem>

          <StaggerItem className="w-full">
            {view.escalated ? (
              <UrgencyCard
                urgency="HARI_INI"
                reasons={c.explanation.reasons.map((r) => m.enums.reason[r])}
                onFindRabiesCenter={findRabiesCenter}
              />
            ) : (
              <section className="flex w-full flex-col gap-3">
                <h2 className="text-base text-muted-foreground">{copy.observation}</h2>
                <div className="flex w-full items-center justify-between gap-2">
                  {obs ? (
                    <>
                      <p className="text-[22px]/[25px] font-bold whitespace-nowrap text-foreground">
                        {t(m.caseUi.observationTimeline.label, { day: view.observationDay, total: obs.durationDays })}
                      </p>
                      <InfoBadge />
                    </>
                  ) : (
                    <Badge variant="who">{m.common.observationNotStarted}</Badge>
                  )}
                </div>
                <ObservationTimeline day={view.observationDay} durationDays={obs?.durationDays ?? DEFAULT_DURATION} />
                {lastReport && (
                  <p className="text-base/6 text-muted-foreground">
                    {t(copy.lastReport, {
                      date:
                        fmtDayMonth(lastReport.at, "id") === fmtDayMonth(demo.meta.now, "id")
                          ? m.common.today
                          : fmtDayMonth(lastReport.at, locale),
                      time: fmtTime(lastReport.at, locale),
                    })}
                  </p>
                )}
                <Alert role="note">
                  <Bell {...ICON} />
                  <AlertDescription>{copy.alert}</AlertDescription>
                </Alert>
              </section>
            )}
          </StaggerItem>

          <StaggerItem className="w-full">
            <section className="flex w-full flex-col gap-3.5">
              <h2 className="text-base/6 font-medium text-foreground">{copy.journey}</h2>
              <ol className="relative flex w-full flex-col">
                <span aria-hidden className="absolute top-3 bottom-3 left-[7px] w-0.5 bg-border" />
                {view.timeline.map((e, i) => {
                  const last = i === view.timeline.length - 1
                  const alarm = e.kind === "lastReport" && e.status !== "sehat"
                  return (
                    <li key={e.kind} className="relative flex w-full items-start gap-3.5">
                      <span className="flex w-4 shrink-0 justify-center pt-[5px]">
                        <span className={cn("size-3.5 rounded-full", alarm ? "bg-foreground" : "bg-primary")} />
                      </span>
                      <div className={cn("flex flex-1 flex-col gap-0.5", !last && "pb-[18px]")}>
                        <p className="text-sm/[21px] text-muted-foreground">{fmtDayTime(e.at, locale)}</p>
                        <div className="flex w-full flex-wrap items-center gap-2">
                          {alarm && <TriangleAlert {...ICON} className="size-[18px] text-destructive" />}
                          <p className={cn("text-base/6 text-foreground", last && "font-medium")}>{eventText(e)}</p>
                          {e.kind === "reported" && <UrgencyBadge urgency={e.urgency} />}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>
          </StaggerItem>
        </div>

        <StaggerItem className="flex w-full flex-col gap-6 lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1">
          <section className="flex w-full flex-col">
            <h2 className="text-base font-medium text-foreground">{copy.summary}</h2>
            <div className="flex w-full flex-col items-start gap-1.5 border-b border-border py-3">
              <p className="text-base text-muted-foreground">
                {t(copy.initialResult, {
                  date: fmtDayMonth(c.reportedAt, locale),
                  time: fmtTime(c.reportedAt, locale),
                })}
              </p>
              <UrgencyBadge urgency={c.urgency} />
            </div>
            {summaryRows.map((row) => (
              <div key={row.label} className="flex w-full flex-col gap-0.5 border-b border-border py-3">
                <p className="text-base text-muted-foreground">{row.label}</p>
                <p className="text-base/[22px] text-foreground">{row.value}</p>
              </div>
            ))}
          </section>
          <div className="hidden w-full lg:flex [&>*]:flex-1">{action}</div>
        </StaggerItem>
      </Stagger>
      <BottomBar className="pb-7 md:px-8 lg:hidden">{action}</BottomBar>
    </Screen>
  )
}
