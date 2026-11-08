"use client"

import { ArrowLeft, Copy, Eye, FlaskConical, Info, Link as LinkIcon, Send } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useState, useSyncExternalStore } from "react"
import { toast } from "sonner"

import { AppHeaderDesktop } from "@/components/raksa/app-header-desktop"
import { ChoiceGroup, ChoiceItem } from "@/components/raksa/choice-group"
import { ObservationTimeline } from "@/components/raksa/observation-timeline"
import { OfficerGuard } from "@/components/raksa/officer-guard"
import { Screen } from "@/components/raksa/screen"
import { CategoryBadge, EscalationBadge, InfoBadge, SavedBadge, UrgencyBadge } from "@/components/raksa/status-badges"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { caseText } from "@/lib/case-text"
import { caseView } from "@/lib/case-view"
import { demo, getCase } from "@/lib/demo-data"
import { startObservation, useDemoStore } from "@/lib/demo-store"
import { fmtFullDayTime, fmtSince } from "@/lib/format"
import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition } from "@/lib/motion"
import type { Case, ObservationDays } from "@/lib/types"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const
const noopSubscribe = () => () => {}
const SITE_ORIGIN = new URL(demo.meta.siteUrl).origin

function useOrigin() {
  return useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => SITE_ORIGIN,
  )
}

type SummaryRow = { label: string; value: string }

