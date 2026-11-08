import { ApiError, createCase, type CaseCreate } from "@/lib/api"
import type { DraftField, Ownership, VaccineStatus } from "@/lib/types"

import type { ReportDraft } from "./report-draft"

export type SubmitOutcome = "saved" | "not_saved" | "failed"

const FIELDS: DraftField[] = [
  "bittenAt",
  "kecamatan",
  "desa",
  "contact",
  "bodyPart",
  "bleeding",
  "woundCount",
  "species",
  "ownership",
  "behavior",
  "condition",
  "animalNow",
  "vaccineStatus",
  "ageGroup",
  "accompanied",
]

const OWNERSHIP: Record<Ownership, CaseCreate["animal"]["ownership"]> = {
  berpemilik: "owned",
  tanpa_pemilik: "stray",
  tidak_tahu: "unknown",
}

const VACCINATION: Record<VaccineStatus, CaseCreate["animal"]["vaccination_status"]> = {
  divaksin: "reported_vaccinated",
  belum: "reported_unvaccinated",
  tidak_jelas: "unknown",
}

export function draftToCaseCreate(d: ReportDraft): CaseCreate {
  // The short-form path never sets `story`; describe the answers instead.
  const story =
    d.story.trim() ||
    `Laporan formulir singkat. ${FIELDS.filter((k) => d[k])
      .map((k) => `${k}: ${d[k]}`)
      .join("; ")}`
  return {
    story,
    occurred_at: d.bittenAt || null,
    location: null,
    animal: {
      species: d.species,
      ownership: OWNERSHIP[d.ownership],
      vaccination_status: VACCINATION[d.vaccineStatus],
    },
    bleeding_reported: d.bleeding === "ya" ? true : d.bleeding === "tidak" ? false : null,
  }
}

/** `not_saved` = backend reachable but case persistence is not configured (503). */
export async function submitReport(d: ReportDraft): Promise<SubmitOutcome> {
  try {
    await createCase(draftToCaseCreate(d))
    return "saved"
  } catch (e) {
    return e instanceof ApiError && e.status === 503 && e.code === "persistence_not_configured" ? "not_saved" : "failed"
  }
}
