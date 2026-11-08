"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

import { LanguageToggle } from "@/components/raksa/language-toggle"
import { LogoHeader } from "@/components/raksa/logo"
import { useI18n } from "@/lib/i18n/provider"
import { signOutOfficer } from "@/lib/officer-session"
import { cn } from "@/lib/utils"

/**
 * Officer header. ≥1024px: AppHeader/Desktop (pen `YLppX`, 72px, no fill): logo · language + "Keluar".
 * <1024px: AppHeader/Officer Mobile (pen `nDvwd`, 76px): logo + "Petugas", with compact
 * language and log-out buttons on the right.
 */
export function AppHeaderDesktop({
  showLogout = true,
  className,
}: {
  /** Hidden on the sign-in screen (`UTLPY`). */
  showLogout?: boolean
  className?: string
}) {
  const { m } = useI18n()
  const router = useRouter()
  async function logout() {
    await signOutOfficer()
    router.replace("/petugas/masuk")
  }
  return (
    <header className={cn("relative z-10 w-full shrink-0 bg-background", className)}>
      <div className="hidden h-[72px] items-center justify-between px-8 lg:flex">
        <LogoHeader />
        <div className="flex items-center gap-2">
          <LanguageToggle variant="desktop" className="text-sm tracking-[0.1px]" />
          {showLogout ? (
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium tracking-[0.1px] text-muted-foreground transition-colors duration-[160ms] ease-[var(--ease-raksa)] hover:bg-foreground/8 [&_svg]:size-[18px]"
            >
              <LogOut aria-hidden strokeWidth={1.75} />
              {m.chrome.logout}
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex h-[76px] items-center justify-between pt-3 pr-1 pl-4 lg:hidden">
        <div className="flex items-center gap-3">
          <LogoHeader />
          <span className="text-sm font-medium tracking-[0.1px] whitespace-nowrap text-muted-foreground">
            {m.officer.headerLabel}
          </span>
        </div>
        <div className="flex items-center">
          <LanguageToggle />
          {showLogout ? (
            <button
              type="button"
              onClick={logout}
              aria-label={m.chrome.logout}
              className="inline-flex size-12 items-center justify-center rounded-full text-muted-foreground transition-colors duration-[160ms] ease-[var(--ease-raksa)] hover:bg-foreground/8"
            >
              <LogOut aria-hidden strokeWidth={1.75} className="size-5" />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
