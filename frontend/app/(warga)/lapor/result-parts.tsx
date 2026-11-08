"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, ChevronRight, Info, type LucideIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition, fadeUp, staggerParent } from "@/lib/motion"
import { cn } from "@/lib/utils"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const

/** 76px top bar with round back button + title (`q45po`, `H3lkO`, `cnrdA` Top Bar). */
export function SubpageBar({ title }: { title: string }) {
  const router = useRouter()
  const { m } = useI18n()
  return (
    <header className="flex h-[76px] w-full shrink-0 items-center gap-3 px-5 pt-3">
      <button
        type="button"
        aria-label={m.common.back}
        onClick={() => router.back()}
        className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-foreground outline outline-1 -outline-offset-[0.5px] outline-border transition-colors duration-[160ms] ease-[var(--ease-raksa)] hover:bg-surface-container-low focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus-ring before:absolute before:-inset-0.5 before:content-['']"
      >
        <ArrowLeft {...ICON} className="size-5" />
      </button>
      <h1 className="text-base font-medium whitespace-nowrap text-foreground">{title}</h1>
    </header>
  )
}

/** Summary card: 76px thumb + title/sub (`H3lkO`/`cnrdA` Summary). */
export function ResultSummary({ thumb, title, sub }: { thumb: ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex w-full items-center gap-3.5 rounded-xl bg-card p-3 outline outline-1 -outline-offset-[0.5px] outline-border">
      <div className="relative flex size-[76px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {thumb}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-base/[normal] font-medium text-foreground">{title}</p>
        {sub ? <p className="text-sm/[normal] text-muted-foreground">{sub}</p> : null}
      </div>
    </div>
  )
}

/** Findings section: title + right hint ("Ketuk untuk ubah" text or an icon + label node), then the list. */
export function Findings({ title, hint, children }: { title: string; hint: ReactNode; children: ReactNode }) {
  return (
    <section className="flex w-full flex-col gap-2.5">
      <div className="flex w-full items-center justify-between gap-3">
        <h2 className="text-base/[normal] font-medium text-foreground">{title}</h2>
        {typeof hint === "string" ? <span className="text-sm/[normal] text-muted-foreground">{hint}</span> : hint}
      </div>
      {children}
    </section>
  )
}

/** Rounded list of editable result rows (`H3lkO`/`cnrdA` List); rows stagger in on mount. */
export function ResultList({ children }: { children: ReactNode }) {
  return (
    <motion.ul
      variants={staggerParent(0.05, 0.08)}
      initial="hidden"
      animate="show"
      className="flex w-full flex-col divide-y divide-border overflow-hidden rounded-xl bg-card outline outline-1 -outline-offset-[0.5px] outline-border"
    >
      {children}
    </motion.ul>
  )
}

export type ResultBadgeTone = "soon" | "ok"

const BADGE_TONE: Record<ResultBadgeTone, string> = {
  soon: "bg-soon-bg text-soon-text",
  ok: "bg-ok-bg text-ok-text",
}

/**
 * One editable row: label over value, optional pill badge, trailing chevron (`H3lkO`/`cnrdA` Row).
 * `muted` renders the value as unread/empty (regular weight, muted color). Value changes cross-fade.
 */
export function ResultRow({
  label,
  value,
  muted = false,
  badge,
  onEdit,
}: {
  label: string
  value: string
  muted?: boolean
  badge?: { label: string; tone: ResultBadgeTone }
  onEdit: () => void
}) {
  return (
    <motion.li variants={fadeUp}>
      <button
        type="button"
        onClick={onEdit}
        className="flex min-h-12 w-full items-center gap-3 py-3.5 pr-4 pl-5 text-start transition-colors duration-[160ms] ease-[var(--ease-raksa)] outline-none hover:bg-state-hover focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus-ring"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm/[normal] text-muted-foreground">{label}</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={value}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={easeTransition(DURATION.quick)}
              className={cn(
                "text-base/[normal] break-words",
                muted ? "font-normal text-muted-foreground" : "font-medium text-foreground",
              )}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </span>
        {badge ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs/[normal] font-medium whitespace-nowrap",
              BADGE_TONE[badge.tone],
            )}
          >
            {badge.label}
          </span>
        ) : null}
        <ChevronRight {...ICON} className="size-[18px] shrink-0 text-muted-foreground" />
      </button>
    </motion.li>
  )
}

/** Muted info note (`H3lkO`/`cnrdA` Disclaimer). */
export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <Alert variant="muted" role="note">
      <Info {...ICON} />
      <AlertDescription className="tracking-normal">{children}</AlertDescription>
    </Alert>
  )
}

/** Footer: primary CTA with trailing arrow + Teks retake action. */
export function ResultFooter({
  primary,
  onPrimary,
  secondary,
  secondaryIcon: SecondaryIcon,
  onSecondary,
}: {
  primary: string
  onPrimary: () => void
  secondary: string
  secondaryIcon: LucideIcon
  onSecondary: () => void
}) {
  return (
    <div className="sticky bottom-0 flex w-full shrink-0 flex-col items-center bg-background px-5 pt-4 pb-[max(13px,env(safe-area-inset-bottom))]">
      <Button type="button" onClick={onPrimary} className="h-[58px] w-full gap-2.5">
        {primary}
        <ArrowRight {...ICON} className="size-5" />
      </Button>
      <Button type="button" variant="link" size="sm" onClick={onSecondary} className="gap-1.5">
        <SecondaryIcon {...ICON} className="size-4" />
        {secondary}
      </Button>
    </div>
  )
}
