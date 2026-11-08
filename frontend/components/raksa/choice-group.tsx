"use client"

import * as React from "react"
import { Check, type LucideIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { DURATION, easeTransition } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const

type ChoiceVariant = "default" | "prominent"

const ChoiceContext = React.createContext<{ variant: ChoiceVariant; indicator: boolean; value: string | undefined }>({
  variant: "default",
  indicator: true,
  value: undefined,
})

/** Selected-state mark (check / radio ring) scales in on selection; instant with reduced motion. */
const MARK_MOTION = {
  initial: { scale: 0.4, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.4, opacity: 0 },
  transition: easeTransition(DURATION.quick),
} as const

type ChoiceGroupProps = {
  value: string | undefined
  /** Called with the newly selected value; deselecting the active item is ignored. */
  onValueChange: (value: string) => void
  /** `list` = stacked rows (12px gap); `grid-2` = 2-column tiles (`kbpfq` animal grid, `rRqjA` duration). */
  layout?: "list" | "grid-2"
  /**
   * `default` = ToggleGroupItem (`IGXi7`; selected as in `kbpfq`/`rRqjA`: secondary-container fill,
   * 6px primary ring indicator). `prominent` = big answer cards of the question screen (`NpAQ3`:
   * 28px radius, muted fill; selected = primary fill, white check badge).
   */
  variant?: ChoiceVariant
  /** Trailing radio indicator (hidden on the owner report `lLhrW`). */
  indicator?: boolean
  disabled?: boolean
  "aria-label"?: string
  "aria-labelledby"?: string
  className?: string
  children: React.ReactNode
}

export function ChoiceGroup({
  value,
  onValueChange,
  layout = "list",
  variant = "default",
  indicator = true,
  disabled,
  className,
  children,
  ...aria
}: ChoiceGroupProps) {
  const ctx = React.useMemo(() => ({ variant, indicator, value }), [variant, indicator, value])
  return (
    <ToggleGroup
      type="single"
      value={value ?? ""}
      onValueChange={(next: string) => {
        if (next) onValueChange(next)
      }}
      disabled={disabled}
      spacing={3}
      orientation={layout === "list" ? "vertical" : "horizontal"}
      className={cn(
        "w-full rounded-none",
        layout === "grid-2" ? "grid grid-cols-2 gap-3" : "flex flex-col items-stretch gap-3",
        className
      )}
      {...aria}
    >
      <ChoiceContext value={ctx}>{children}</ChoiceContext>
    </ToggleGroup>
  )
}

type ChoiceItemProps = {
  value: string
  label: React.ReactNode
  description?: React.ReactNode
  icon?: LucideIcon
  /** Stronger outline border (warning answers on `lLhrW`: Sakit / Mati / Hilang). */
  emphasis?: boolean
  className?: string
}

export function ChoiceItem({ value, label, description, icon: Icon, emphasis, className }: ChoiceItemProps) {
  const { variant, indicator, value: groupValue } = React.useContext(ChoiceContext)
  const selected = groupValue === value

  if (variant === "prominent") {
    return (
      <ToggleGroupItem
        value={value}
        className={cn(
          "group/choice flex h-auto min-h-[72px] w-full min-w-0 items-center justify-start gap-3.5 rounded-xl border-0 bg-muted px-4 py-3.5 text-start font-normal whitespace-normal text-foreground transition-colors duration-[160ms] ease-[var(--ease-raksa)] hover:bg-surface-container-highest hover:text-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary-hover data-[state=on]:hover:text-primary-foreground aria-pressed:bg-primary",
          className
        )}
      >
        {Icon ? (
          <span className="flex h-11 w-[22px] shrink-0 items-center justify-center">
            <Icon {...ICON} className="size-[22px] text-primary group-data-[state=on]/choice:text-primary-foreground" />
          </span>
        ) : null}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-base font-medium">{label}</span>
          {description ? (
            <span className="text-sm text-muted-foreground group-data-[state=on]/choice:text-primary-container">
              {description}
            </span>
          ) : null}
        </span>
        {indicator ? (
          <span aria-hidden className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-card">
            <AnimatePresence initial={false}>
              {selected ? (
                <motion.span key="check" {...MARK_MOTION} className="flex">
                  <Check {...ICON} className="size-4 text-primary" />
                </motion.span>
              ) : null}
            </AnimatePresence>
          </span>
        ) : null}
      </ToggleGroupItem>
    )
  }

  return (
    <ToggleGroupItem
      value={value}
      className={cn(
        "group/choice flex h-auto min-h-14 w-full min-w-0 items-center justify-start gap-4 rounded-md border bg-card px-4 py-2 text-start text-base font-normal tracking-[0.5px] whitespace-normal text-foreground transition-colors duration-[160ms] ease-[var(--ease-raksa)] hover:bg-surface-container-low hover:text-foreground data-[state=on]:border-transparent data-[state=on]:bg-secondary-container data-[state=on]:text-on-secondary-container data-[state=on]:hover:bg-secondary-container data-[state=on]:hover:text-on-secondary-container aria-pressed:bg-secondary-container",
        emphasis ? "border-outline" : "border-border",
        className
      )}
    >
      {Icon ? (
        <Icon
          {...ICON}
          className="size-6 shrink-0 text-muted-foreground group-data-[state=on]/choice:text-on-secondary-container"
        />
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span>{label}</span>
        {description ? (
          <span className="text-sm tracking-[0.25px] text-muted-foreground">{description}</span>
        ) : null}
      </span>
      {indicator ? (
        <span
          aria-hidden
          className="relative size-5 shrink-0 rounded-full border-2 border-muted-foreground transition-colors duration-[160ms] ease-[var(--ease-raksa)] group-data-[state=on]/choice:border-primary"
        >
          <AnimatePresence initial={false}>
            {selected ? (
              <motion.span key="ring" {...MARK_MOTION} className="absolute -inset-0.5 rounded-full border-[6px] border-primary" />
            ) : null}
          </AnimatePresence>
        </span>
      ) : null}
    </ToggleGroupItem>
  )
}
