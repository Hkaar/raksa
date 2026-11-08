"use client"

import { Hospital, ListChecks, MessageSquareText } from "lucide-react"
import { motion } from "motion/react"

import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition, fadeUp, staggerParent } from "@/lib/motion"
import { cn } from "@/lib/utils"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const
const STEP_GAP = 0.08

/** "Cara kerjanya" stepper as drawn on Beranda `h7Hb2z`: three steps joined by connector lines.
 * Steps stagger in; each connector then grows from the previous step towards the next. */
export function HowItWorks({ className }: { className?: string }) {
  const { m } = useI18n()
  const steps = [
    { icon: MessageSquareText, label: m.chrome.howItWorks.tell },
    { icon: ListChecks, label: m.chrome.howItWorks.check },
    { icon: Hospital, label: m.chrome.howItWorks.facility },
  ]
  return (
    <motion.ol
      className={cn("flex w-full items-start", className)}
      variants={staggerParent(STEP_GAP)}
      initial="hidden"
      animate="show"
    >
      {steps.map(({ icon: Icon, label }, i) => (
        <li key={label} className={cn("flex items-start", i > 0 && "flex-1")}>
          {i > 0 ? (
            <span aria-hidden className="flex h-12 flex-1 items-center">
              <motion.span
                className="h-0.5 flex-1 origin-left rounded-xs bg-border"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={easeTransition(DURATION.sheet, 0.04 + STEP_GAP * (i - 1) + DURATION.quick)}
              />
            </span>
          ) : null}
          <motion.span variants={fadeUp} className="flex w-[72px] shrink-0 flex-col items-center gap-2">
            <span className="flex size-12 items-center justify-center text-primary">
              <Icon {...ICON} className="size-[22px]" />
            </span>
            <span className="text-sm font-medium whitespace-nowrap text-foreground">{label}</span>
          </motion.span>
        </li>
      ))}
    </motion.ol>
  )
}
