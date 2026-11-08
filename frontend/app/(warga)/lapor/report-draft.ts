"use client"

import { useSyncExternalStore } from "react"
import { demo } from "@/lib/demo-data"
import type { ReportDraftFields, ScanRow, VaccineRow } from "@/lib/types"

export type ReportDraft = ReportDraftFields & {
  story: string
  scanRows: ScanRow[]
  vaccineRows: VaccineRow[]
  vaccineSource: "ai" | "manual" | null
}

export type DraftMedia = { videoUrl?: string; photoUrl?: string }

const STORAGE_KEY = "raksa-report-draft"
const INITIAL: ReportDraft = {
  ...demo.reportDemo.initialDraft,
  story: "",
  scanRows: demo.reportDemo.scanResult.rows,
  vaccineRows: demo.reportDemo.vaccineCard.rows,
  vaccineSource: null,
}

const listeners = new Set<() => void>()
let cachedRaw: string | null = null
let cachedDraft: ReportDraft = INITIAL
/** Object URLs live in memory only; they die with the tab. */
let media: DraftMedia = {}

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function readDraft(): ReportDraft {
  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      cachedDraft = raw ? { ...INITIAL, ...(JSON.parse(raw) as Partial<ReportDraft>) } : INITIAL
    } catch {
      cachedDraft = INITIAL
    }
  }
  return cachedDraft
}

export function updateDraft(patch: Partial<ReportDraft>) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readDraft(), ...patch }))
  emit()
}

/** Stores a recorded video / captured photo, revoking the URL it replaces. */
export function setDraftMedia(kind: keyof DraftMedia, blob: Blob | null) {
  const previous = media[kind]
  if (previous) URL.revokeObjectURL(previous)
  media = { ...media, [kind]: blob ? URL.createObjectURL(blob) : undefined }
  emit()
}

export function useReportDraft(): ReportDraft {
  return useSyncExternalStore(subscribe, readDraft, () => INITIAL)
}

export function useDraftMedia(): DraftMedia {
  return useSyncExternalStore(
    subscribe,
    () => media,
    () => media,
  )
}
