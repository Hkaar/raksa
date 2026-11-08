export type Urgency = "HARI_INI" | "DALAM_24_JAM"
export type WoundCategory = "I" | "II" | "III"
export type AnimalRisk = "rendah" | "sedang" | "tinggi"
export type Contact = "gigitan" | "cakaran" | "jilatan"
export type Bleeding = "ya" | "tidak" | "tidak_tahu"
export type BodyPart = "kepala_leher" | "jari_tangan" | "tangan" | "badan" | "kaki"
export type WoundCount = "1" | "2" | "3_plus"
export type Species = "anjing" | "kucing" | "kera" | "lainnya"
export type Ownership = "berpemilik" | "tanpa_pemilik" | "tidak_tahu"
export type Behavior = "menyerang_tanpa_diganggu" | "diganggu_dulu" | "tidak_tahu"
export type Condition = "tampak_sehat" | "tampak_sakit" | "tidak_tahu"
export type AnimalNow = "diamankan_petugas" | "lari" | "di_rumah_pemilik" | "mati" | "tidak_tahu"
export type VaccineStatus = "divaksin" | "belum" | "tidak_jelas"
export type AgeGroup = "balita" | "anak" | "dewasa" | "lansia"
export type Accompanied = "sendirian" | "didampingi"
export type Kecamatan = "denpasar_barat" | "denpasar_selatan" | "denpasar_timur" | "denpasar_utara"
export type ScanFlag = "area_berisiko" | "perlu_perhatian" | "tercatat" | "perkiraan"
export type AiStatus = "dibaca_ai" | "dikonfirmasi" | "tidak_jelas"
export type AnimalStatus = "sehat" | "sakit" | "mati" | "hilang"
export type ObservationDays = 10 | 14

export type ReasonCode =
  | "luka_berdarah"
  | "gigitan_kepala_leher"
  | "gigitan_jari_tangan"
  | "gigitan_tangan"
  | "gigitan_badan"
  | "gigitan_kaki"
  | "hewan_tanpa_pemilik"
  | "hewan_berpemilik"
  | "hewan_tampak_sakit"
  | "hewan_belum_vaksin"

export type RuleCode =
  | "luka_berdarah_gigitan"
  | "hewan_tanpa_pemilik"
  | "hewan_sakit_menyerang"
  | "kategori_III_risiko_tinggi"
  | "kategori_III"
  | "cakaran_tanpa_darah"
  | "hewan_berpemilik_divaksin"
  | "hewan_berpemilik_belum_vaksin"
  | "kategori_II_risiko_rendah"
  | "kategori_II_risiko_sedang"
  | "jilatan_kulit_utuh"
  | "kategori_I"

export type OutcomeCode =
  | "kategori_I"
  | "kategori_II"
  | "kategori_III"
  | "risiko_naik"
  | "risiko_rendah"
  | "risiko_sedang"
  | "risiko_tinggi"
  | Urgency

export type Localized = { id: string; en: string }

export type ObservationReport = { at: string; status: AnimalStatus }

export type Observation = {
  durationDays: ObservationDays
  startedAt: string
  reports: ObservationReport[]
}

export type Case = {
  code: string
  active: boolean
  isDemo: boolean
  urgency: Urgency
  woundCategory: WoundCategory
  animalRisk: AnimalRisk
  desa: string
  kecamatan: Kecamatan
  bittenAt: string
  reportedAt: string
  wound: { contact: Contact; bleeding: Bleeding; bodyPart: BodyPart; count: WoundCount }
  animal: {
    species: Species
    ownership: Ownership
    behavior: Behavior
    condition: Condition
    animalNow: AnimalNow
    vaccineStatus: VaccineStatus
    vaccinatedAt: string | null
  }
  victim: { ageGroup: AgeGroup; accompanied: Accompanied }
  explanation: {
    reasons: ReasonCode[]
    rules: { condition: RuleCode; outcome: OutcomeCode }[]
  }
  observationRequired: boolean
  observation: Observation | null
  ownerToken: string
  relatedCases: string[]
}

/** WGS84 coordinate. */
export type LatLng = { lat: number; lng: number }

export type RabiesCenter = LatLng & {
  id: string
  name: string
  address: string
  hours: string
  phone: string
  kecamatan: Kecamatan
}

/** A Rabies Center with its haversine distance from the user's origin. */
export type RabiesCenterNearby = RabiesCenter & { distanceKm: number }

export type DraftField =
  | "bittenAt"
  | "kecamatan"
  | "desa"
  | "contact"
  | "bodyPart"
  | "bleeding"
  | "woundCount"
  | "species"
  | "ownership"
  | "behavior"
  | "condition"
  | "animalNow"
  | "vaccineStatus"
  | "ageGroup"
  | "accompanied"

export type ReportDraftFields = {
  bittenAt: string
  kecamatan: Kecamatan | ""
  desa: string
  contact: Contact
  bodyPart: BodyPart
  bleeding: Bleeding
  woundCount: WoundCount
  species: Species
  ownership: Ownership
  behavior: Behavior
  condition: Condition
  animalNow: AnimalNow
  vaccineStatus: VaccineStatus
  ageGroup: AgeGroup
  accompanied: Accompanied
}

/** Questions asked one by one (follow-up after voice) or two per page (short form). */
export type QuestionField = Exclude<DraftField, "bittenAt" | "kecamatan" | "desa">

export type ScanRow = {
  field: "bodyPart" | "contact" | "bleeding" | "woundCount" | "woundSize"
  value: Localized
  flag: ScanFlag
}

export type VaccineRow = {
  field: "vaccineDate" | "vaccineType" | "vaccineOfficer"
  value: Localized | null
  status: AiStatus
}

export type DemoData = {
  meta: { now: string; siteUrl: string }
  kecamatan: Kecamatan[]
  rabiesCenters: RabiesCenter[]
  /** Demo "Lokasi Anda" (Dauh Puri, Denpasar Barat); used when no nearby real position is known. */
  userLocation: LatLng
  cases: Case[]
  reportDemo: {
    resultCaseCode: string
    initialDraft: ReportDraftFields
    followUpQuestions: QuestionField[]
    formQuestions: QuestionField[]
    scanResult: { title: Localized; rows: ScanRow[] }
    vaccineCard: { title: Localized; photographedAt: string; rows: VaccineRow[] }
  }
}
