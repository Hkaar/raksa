import type { StorySuggestion } from "@/lib/api"
import type { BodyPart, Contact, ReportDraftFields, Species } from "@/lib/types"

const CONTACT: Partial<Record<NonNullable<StorySuggestion["event_type"]>, Contact>> = {
  bite: "gigitan",
  scratch: "cakaran",
  lick: "jilatan",
}

const SPECIES: [string[], Species][] = [
  [["anjing", "dog", "pupp"], "anjing"],
  [["kucing", "cat", "kitten"], "kucing"],
  [["kera", "monyet", "monkey", "macaque"], "kera"],
]

/** Checked in order: "jari tangan" must win over "tangan". */
const BODY_PART: [string[], BodyPart][] = [
  [["jari", "finger"], "jari_tangan"],
  [["kepala", "leher", "wajah", "muka", "pipi", "head", "neck", "face", "cheek"], "kepala_leher"],
  [["tangan", "lengan", "hand", "arm", "wrist"], "tangan"],
  [["kaki", "betis", "paha", "lutut", "leg", "foot", "calf", "thigh", "knee", "ankle"], "kaki"],
  [["badan", "perut", "dada", "punggung", "pinggang", "body", "chest", "back", "stomach", "belly"], "badan"],
]

function match<T>(text: string, table: [string[], T][]): T | undefined {
  const lower = text.toLowerCase()
  return table.find(([words]) => words.some((w) => lower.includes(w)))?.[1]
}

export function isContactEvent(s: StorySuggestion | null): boolean {
  return !!s?.event_type && s.event_type in CONTACT
}

/** Maps only confidently recognised fields; time and place stay for the follow-up questions. */
export function draftPatchFromStory(s: StorySuggestion): Partial<ReportDraftFields> {
  const patch: Partial<ReportDraftFields> = {}
  const contact = s.event_type ? CONTACT[s.event_type] : undefined
  if (contact) patch.contact = contact
  if (s.bleeding_reported !== null) patch.bleeding = s.bleeding_reported ? "ya" : "tidak"
  if (s.animal_species) patch.species = match(s.animal_species, SPECIES) ?? "lainnya"
  const bodyPart = s.body_part ? match(s.body_part, BODY_PART) : undefined
  if (bodyPart) patch.bodyPart = bodyPart
  return patch
}
