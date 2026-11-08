"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FieldError } from "@/components/ui/field"
import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition } from "@/lib/motion"

/**
 * Field box shared by Input (`zj0ki`) and Textarea (`NzaIq`) with the design's small label (12px)
 * inside the box above the value. Focus → 2px primary border + primary label (`bfM2c`, `b8zgHY`);
 * error → 2px error border + error label + FieldError helper (`DHGIR`).
 */
const BOX =
  "group/labeled flex w-full cursor-text gap-3 rounded-md border border-outline px-4 transition-[border-color] duration-[120ms] ease-[var(--ease-raksa)] focus-within:border-2 focus-within:border-primary focus-within:px-[15px] has-aria-invalid:border-2 has-aria-invalid:border-destructive has-aria-invalid:px-[15px] has-disabled:cursor-not-allowed has-disabled:opacity-40"
const LABEL =
  "text-xs tracking-[0.4px] whitespace-nowrap text-muted-foreground group-focus-within/labeled:text-primary group-has-aria-invalid/labeled:text-destructive"
/** Strips the standalone field chrome from the wrapped shadcn control. */
const BARE =
  "rounded-none border-0 bg-transparent p-0 focus-visible:border-0 focus-visible:p-0 aria-invalid:border-0 aria-invalid:p-0"

/** FieldError under a field that fades + expands in/out (4px gap included so the field never jumps). */
function AnimatedFieldError({ id, error }: { id: string; error?: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {error ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={easeTransition(DURATION.quick)}
          className="overflow-hidden"
        >
          <FieldError id={id} className="pt-1">
            {error}
          </FieldError>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

type LabeledInputProps = Omit<React.ComponentProps<typeof Input>, "className"> & {
  label: React.ReactNode
  /** Error text under the field; also sets `aria-invalid`. */
  error?: React.ReactNode
  /** Rendered inside the field box after the input (e.g. a 48px password visibility button). */
  trailing?: React.ReactNode
  className?: string
}

/** Input (`zj0ki`) with label inside the 56px field. */
export function LabeledInput({ label, error, trailing, className, id, ...props }: LabeledInputProps) {
  const autoId = React.useId()
  const inputId = id ?? autoId
  const errorId = `${inputId}-error`
  return (
    <div className={cn("flex w-full flex-col", className)}>
      <label htmlFor={inputId} className={cn(BOX, "h-14 items-center py-2")}>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className={LABEL}>{label}</span>
          <Input
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(BARE, "h-6")}
            {...props}
          />
        </span>
        {trailing}
      </label>
      <AnimatedFieldError id={errorId} error={error} />
    </div>
  )
}

type LabeledTextareaProps = Omit<React.ComponentProps<typeof Textarea>, "className" | "value"> & {
  label: React.ReactNode
  value: string
  error?: React.ReactNode
  /** Field box height class; design default 160px (`NzaIq`), 200px on `b8zgHY`. */
  fieldClassName?: string
  className?: string
}

/** Textarea (`NzaIq`) with label inside the field and an "n/max" counter when `maxLength` is set. */
export function LabeledTextarea({
  label,
  value,
  error,
  maxLength,
  fieldClassName,
  className,
  id,
  ...props
}: LabeledTextareaProps) {
  const { m, t } = useI18n()
  const autoId = React.useId()
  const inputId = id ?? autoId
  const errorId = `${inputId}-error`
  return (
    <div className={cn("flex w-full flex-col", className)}>
      <label
        htmlFor={inputId}
        className={cn(BOX, "h-40 items-start py-2.5 focus-within:py-[9px] has-aria-invalid:py-[9px]", fieldClassName)}
      >
        <span className="flex size-full min-w-0 flex-1 flex-col gap-0.5">
          <span className={LABEL}>{label}</span>
          <Textarea
            id={inputId}
            value={value}
            maxLength={maxLength}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(BARE, "min-h-0 flex-1 focus-visible:py-0 aria-invalid:py-0")}
            {...props}
          />
        </span>
      </label>
      {maxLength != null ? (
        <div aria-live="polite" className="w-full pt-1 text-end text-xs tracking-[0.4px] text-muted-foreground">
          {t(m.ui.counter, { n: value.length, max: maxLength })}
        </div>
      ) : null}
      <AnimatedFieldError id={errorId} error={error} />
    </div>
  )
}

export type LabeledSelectOption = { value: string; label: React.ReactNode }

type LabeledSelectProps = {
  label: React.ReactNode
  placeholder: React.ReactNode
  options: readonly LabeledSelectOption[]
  value: string | undefined
  onValueChange: (value: string) => void
  error?: React.ReactNode
  name?: string
  disabled?: boolean
  id?: string
  className?: string
}

/** Select (`IRJ9w`) with label inside the 56px field and the open list styled as `bfM2c`. */
export function LabeledSelect({
  label,
  placeholder,
  options,
  value,
  onValueChange,
  error,
  name,
  disabled,
  id,
  className,
}: LabeledSelectProps) {
  const autoId = React.useId()
  const triggerId = id ?? autoId
  const errorId = `${triggerId}-error`
  return (
    <div className={cn("flex w-full flex-col", className)}>
      <Select value={value ?? ""} onValueChange={onValueChange} name={name} disabled={disabled}>
        <SelectTrigger
          id={triggerId}
          label={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <AnimatedFieldError id={errorId} error={error} />
    </div>
  )
}
