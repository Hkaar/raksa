"use client"

import { House, MessageCircleQuestionMark } from "lucide-react"
import Link from "next/link"

import { AppHeader } from "@/components/raksa/app-header"
import { BottomBar } from "@/components/raksa/bottom-bar"
import { Stagger, StaggerItem } from "@/components/raksa/motion"
import { Screen } from "@/components/raksa/screen"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/provider"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const

/** State — Bukan kasus gigitan (`tAXvr`). */
export function NotBiteScreen() {
  const { m } = useI18n()
  const c = m.lapor.notBite
  return (
    <Screen>
      <AppHeader />
      <Stagger gap={0.06} className="flex flex-1 flex-col items-center justify-center gap-6 px-10 pt-8 pb-16">
        <StaggerItem className="flex size-14 items-center justify-center rounded-full bg-muted">
          <MessageCircleQuestionMark {...ICON} className="size-[26px] text-muted-foreground" />
        </StaggerItem>
        <StaggerItem className="flex w-full flex-col items-center gap-2">
          <h1 className="text-center text-[22px]/7 font-bold text-foreground">{c.title}</h1>
          <p className="text-center text-sm/[22px] text-muted-foreground">{c.help}</p>
        </StaggerItem>
        <StaggerItem>
          <Button asChild variant="link" size="sm">
            <Link href="/beranda">
              <House {...ICON} />
              {c.home}
            </Link>
          </Button>
        </StaggerItem>
      </Stagger>
      <BottomBar>
        <Button asChild>
          <Link href="/lapor">{c.retry}</Link>
        </Button>
      </BottomBar>
    </Screen>
  )
}
