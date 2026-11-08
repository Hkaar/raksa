"use client"

import { ArrowLeft } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition } from "@/lib/motion"
import { cn } from "@/lib/utils"

const backClass =
  "relative inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-foreground outline outline-1 -outline-offset-[0.5px] outline-border transition-colors duration-[160ms] ease-[var(--ease-raksa)] hover:bg-surface-container-low focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus-ring before:absolute before:-inset-0.5 before:content-['']"

/**
 * Top bar of lapor flow screens (pens `B7QRK`, `a6OIN`, `NpAQ3`): back, segmented progress, "n/total".
 * The current step's segment fills from the left on mount / step change (earlier ones start full).
 */
export function FlowHeader({
  step,
  total,
  onBack,
  backHref,
  trailing,
  className,
}: {
  step: number
  total: number
  onBack?: () => void
  backHref?: string
  trailing?: ReactNode
  className?: string
}) {
  const router = useRouter()
  const { m, t } = useI18n()
  const icon = <ArrowLeft aria-hidden strokeWidth={1.75} className="size-5" />
  return (
    <header className={cn("flex h-[76px] w-full shrink-0 items-center gap-4 px-5 pt-3", className)}>
      {backHref ? (
        <Link href={backHref} aria-label={m.common.back} className={backClass}>
          {icon}
        </Link>
      ) : (
        <button
          type="button"
          aria-label={m.common.back}
          onClick={onBack ?? (() => router.back())}
          className={backClass}
        >
          {icon}
        </button>
      )}
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step}
        aria-label={t(m.common.stepOf, { n: step, total })}
        className="flex flex-1 gap-1.5"
      >
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-xs bg-border">
            <motion.div
              className="size-full origin-left rounded-xs bg-primary"
              initial={{ scaleX: i < step - 1 ? 1 : 0 }}
              animate={{ scaleX: i < step ? 1 : 0 }}
              transition={easeTransition(DURATION.sheet, i === step - 1 ? 0.08 : 0)}
            />
          </div>
        ))}
      </div>
      <span aria-hidden className="text-sm font-medium whitespace-nowrap text-muted-foreground">
        {step}/{total}
      </span>
      {trailing}
    </header>
  )
}
