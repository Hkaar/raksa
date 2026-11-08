"use client"

import { ArrowRight, ChevronRight, Droplets } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { AppHeader } from "@/components/raksa/app-header"
import { FirstAidIllustration } from "@/components/raksa/first-aid-illustration"
import { HowItWorks } from "@/components/raksa/how-it-works"
import { Stagger, StaggerItem } from "@/components/raksa/motion"
import { Screen } from "@/components/raksa/screen"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useI18n } from "@/lib/i18n/provider"

/** Beranda (pen `h7Hb2z`). */
export function BerandaScreen() {
  const { m } = useI18n()
  const b = m.beranda
  const [privacyOpen, setPrivacyOpen] = useState(false)
  return (
    <Screen layout="wide" className="bg-background">
      <AppHeader logoHref={null} className="bg-transparent md:pr-6 md:pl-8" />
      {/*
        <md: the `h7Hb2z` column (art, copy, how-it-works, actions).
        md: the same column centered at 560px. lg: two-column hero — copy + actions left, art + how-it-works right.
      */}
      <Stagger
        gap={0.06}
        className="mx-auto flex w-full flex-1 flex-col md:max-w-[560px] md:pt-4 lg:grid lg:max-w-none lg:grid-cols-2 lg:grid-rows-[auto_auto] lg:content-center lg:gap-x-16 lg:gap-y-10 lg:px-8 lg:pt-10 lg:pb-16"
      >
        <StaggerItem className="mt-5 flex h-[196px] items-center justify-center md:h-[245px] lg:col-start-2 lg:row-start-1 lg:mt-0 lg:h-[343px] lg:self-end">
          <div className="flex size-[196px] items-center justify-center rounded-full bg-accent md:size-[245px] lg:size-[343px]">
            <FirstAidIllustration className="md:scale-125 lg:scale-[1.75]" />
          </div>
        </StaggerItem>
        <StaggerItem className="mt-5 flex flex-col items-center gap-2.5 px-6 pb-2 text-center lg:col-start-1 lg:row-start-1 lg:mt-0 lg:items-start lg:gap-4 lg:self-end lg:px-0 lg:pb-0 lg:text-left">
          <h1 className="w-full text-[34px]/[39px] font-bold whitespace-pre-line text-foreground md:text-[40px]/[46px] lg:text-[56px]/[62px]">
            {b.headline}
          </h1>
          <p className="text-base/6 text-muted-foreground lg:text-lg/7">{b.subline}</p>
          <p className="text-sm text-primary lg:text-base">{b.meta}</p>
        </StaggerItem>
        <StaggerItem className="flex flex-1 flex-col justify-center px-5 py-4 lg:col-start-2 lg:row-start-2 lg:self-start lg:py-0">
          <div className="mx-auto flex w-full flex-col items-center gap-3.5 lg:max-w-[400px]">
            <h2 className="text-sm font-medium text-muted-foreground">{b.howItWorks}</h2>
            <HowItWorks />
          </div>
        </StaggerItem>
        <StaggerItem className="flex flex-col items-center gap-3.5 px-5 pb-6 lg:col-start-1 lg:row-start-2 lg:max-w-[440px] lg:items-start lg:self-start lg:px-0 lg:pb-0">
          <Link
            href="/pertolongan-pertama"
            className="flex min-h-14 w-full items-center gap-3.5 rounded-full bg-card px-4 py-3.5 outline-1 -outline-offset-[0.5px] outline-border transition-colors duration-[160ms] ease-[var(--ease-raksa)] hover:bg-muted focus-visible:outline-3 focus-visible:outline-ring"
          >
            <Droplets aria-hidden strokeWidth={1.75} className="size-6 shrink-0 text-primary" />
            <span className="flex-1 text-base font-medium text-foreground">{b.firstAid}</span>
            <ChevronRight aria-hidden strokeWidth={1.75} className="size-[22px] shrink-0 text-foreground" />
          </Link>
          <Button asChild className="h-[58px] w-full gap-2.5 tracking-normal lg:order-first [&_svg]:size-5">
            <Link href="/lapor">
              {b.cta}
              <ArrowRight aria-hidden strokeWidth={1.75} />
            </Link>
          </Button>
          <div className="flex items-center gap-3 text-sm lg:-ml-0.5">
            <Link href="/petugas/masuk" className="inline-flex min-h-12 items-center rounded-xs font-medium text-primary">
              {b.officer}
            </Link>
            <span aria-hidden className="text-muted-foreground">·</span>
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="inline-flex min-h-12 items-center rounded-xs font-medium text-primary"
            >
              {b.privacy}
            </button>
          </div>
        </StaggerItem>
      </Stagger>
      <Sheet open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{b.privacy}</SheetTitle>
          </SheetHeader>
          <ul className="flex flex-col gap-2 text-base/6 tracking-[0.5px] text-foreground">
            {b.privacyLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </Screen>
  )
}
