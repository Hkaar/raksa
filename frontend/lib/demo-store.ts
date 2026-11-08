"use client"

import { useSyncExternalStore } from "react"
import { demo } from "@/lib/demo-data"
import type { AnimalStatus, ObservationDays, ObservationReport } from "@/lib/types"

/** Browser-only overrides on top of data/demo.json (stand-in for backend writes). */
export type DemoState = {
  observations: Record<string, { durationDays: ObservationDays; startedAt: string }>
  reports: Record<string, ObservationReport[]>
}

const STORAGE_KEY = "raksa-demo-v1"
const EMPTY: DemoState = { observations: {}, reports: {} }
const listeners = new Set<() => void>()

let cachedRaw: string | null = null
let cachedState: DemoState = EMPTY

function read(): DemoState {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      cachedState = raw ? { ...EMPTY, ...(JSON.parse(raw) as DemoState) } : EMPTY
    } catch {
      cachedState = EMPTY
    }
  }
  return cachedState
}

function write(next: DemoState | null) {
  if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  else window.localStorage.removeItem(STORAGE_KEY)
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

export function useDemoStore(): DemoState {
  return useSyncExternalStore(subscribe, read, () => EMPTY)
}

/** Officer starts the animal observation; timestamps use the frozen demo clock (`demo.meta.now`). */
export function startObservation(code: string, durationDays: ObservationDays) {
  const state = read()
  write({ ...state, observations: { ...state.observations, [code]: { durationDays, startedAt: demo.meta.now } } })
}

/** Owner reports the animal's condition (from `/h/[token]`); appended after the JSON case's reports. */
export function addOwnerReport(code: string, status: AnimalStatus) {
  const state = read()
  const reports = [...(state.reports[code] ?? []), { at: demo.meta.now, status }]
  write({ ...state, reports: { ...state.reports, [code]: reports } })
}

/** Drops all browser overrides, restoring `data/demo.json` (the "Muat data contoh" button on `/demo`). */
export function resetDemo() {
  write(null)
}
