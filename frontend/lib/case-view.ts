import { observationDay } from "@/lib/format"
import type { DemoState } from "@/lib/demo-store"
import type { AnimalStatus, Case, Observation, ObservationDays, Urgency } from "@/lib/types"

export type TimelineEntry =
  | { kind: "bitten"; at: string; desa: string }
  | { kind: "reported"; at: string; urgency: Urgency }
  | { kind: "observationStarted"; at: string; durationDays: ObservationDays }
  | { kind: "lastReport"; at: string; status: AnimalStatus; day: number }

export type CaseView = {
  observation: Observation | null
  /** Current observation day on the demo clock; 0 when not started. */
  observationDay: number
  /** Status from the latest owner report, or null when none. */
  animalStatus: AnimalStatus | null
  escalated: boolean
  lastReport: Observation["reports"][number] | null
  timeline: TimelineEntry[]
}

/** Merges browser-store overrides into a JSON case and derives display state. */
export function caseView(c: Case, store: DemoState): CaseView {
  const stored = store.observations[c.code]
  const base = stored ? { ...stored, reports: c.observation?.reports ?? [] } : c.observation
  const observation: Observation | null = base
    ? { ...base, reports: [...base.reports, ...(store.reports[c.code] ?? [])] }
    : null

  const lastReport = observation?.reports.at(-1) ?? null
  const animalStatus = lastReport?.status ?? null

  const timeline: TimelineEntry[] = [
    { kind: "bitten", at: c.bittenAt, desa: c.desa },
    { kind: "reported", at: c.reportedAt, urgency: c.urgency },
  ]
  if (observation) {
    timeline.push({ kind: "observationStarted", at: observation.startedAt, durationDays: observation.durationDays })
    if (lastReport) {
      timeline.push({
        kind: "lastReport",
        at: lastReport.at,
        status: lastReport.status,
        day: observationDay(observation.startedAt, observation.durationDays, lastReport.at),
      })
    }
  }

  return {
    observation,
    observationDay: observation ? observationDay(observation.startedAt, observation.durationDays) : 0,
    animalStatus,
    escalated: animalStatus !== null && animalStatus !== "sehat",
    lastReport,
    timeline,
  }
}
