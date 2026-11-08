import raw from "@/data/demo.json"
import { distanceKm } from "@/lib/geo"
import type {
  AnimalRisk,
  Case,
  DemoData,
  Kecamatan,
  LatLng,
  RabiesCenter,
  RabiesCenterNearby,
  Urgency,
  WoundCategory,
} from "@/lib/types"

/** Single demo data source until the backend exists. */
export const demo = raw as DemoData

/** Fixed demo clock; every relative time is computed from this, never from Date.now(). */
export const DEMO_NOW = new Date(demo.meta.now).getTime()

export function getCase(code: string): Case | undefined {
  return demo.cases.find((c) => c.code === code)
}

export function getCaseByOwnerToken(token: string): Case | undefined {
  return demo.cases.find((c) => c.ownerToken === token)
}

export function activeCases(): Case[] {
  return demo.cases.filter((c) => c.active)
}

const URGENCY_ORDER: Record<Urgency, number> = { HARI_INI: 0, DALAM_24_JAM: 1 }
const RISK_ORDER: Record<AnimalRisk, number> = { tinggi: 0, sedang: 1, rendah: 2 }
const CATEGORY_ORDER: Record<WoundCategory, number> = { III: 0, II: 1, I: 2 }

/** Officer queue order: urgency → animal risk → wound category → longest since bite first. */
export function sortQueue(cases: Case[]): Case[] {
  return [...cases].sort(
    (a, b) =>
      URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency] ||
      RISK_ORDER[a.animalRisk] - RISK_ORDER[b.animalRisk] ||
      CATEGORY_ORDER[a.woundCategory] - CATEGORY_ORDER[b.woundCategory] ||
      new Date(a.bittenAt).getTime() - new Date(b.bittenAt).getTime(),
  )
}

/**
 * Centers with their haversine distance from `origin`, nearest first; filtered by kecamatan,
 * falling back to all centers when the filter yields none.
 */
export function nearestRabiesCenters(origin: LatLng, kecamatan?: Kecamatan): RabiesCenterNearby[] {
  const sorted = demo.rabiesCenters
    .map((rc) => ({ ...rc, distanceKm: distanceKm(origin, rc) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
  const filtered = kecamatan ? sorted.filter((rc) => rc.kecamatan === kecamatan) : sorted
  return filtered.length > 0 ? filtered : sorted
}

export function mapsDirectionsUrl(rc: Pick<RabiesCenter, "lat" | "lng">): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${rc.lat},${rc.lng}`
}
