import { demo } from "@/lib/demo-data"
import { format, type Messages } from "@/lib/i18n/provider"
import type { Case } from "@/lib/types"

/** Whole calendar months from `iso` to the demo clock. */
function monthsSince(iso: string) {
  const from = new Date(iso)
  const to = new Date(demo.meta.now)
  const months = (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth()
  return Math.max(0, to.getDate() < from.getDate() ? months - 1 : months)
}

/** Localized one-line descriptions of a case, shared by the report card and summaries. */
export function caseText(c: Case, m: Messages) {
  const card = m.caseUi.reportCard
  const summary = m.caseUi.summary
  const species = m.enums.species[c.animal.species].toLowerCase()
  const contact = m.enums.contact[c.wound.contact]
  const bodyPart = m.enums.bodyPart[c.wound.bodyPart].toLowerCase()

  const animalSummary = format(summary.animalOwnership[c.animal.ownership], { species })
  const animalState = c.animal.vaccinatedAt
    ? format(summary.vaccinatedAgo, { n: monthsSince(c.animal.vaccinatedAt) })
    : card.condition[c.animal.condition]
  const woundSummary =
    c.wound.contact === "gigitan"
      ? format(summary.contactBodyPart, { contact: contact.toLowerCase(), bodyPart })
      : contact.toLowerCase()

  const animalOwned = format(card.animalOwnership[c.animal.ownership], { species })

  return {
    /** "Kategori III · Risiko hewan Tinggi" */
    category: format(card.categoryValue, {
      category: m.enums.woundCategory[c.woundCategory],
      risk: m.enums.animalRisk[c.animalRisk],
    }),
    /** "Gigitan di jari tangan, berdarah" */
    wound: format(card.woundValue, { contact, bodyPart, bleeding: card.bleeding[c.wound.bleeding] }),
    /** "Anjing tanpa pemilik, tampak sakit" */
    animal: format(card.animalValue, {
      animal: animalOwned.charAt(0).toUpperCase() + animalOwned.slice(1),
      condition: card.condition[c.animal.condition],
    }),
    /** "Tidak jelas, dianggap paling berat" */
    vaccine: card.vaccineValue[c.animal.vaccineStatus],
    /** "Dauh Puri, Denpasar Barat" */
    desa: format(card.desaValue, { desa: c.desa, kecamatan: m.enums.kecamatan[c.kecamatan] }),
    /** "Kategori III · gigitan jari tangan · anjing liar, tampak sakit" */
    summary: [m.enums.woundCategory[c.woundCategory], woundSummary, `${animalSummary}, ${animalState}`].join(" · "),
  }
}
