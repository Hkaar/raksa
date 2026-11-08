"use client"

import { Cat, CircleEllipsis, CircleQuestionMark, Dog, Droplet, DropletOff, PawPrint, type LucideIcon } from "lucide-react"
import type { Variants } from "motion/react"

import { ChoiceGroup, ChoiceItem } from "@/components/raksa/choice-group"
import { Reveal } from "@/components/raksa/motion"
import { DURATION, easeTransition } from "@/lib/motion"
import { useI18n } from "@/lib/i18n/provider"
import type { QuestionField } from "@/lib/types"

/** Delay between option entrances (s). */
const OPTION_STAGGER = 0.04

/**
 * Direction-aware step change for question pages: `custom` = 1 (forward) or -1 (back);
 * content enters 8px from the travel side and leaves 8px towards the opposite side.
 */
export const stepSlide: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: 8 * dir }),
  center: { opacity: 1, x: 0, transition: easeTransition(DURATION.enter) },
  exit: (dir: number) => ({ opacity: 0, x: -8 * dir, transition: easeTransition(DURATION.quick) }),
}

/** Option icons used in `NpAQ3` / `kbpfq`; other fields have none. */
const ICONS: Partial<Record<QuestionField, Record<string, LucideIcon>>> = {
  bleeding: { ya: Droplet, tidak: DropletOff, tidak_tahu: CircleQuestionMark },
  species: { anjing: Dog, kucing: Cat, kera: PawPrint, lainnya: CircleEllipsis },
}

/** Answer options of one draft field, labels from `m.enums.<field>`. */
export function QuestionChoices({
  field,
  value,
  onValueChange,
  variant,
  layout,
  withDescriptions,
  labelledBy,
}: {
  field: QuestionField
  value: string | undefined
  onValueChange: (value: string) => void
  variant?: "default" | "prominent"
  layout?: "list" | "grid-2"
  withDescriptions?: boolean
  labelledBy?: string
}) {
  const { m } = useI18n()
  const labels = m.enums[field] as Record<string, string>
  const icons = ICONS[field]
  const descriptions = withDescriptions && field === "bleeding" ? (m.questions.bleedingDescription as Record<string, string>) : null
  return (
    <ChoiceGroup
      value={value}
      onValueChange={onValueChange}
      variant={variant}
      layout={layout}
      aria-labelledby={labelledBy}
    >
      {Object.entries(labels).map(([code, label], i) => (
        <Reveal key={code} delay={i * OPTION_STAGGER} className="flex">
          <ChoiceItem value={code} label={label} icon={icons?.[code]} description={descriptions?.[code]} />
        </Reveal>
      ))}
    </ChoiceGroup>
  )
}