/** Officer case detail (pen `rRqjA` observation not started, `txgHS` running). */
export function OfficerCaseScreen({ code }: { code: string }) {
  const { m, t, locale } = useI18n()
  const copy = m.officer.detail
  const c = getCase(code) as Case
  const store = useDemoStore()
  const view = caseView(c, store)
  const text = caseText(c, m)
  const origin = useOrigin()
  const [days, setDays] = useState<ObservationDays>(14)

  const L = copy.labels
  const groups: { title: string; rows: SummaryRow[] }[][] = [
    [
      {
        title: copy.sections.incident,
        rows: [
          { label: L.bittenAt, value: fmtFullDayTime(c.bittenAt, locale) },
          { label: L.desa, value: text.desa },
        ],
      },
      {
        title: copy.sections.wound,
        rows: [
          { label: L.contact, value: m.enums.contact[c.wound.contact] },
          { label: L.bleeding, value: copy.bleeding[c.wound.bleeding] },
          { label: L.bodyPart, value: m.enums.bodyPart[c.wound.bodyPart] },
          { label: L.woundCount, value: copy.woundCount[c.wound.count] },
        ],
      },
    ],
    [
      {
        title: copy.sections.animal,
        rows: [
          { label: L.species, value: m.enums.species[c.animal.species] },
          { label: L.ownership, value: m.enums.ownership[c.animal.ownership] },
          { label: L.behavior, value: m.enums.behavior[c.animal.behavior] },
          { label: L.condition, value: m.enums.condition[c.animal.condition] },
          { label: L.animalNow, value: m.enums.animalNow[c.animal.animalNow] },
          { label: L.vaccine, value: m.enums.vaccineStatus[c.animal.vaccineStatus] },
        ],
      },
      { title: copy.sections.victim, rows: [{ label: L.ageGroup, value: m.enums.ageGroup[c.victim.ageGroup] }] },
    ],
  ]

  const ownerPath = `/h/${c.ownerToken}`
  const ownerUrl = `${origin}${ownerPath}`
  const ownerHost = `${new URL(origin).host}${ownerPath}`
  const related = c.relatedCases.map(getCase).filter((r): r is Case => Boolean(r))

  async function copySummary() {
    const lines = [
      t(copy.title, { code: c.code }),
      ...groups.flat().flatMap((g) => [`${g.title}`, ...g.rows.map((r) => `${r.label}: ${r.value}`)]),
    ]
    await navigator.clipboard.writeText(lines.join("\n"))
    toast(copy.summaryCopied)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(ownerUrl)
    toast(copy.linkCopied)
  }

  function start() {
    startObservation(c.code, days)
    toast(t(copy.started, { n: days }), { icon: <SavedBadge /> })
  }

  const card = "flex w-full flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-6"
  const obs = view.observation

  return (
    <OfficerGuard>
    <Screen layout="immersive">
      <AppHeaderDesktop />
      <div className="flex w-full flex-1 flex-col items-start gap-5 px-4 pt-6 pb-10 md:px-8 lg:px-10">
        <Button asChild variant="link" size="sm">
          <Link href="/petugas/antrean">
            <ArrowLeft {...ICON} />
            {copy.back}
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-[32px]/[35px] font-bold text-foreground">{t(copy.title, { code: c.code })}</h1>
          <UrgencyBadge urgency={c.urgency} />
          <CategoryBadge category={c.woundCategory} />
        </div>

        <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
          <section aria-labelledby="summary-title" className={`${card} @container min-w-0 flex-1`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="summary-title" className="text-[22px]/[25px] font-bold text-foreground">
                {copy.summaryTitle}
              </h2>
              <Button variant="outline" onClick={copySummary} className="h-12">
                <Copy {...ICON} />
                {copy.copySummary}
              </Button>
            </div>
            <div className="flex w-full flex-col gap-7 @[700px]:flex-row @[700px]:gap-8">
              {groups.map((column, ci) => (
                <div key={ci} className="flex min-w-0 flex-1 flex-col gap-1">
                  {column.map((g, gi) => (
                    <div key={g.title} className="flex flex-col gap-1">
                      {gi > 0 ? <div aria-hidden className="h-7" /> : null}
                      <h3 className="text-base font-medium text-foreground">{g.title}</h3>
                      <dl className="flex flex-col">
                        {g.rows.map((r) => (
                          <div
                            key={r.label}
                            className="flex flex-col gap-0.5 border-b border-border py-3 @[280px]:flex-row @[280px]:gap-4"
                          >
                            <dt className="text-base text-muted-foreground @[280px]:w-[130px] @[280px]:shrink-0">{r.label}</dt>
                            <dd className="min-w-0 text-base/6 font-medium text-foreground @[280px]:flex-1">{r.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <div className="flex w-full flex-col gap-6 lg:w-[480px] lg:shrink-0">
            {related.length > 0 ? (
              <section aria-labelledby="related-title" className={card}>
                <h2 id="related-title" className="text-base font-medium text-foreground">
                  {copy.relatedTitle}
                </h2>
                <ul className="flex flex-col gap-4">
                  {related.map((r) => (
                    <li key={r.code}>
                      <Link
                        href={`/petugas/kasus/${r.code}`}
                        className="flex min-h-[52px] items-center gap-3 rounded-md border border-border px-3 py-2 transition-colors duration-[160ms] hover:bg-surface-container-low"
                      >
                        <span className="text-base font-medium text-primary">#{r.code}</span>
                        <span className="min-w-0 flex-1 text-[15px] text-muted-foreground">
                          {t(copy.relatedMeta, { desa: r.desa, since: fmtSince(r.bittenAt, locale) })}
                        </span>
                        <UrgencyBadge urgency={r.urgency} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {c.observationRequired || obs ? (
              <section aria-labelledby="obs-title" className={card}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 id="obs-title" className="text-base font-medium text-foreground">
                    {obs
                      ? t(copy.observationRunningTitle, { day: view.observationDay, total: obs.durationDays })
                      : copy.observationTitle}
                  </h2>
                  {obs ? (
                    view.escalated && view.animalStatus && view.animalStatus !== "sehat" ? (
                      <EscalationBadge status={view.animalStatus} />
                    ) : (
                      <InfoBadge />
                    )
                  ) : (
                    <Badge variant="demo">
                      <FlaskConical {...ICON} />
                      {m.common.observationNotStarted}
                    </Badge>
                  )}
                </div>
                <ObservationTimeline day={view.observationDay} durationDays={obs?.durationDays ?? days} />

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={obs ? "running" : "not-started"}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={easeTransition(DURATION.card)}
                    className="flex w-full flex-col gap-4"
                  >
                    {obs ? (
                      <>
                        <p className="text-base font-medium text-foreground">{copy.linkLabel}</p>
                        <div className="flex h-12 w-full items-center gap-2 rounded-md border border-outline bg-muted px-3.5">
                          <LinkIcon {...ICON} className="size-[18px] shrink-0 text-primary" />
                          <span className="min-w-0 flex-1 truncate text-base text-foreground">{ownerHost}</span>
                        </div>
                        <div className="flex w-full flex-col gap-3 sm:flex-row">
                          <Button variant="outline" onClick={copyLink} className="sm:flex-auto">
                            <Copy {...ICON} />
                            {copy.copyLink}
                          </Button>
                          <Button asChild className="sm:flex-auto">
                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(ownerUrl)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Send {...ICON} />
                              {copy.whatsapp}
                            </a>
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{copy.linkNote}</p>
                      </>
                    ) : (
                      <>
                        <p id="duration-label" className="text-base font-medium text-foreground">
                          {copy.durationLabel}
                        </p>
                        <ChoiceGroup
                          layout="grid-2"
                          value={String(days)}
                          onValueChange={(v) => setDays(Number(v) as ObservationDays)}
                          aria-labelledby="duration-label"
                        >
                          {([10, 14] as const).map((n) => (
                            <ChoiceItem key={n} value={String(n)} label={t(copy.durationOption, { n })} />
                          ))}
                        </ChoiceGroup>
                        <p className="flex w-full items-center gap-2 rounded-md bg-muted px-4 py-3 text-sm/5 text-foreground">
                          <Info {...ICON} className="size-4 shrink-0" />
                          {copy.verifyNote}
                        </p>
                        <Button onClick={start} className="w-full">
                          <Eye {...ICON} />
                          {copy.start}
                        </Button>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </Screen>
    </OfficerGuard>
  )
}
