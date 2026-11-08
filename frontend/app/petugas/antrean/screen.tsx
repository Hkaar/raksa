"use client"

import { ArrowRight, ChevronRight, TriangleAlert } from "lucide-react"
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { useRef } from "react"

import { AppHeaderDesktop } from "@/components/raksa/app-header-desktop"
import { OfficerGuard } from "@/components/raksa/officer-guard"
import { Screen } from "@/components/raksa/screen"
import { EscalationBadge, UrgencyBadge } from "@/components/raksa/status-badges"
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { caseView, type CaseView } from "@/lib/case-view"
import { activeCases, DEMO_NOW, sortQueue } from "@/lib/demo-data"
import { useDemoStore } from "@/lib/demo-store"
import { fmtSince } from "@/lib/format"
import { useI18n } from "@/lib/i18n/provider"
import { DURATION, EASE, easeTransition, fadeUp, staggerParent } from "@/lib/motion"
import type { AnimalStatus, Case } from "@/lib/types"
import { cn } from "@/lib/utils"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const
const QUEUE = sortQueue(activeCases())
const DAY_MS = 24 * 60 * 60 * 1000
/** Cases reported in the 24 h before the demo clock ("Kasus baru · 24 jam terakhir"). */
const NEW_CASES = QUEUE.filter((c) => {
  const age = DEMO_NOW - new Date(c.reportedAt).getTime()
  return age >= 0 && age < DAY_MS
}).length
/** Stat cell separators: one row of 4 at `lg`, 2×2 at `md`. */
const STAT_BORDER = ["", "border-l", "border-t lg:border-t-0 lg:border-l", "border-l border-t lg:border-t-0"]
const TRANSPARENT = "rgba(0, 0, 0, 0)"

type Row = { c: Case; v: CaseView; status: Exclude<AnimalStatus, "sehat"> | null }

