import Link from "next/link"
import type { ReactNode } from "react"

import { LanguageToggle } from "@/components/raksa/language-toggle"
import { LogoHeader } from "@/components/raksa/logo"
import { cn } from "@/lib/utils"

/**
 * AppHeader (pen `jDphz`, 76px). With `context` it renders the owner variant
 * (pen `lLhrW` AppHeader/Owner: 64px, bottom border, logo + context label).
 */
export function AppHeader({
  context,
  trailing,
  logoHref = "/beranda",
  className,
}: {
  context?: string
  /** Extra actions rendered before the language toggle. */
  trailing?: ReactNode
  /** `null` renders the logo without a link. */
  logoHref?: string | null
  className?: string
}) {
  const logo = logoHref ? (
    <Link href={logoHref} className="inline-flex shrink-0 rounded-xs">
      <LogoHeader />
    </Link>
  ) : (
    <LogoHeader />
  )
  if (context) {
    return (
      <header
        className={cn(
          "flex h-16 w-full shrink-0 items-center justify-between border-b border-border bg-background pr-2 pl-4",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          {logo}
          <span className="text-base whitespace-nowrap text-muted-foreground">{context}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {trailing}
          <LanguageToggle variant="owner" />
        </div>
      </header>
    )
  }
  return (
    <header
      className={cn(
        "flex h-[76px] w-full shrink-0 items-center justify-between bg-background pt-3 pr-1 pl-4",
        className,
      )}
    >
      {logo}
      <div className="flex items-center gap-0.5">
        {trailing}
        <LanguageToggle />
      </div>
    </header>
  )
}
