"use client"

import { ClockAlert, Eye, FlaskConical, OctagonAlert, Save, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n/provider"
import type { AnimalRisk, AnimalStatus, Urgency, WoundCategory } from "@/lib/types"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const

/** Badge/HARI_INI or Badge/DALAM_24_JAM. */
export function UrgencyBadge({ urgency, className }: { urgency: Urgency; className?: string }) {
  const { m } = useI18n()
  return urgency === "HARI_INI" ? (
    <Badge variant="urgent" className={className}>
      <OctagonAlert {...ICON} />
      {m.enums.urgency.HARI_INI}
    </Badge>
  ) : (
    <Badge variant="soon" className={className}>
      <ClockAlert {...ICON} />
      {m.enums.urgency.DALAM_24_JAM}
    </Badge>
  )
}

/** Badge/WHO — "Kategori III". */
export function CategoryBadge({ category, className }: { category: WoundCategory; className?: string }) {
  const { m } = useI18n()
  return (
    <Badge variant="who" className={className}>
      {m.enums.woundCategory[category]}
    </Badge>
  )
}

/** Badge/WHO — "Risiko hewan: Tinggi". */
export function RiskBadge({ risk, className }: { risk: AnimalRisk; className?: string }) {
  const { m, t } = useI18n()
  return (
    <Badge variant="who" className={className}>
      {t(m.common.riskBadge, { risk: m.enums.animalRisk[risk] })}
    </Badge>
  )
}

/** Badge/Demo — "data contoh". */
export function DemoBadge({ className }: { className?: string }) {
  const { m } = useI18n()
  return (
    <Badge variant="demo" className={className}>
      <FlaskConical {...ICON} />
      {m.common.demoData}
    </Badge>
  )
}

/** Badge/Eskalasi — "Hewan sakit" / "Hewan mati" / "Hewan hilang". */
export function EscalationBadge({
  status,
  className,
}: {
  status: Exclude<AnimalStatus, "sehat">
  className?: string
}) {
  const { m } = useI18n()
  return (
    <Badge variant="escalation" className={className}>
      <TriangleAlert {...ICON} />
      {m.common.escalation[status]}
    </Badge>
  )
}

/** Badge/OK — "Tersimpan". */
export function SavedBadge({ className }: { className?: string }) {
  const { m } = useI18n()
  return (
    <Badge variant="ok" className={className}>
      <Save {...ICON} />
      {m.common.saved}
    </Badge>
  )
}

/** Badge/Info — defaults to "Berjalan". */
export function InfoBadge({ children, className }: { children?: React.ReactNode; className?: string }) {
  const { m } = useI18n()
  return (
    <Badge variant="info" className={className}>
      <Eye {...ICON} />
      {children ?? m.common.observationRunning}
    </Badge>
  )
}
