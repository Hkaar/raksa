"use client"

import { Languages } from "lucide-react"

import { useI18n } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

/**
 * mobile: 48px round button with the OTHER locale code (pen `jDphz`).
 * owner: 44px, 16px on-surface label (pen `lLhrW`).
 * desktop: 40px pill, `languages` icon + CURRENT locale code (pen `YLppX`).
 */
export function LanguageToggle({
  variant = "mobile",
  className,
}: {
  variant?: "mobile" | "owner" | "desktop"
  className?: string
}) {
  const { locale, m, setLocale } = useI18n()
  const toggle = () => setLocale(locale === "id" ? "en" : "id")
  if (variant === "desktop") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={m.common.switchLocaleLabel}
        className={cn(
          "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-base font-medium text-muted-foreground transition-colors duration-[160ms] ease-[var(--ease-raksa)] hover:bg-foreground/8",
          className,
        )}
      >
        <Languages aria-hidden strokeWidth={1.75} className="size-[18px]" />
        {locale.toUpperCase()}
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={m.common.switchLocaleLabel}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium transition-colors duration-[160ms] ease-[var(--ease-raksa)] hover:bg-foreground/8",
        variant === "owner"
          ? "size-12 text-base text-foreground"
          : "size-12 text-sm tracking-[0.1px] text-muted-foreground",
        className,
      )}
    >
      {m.common.switchLocaleCode}
    </button>
  )
}
