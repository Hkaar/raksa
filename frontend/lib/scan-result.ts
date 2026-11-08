import type { VisibleFeature, WoundScanResponse, WoundScanSuggestion } from "@/lib/api"
import type { Localized, ScanOutcome, ScanRow } from "@/lib/types"

const BLOOD: Record<WoundScanSuggestion["blood_visibility"], Localized> = {
  visible: { id: "Darah tampak", en: "Blood visible" },
  not_visible: { id: "Darah tidak tampak di video", en: "No blood visible in the video" },
  unclear: { id: "Tidak jelas", en: "Unclear" },
}

const FEATURE: Record<VisibleFeature, Localized> = {
  puncture_like_marks: { id: "Tampak seperti bekas tusukan", en: "Puncture-like marks" },
  abrasion_like_area: { id: "Tampak seperti lecet", en: "Abrasion-like area" },
  irregular_open_edges: { id: "Tepi luka terbuka tidak rata", en: "Irregular open edges" },
  crust_like_area: { id: "Tampak seperti keropeng", en: "Crust-like area" },
  redness: { id: "Kemerahan", en: "Redness" },
}

/**
 * Wound-scan response → draft patch. Never touches `draft.bleeding`: blood not visible on video
 * must not lower urgency.
 */
export function scanDraftPatch(r: WoundScanResponse): { scan: ScanOutcome; scanRows: ScanRow[] } {
  const s = r.suggestion
  if (r.mode !== "ai" || !s) {
    return { scan: { mode: "manual", reason: r.reason ?? "ai_unavailable" }, scanRows: [] }
  }
  const rows: ScanRow[] = []
  if (s.body_part) rows.push({ field: "bodyPart", value: { id: s.body_part, en: s.body_part }, flag: "perkiraan" })
  rows.push({
    field: "bleeding",
    value: BLOOD[s.blood_visibility],
    flag: s.blood_visibility === "visible" ? "perlu_perhatian" : "perkiraan",
  })
  const n = s.wound_count
  if (n !== null) {
    rows.push({ field: "woundCount", value: { id: `${n} luka`, en: n === 1 ? "1 wound" : `${n} wounds` }, flag: "tercatat" })
  }
  if (s.visible_features.length > 0) {
    const labels = s.visible_features.map((f) => FEATURE[f])
    rows.push({
      field: "features",
      value: { id: labels.map((l) => l.id).join(", "), en: labels.map((l) => l.en).join(", ") },
      flag: "perkiraan",
    })
  }
  return { scan: { mode: "ai", reason: null }, scanRows: rows }
}