/** Officer queue (pen `xt6J3` ≥1024px, `nDvwd` <768px; tablet shows the cards in two columns). */
export function OfficerQueueScreen() {
  const { m, t, locale } = useI18n()
  const copy = m.officer.queue
  const store = useDemoStore()
  const reduceMotion = useReducedMotion()
  const listRef = useRef<HTMLDivElement>(null)
  const rows: Row[] = QUEUE.map((c) => {
    const v = caseView(c, store)
    const status = v.escalated && v.animalStatus && v.animalStatus !== "sehat" ? v.animalStatus : null
    return { c, v, status }
  })

  const today = rows.filter((r) => r.c.urgency === "HARI_INI").length
  const sick = rows.filter((r) => r.v.escalated).length
  const stats = [
    { label: copy.stats.today, value: today, unit: copy.units.cases },
    { label: copy.stats.soon, value: rows.length - today, unit: copy.units.cases },
    { label: copy.stats.observation, value: rows.filter((r) => r.v.observation).length, unit: copy.units.running },
    { label: copy.stats.newCases, value: NEW_CASES, unit: copy.units.last24h },
  ]

  function observationText(r: Row, mobile: boolean) {
    if (r.v.observation) return t(copy.observationDay, { day: r.v.observationDay, total: r.v.observation.durationDays })
    if (!r.c.observationRequired) return mobile ? copy.noObservationMobile : "—"
    return m.common.observationNotStarted
  }

  /** "Tinjau": scroll to the list, then flash the escalated rows/cards (color only, reduced-motion safe). */
  function review() {
    const list = listRef.current
    if (!list) return
    list.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
    const flash = getComputedStyle(document.documentElement).getPropertyValue("--urgent-bg").trim()
    const targets = Array.from(list.querySelectorAll<HTMLElement>("[data-escalated]"))
    for (const el of targets) {
      animate(
        el,
        { backgroundColor: [TRANSPARENT, flash, flash, TRANSPARENT] },
        { duration: 1.4, times: [0, 0.2, 0.65, 1], ease: EASE, delay: reduceMotion ? 0 : 0.35 },
      ).then(() => {
        el.style.backgroundColor = ""
      })
    }
  }

  return (
    <OfficerGuard>
    <Screen layout="immersive">
      <AppHeaderDesktop />
      <div className="flex w-full flex-1 flex-col gap-4 px-4 py-6 md:gap-6 md:px-8 md:py-8 lg:p-10">
        <h1 className="text-[32px]/[35px] font-semibold text-foreground lg:font-bold">{copy.title}</h1>

        <div className="hidden w-full flex-col gap-4 md:flex">
          <AnimatePresence initial={false}>
            {sick > 0 ? (
              <motion.div
                key="escalation"
                role="status"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={easeTransition(DURATION.card)}
                className="overflow-hidden"
              >
                <div className="flex w-full items-center gap-4 rounded-md bg-urgent-bg py-3.5 pr-4 pl-5 outline-1 -outline-offset-[0.5px] outline-urgent-border">
                  <TriangleAlert {...ICON} className="size-[22px] shrink-0 text-urgent-text" />
                  <p className="min-w-0 flex-1 text-base font-bold text-urgent-text">{t(copy.escalation, { n: sick })}</p>
                  <button
                    type="button"
                    onClick={review}
                    className="-my-2 inline-flex h-12 shrink-0 items-center gap-1.5 rounded-full px-1 text-sm font-bold text-urgent-text transition-colors duration-[160ms] ease-[var(--ease-raksa)] hover:bg-urgent-text/8 [&_svg]:size-[18px]"
                  >
                    {copy.review}
                    <ArrowRight {...ICON} />
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <dl className="grid w-full grid-cols-2 overflow-hidden rounded-xl bg-card outline-1 -outline-offset-[0.5px] outline-border lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className={cn("flex min-w-0 flex-col gap-1.5 border-border px-6 py-5", STAT_BORDER[i])}>
                <dt className="text-sm font-medium text-muted-foreground">{s.label}</dt>
                <dd className="flex items-end gap-2">
                  <span className="text-[36px]/[36px] font-bold text-foreground">{s.value}</span>
                  <span className="pb-[3px] text-sm text-muted-foreground">{s.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div ref={listRef} className="w-full scroll-mt-4">
          {/* Table (≥1024px) */}
          <div className="hidden w-full overflow-hidden rounded-xl border border-border bg-card lg:block">
            <Table className="table-fixed text-base">
              <TableHeader>
                <TableRow className="h-11 border-border bg-surface-container-low hover:bg-surface-container-low">
                  <TableHead className="w-[120px] ps-5 text-sm font-normal text-muted-foreground xl:w-[140px]">
                    {copy.columns.code}
                  </TableHead>
                  <TableHead className="w-[160px] px-0 text-sm font-normal text-muted-foreground xl:w-[170px]">
                    {copy.columns.urgency}
                  </TableHead>
                  <TableHead className="w-[110px] px-0 text-sm font-normal text-muted-foreground xl:w-[130px]">
                    {copy.columns.category}
                  </TableHead>
                  <TableHead className="w-[110px] px-0 text-sm font-normal text-muted-foreground xl:w-[150px]">
                    {copy.columns.risk}
                  </TableHead>
                  <TableHead className="w-[130px] px-0 text-sm font-normal text-muted-foreground xl:w-[200px]">
                    {copy.columns.desa}
                  </TableHead>
                  <TableHead className="w-[100px] px-0 text-sm font-normal text-muted-foreground xl:w-[160px]">
                    {copy.columns.since}
                  </TableHead>
                  <TableHead className="px-0 text-sm font-normal text-muted-foreground">{copy.columns.observation}</TableHead>
                  <TableHead className="w-[52px] pe-5" />
                </TableRow>
              </TableHeader>
              <motion.tbody variants={staggerParent(0.04)} initial="hidden" animate="show">
                {rows.map((r) => {
                  const { status } = r
                  return (
                    <motion.tr
                      key={r.c.code}
                      variants={fadeUp}
                      data-escalated={r.v.escalated || undefined}
                      className="relative h-14 border-b border-border text-foreground transition-colors duration-[160ms] last:border-0 hover:bg-surface-container-low has-[a:focus-visible]:bg-surface-container-low"
                    >
                      <td className="ps-5 align-middle">
                        <Link
                          href={`/petugas/kasus/${r.c.code}`}
                          aria-label={t(copy.openCase, { code: r.c.code })}
                          className="font-medium outline-none after:absolute after:inset-0 focus-visible:underline"
                        >
                          #{r.c.code}
                        </Link>
                      </td>
                      <td className="align-middle">
                        <UrgencyBadge urgency={r.c.urgency} />
                      </td>
                      <td className="truncate align-middle">{m.enums.woundCategory[r.c.woundCategory]}</td>
                      <td className="truncate align-middle">{m.enums.animalRisk[r.c.animalRisk]}</td>
                      <td className="truncate pe-3 align-middle">{r.c.desa}</td>
                      <td className="truncate align-middle">{fmtSince(r.c.bittenAt, locale)}</td>
                      <td className="py-3 align-middle">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={r.v.observation ? "text-foreground" : "text-muted-foreground"}>
                            {observationText(r, false)}
                          </span>
                          {status ? <EscalationBadge status={status} /> : null}
                        </div>
                      </td>
                      <td className="pe-5 align-middle">
                        <div className="flex justify-end">
                          <ChevronRight {...ICON} className="size-5 text-foreground" />
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </motion.tbody>
            </Table>
          </div>

          {/* Cards (<1024px): one bordered list on phones (nDvwd), two columns of cards on tablets. */}
          <motion.ul
            variants={staggerParent(0.04)}
            initial="hidden"
            animate="show"
            className="flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:rounded-none md:border-0 md:bg-transparent lg:hidden"
          >
            {rows.map((r) => {
              const { status } = r
              return (
                <motion.li
                  key={r.c.code}
                  variants={fadeUp}
                  data-escalated={r.v.escalated || undefined}
                  className="border-b border-border last:border-b-0 md:overflow-hidden md:rounded-lg md:border md:bg-card md:last:border-b"
                >
                  <Link
                    href={`/petugas/kasus/${r.c.code}`}
                    aria-label={t(copy.openCase, { code: r.c.code })}
                    className="flex h-full flex-col items-start gap-2 p-4 transition-colors duration-[160ms] hover:bg-surface-container-low focus-visible:bg-surface-container-low focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus-ring"
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-base font-medium text-foreground">#{r.c.code}</span>
                      <UrgencyBadge urgency={r.c.urgency} />
                    </div>
                    <p className="text-[15px] text-foreground">
                      {t(copy.meta, {
                        category: m.enums.woundCategory[r.c.woundCategory],
                        risk: m.enums.animalRisk[r.c.animalRisk],
                        desa: r.c.desa,
                      })}
                    </p>
                    <div className="flex w-full flex-wrap items-center gap-2">
                      <p className="text-[13px] text-muted-foreground">
                        {t(copy.time, { since: fmtSince(r.c.bittenAt, locale), observation: observationText(r, true) })}
                      </p>
                      {status ? <EscalationBadge status={status} /> : null}
                    </div>
                  </Link>
                </motion.li>
              )
            })}
          </motion.ul>
        </div>

        <p className="text-sm text-muted-foreground">{copy.footnote}</p>
      </div>
    </Screen>
    </OfficerGuard>
  )
}
