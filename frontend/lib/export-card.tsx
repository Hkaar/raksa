"use client"

import { useRef, useState, type ReactNode } from "react"
import { getFontEmbedCSS, toPng } from "html-to-image"
import { toast } from "sonner"
import { ReportCard } from "@/components/raksa/report-card"
import { useI18n } from "@/lib/i18n/provider"
import type { Case } from "@/lib/types"

/**
 * Exports the 1080×1350 report card as a PNG download.
 * The caller must render `node` (an off-screen ReportCard) somewhere in its tree.
 */
export function useSaveReportCard(c: Case): { save: () => Promise<void>; saving: boolean; node: ReactNode } {
  const { m } = useI18n()
  const cardRef = useRef<HTMLDivElement>(null)
  const fontCssRef = useRef<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    const el = cardRef.current
    if (!el || saving) return
    setSaving(true)
    try {
      fontCssRef.current ??= await getFontEmbedCSS(el)
      const dataUrl = await toPng(el, {
        width: 1080,
        height: 1350,
        pixelRatio: 1,
        cacheBust: true,
        fontEmbedCSS: fontCssRef.current,
      })
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = `raksa-kasus-${c.code}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success(m.caseUi.reportCard.saved)
    } catch {
      toast.error(m.common.saveImageFailed)
    } finally {
      setSaving(false)
    }
  }

  const node = (
    <div className="pointer-events-none fixed top-0 -left-[20000px]" aria-hidden>
      <ReportCard ref={cardRef} caseData={c} />
    </div>
  )

  return { save, saving, node }
}
