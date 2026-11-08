"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { Logo } from "@/components/raksa/logo"
import { Screen } from "@/components/raksa/screen"
import { useI18n } from "@/lib/i18n/provider"

/** Splash (pen `GHNJE`). */
export function SplashScreen() {
  const router = useRouter()
  const { m } = useI18n()
  useEffect(() => {
    const id = window.setTimeout(() => router.replace("/beranda"), 1500)
    return () => window.clearTimeout(id)
  }, [router])
  return (
    <Screen layout="immersive" className="relative overflow-hidden bg-card">
      <div className="flex flex-1 items-center justify-center pb-[34px] md:pb-[max(204px,20vw)]">
        <Logo tagline={m.common.tagline} />
      </div>
      {/*
        Mobile: the design's 390px hill shapes. md+: the same three hills (light right, primary left,
        dark front) re-proportioned in vw so they keep their rounded tops across the full width.
      */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[204px] overflow-hidden md:h-[max(204px,22vw)]">
        <div className="absolute top-0 left-[calc(50%-25px)] size-[420px] rounded-full bg-primary-fixed-dim md:left-[50vw] md:h-[44vw] md:w-[58vw] md:rounded-[50%]" />
        <div className="absolute top-5 left-[calc(50%-345px)] h-[400px] w-[460px] rounded-full bg-primary md:top-[2.5vw] md:left-[-12vw] md:h-[46vw] md:w-[66vw] md:rounded-[50%]" />
        <div className="absolute top-[100px] left-[calc(50%-235px)] h-[360px] w-[520px] rounded-full bg-accent-foreground md:top-[12vw] md:left-[14vw] md:h-[50vw] md:w-[104vw] md:rounded-[50%]" />
      </div>
    </Screen>
  )
}
