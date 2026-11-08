"use client"

import { useCallback, useState } from "react"
import { Download } from "lucide-react"
import { AppHeader } from "@/components/raksa/app-header"
import { Stagger, StaggerItem } from "@/components/raksa/motion"
import { ReportCard } from "@/components/raksa/report-card"
import { Screen } from "@/components/raksa/screen"
import { Button } from "@/components/ui/button"
import { getCase } from "@/lib/demo-data"
import { useSaveReportCard } from "@/lib/export-card"
import { useI18n } from "@/lib/i18n/provider"
import type { Case } from "@/lib/types"

const CARD_W = 1080
const CARD_H = 1350

/** Kartu laporan (`hDj7e`): the 1080×1350 card scaled to the column width (centered, max 560px from md). */
export function KartuScreen({ code }: { code: string }) {
  const c = getCase(code) as Case
  const { m } = useI18n()
  const card = useSaveReportCard(c)
  const [scale, setScale] = useState(0)

  const measure = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / CARD_W)))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Screen layout="wide">
      <AppHeader className="md:px-8" />
      <Stagger className="mx-auto flex w-full flex-col gap-6 px-4 py-6 md:max-w-[624px] md:px-8 md:py-10">
        <h1 className="sr-only">{m.card.title}</h1>
        <StaggerItem ref={measure} className="w-full">
          <div
            className="mx-auto overflow-hidden rounded-lg outline-1 outline-border md:shadow-[0_24px_64px_-24px_var(--shadow-float)]"
            style={{ height: CARD_H * scale, width: CARD_W * scale }}
          >
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: CARD_W }}>
              <ReportCard caseData={c} />
            </div>
          </div>
        </StaggerItem>
        <StaggerItem className="w-full">
          <Button className="w-full" onClick={card.save} disabled={card.saving}>
            <Download strokeWidth={1.75} aria-hidden />
            {m.caseUi.reportCard.saveAsImage}
          </Button>
        </StaggerItem>
      </Stagger>
      {card.node}
    </Screen>
  )
}
