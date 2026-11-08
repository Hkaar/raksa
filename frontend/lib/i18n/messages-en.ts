import { commonEn } from "./messages/common"
import { enumsEn } from "./messages/enums"
import { uiEn } from "./messages/ui"
import { chromeEn } from "./messages/chrome"
import { caseUiEn } from "./messages/caseUi"
import { berandaEn } from "./messages/beranda"
import { firstAidEn } from "./messages/firstAid"
import { rabiesCenterEn } from "./messages/rabiesCenter"
import { laporEn } from "./messages/lapor"
import { questionsEn } from "./messages/questions"
import { konfirmasiEn } from "./messages/konfirmasi"
import { scanEn } from "./messages/scan"
import { vaccineCardEn } from "./messages/vaccineCard"
import { hasilEn } from "./messages/hasil"
import { whyEn } from "./messages/why"
import { statusEn } from "./messages/status"
import { cardEn } from "./messages/card"
import { officerEn } from "./messages/officer"
import { ownerEn } from "./messages/owner"
import type { id } from "./messages-id"

export const en: typeof id = {
  common: commonEn,
  enums: enumsEn,
  ui: uiEn,
  chrome: chromeEn,
  caseUi: caseUiEn,
  beranda: berandaEn,
  firstAid: firstAidEn,
  rabiesCenter: rabiesCenterEn,
  lapor: laporEn,
  questions: questionsEn,
  konfirmasi: konfirmasiEn,
  scan: scanEn,
  vaccineCard: vaccineCardEn,
  hasil: hasilEn,
  why: whyEn,
  status: statusEn,
  card: cardEn,
  officer: officerEn,
  owner: ownerEn,
}
