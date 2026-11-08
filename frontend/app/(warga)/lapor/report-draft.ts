"use client"

import { useSyncExternalStore } from "react"
import { demo } from "@/lib/demo-data"
import type { ReportDraftFields, ScanOutcome, ScanRow, VaccineRow } from "@/lib/types"

/**
 * Citizen report in progress, shared by every `/lapor/*` screen. Fields persist in sessionStorage (survive
 * reloads, not tab close); recorded media stay in memory only. Unanswered fields start from the demo draft.
 */
export type ReportDraft = ReportDraftFields & {
  story: string
  scanRows: ScanRow[]
  /** Outcome of the real wound scan; null = no upload (demo rows). */
  scan: ScanOutcome | null
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
  scan: null,
  vaccineSource: null,
}

const listeners = new Set<() => void>()
let cachedRaw: string | null = null
let cachedDraft: ReportDraft = INITIAL
/** Object URLs live in memory only; they die with the tab. */
let media: DraftMedia = {}
/** Raw blobs behind `media`, for uploading. */
let blobs: Partial<Record<keyof DraftMedia, Blob>> = {}

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Current draft. Returns the same object until storage changes, as `useSyncExternalStore` requires. */
export function getDraft(): ReportDraft {
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

/** Shallow-merges `patch` into the draft and notifies subscribers. */
export function updateDraft(patch: Partial<ReportDraft>) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...getDraft(), ...patch }))
  emit()
}

/** Stores a recorded video / captured photo, revoking the URL it replaces. */
export function setDraftMedia(kind: keyof DraftMedia, blob: Blob | null) {
  const previous = media[kind]
  if (previous) URL.revokeObjectURL(previous)
  media = { ...media, [kind]: blob ? URL.createObjectURL(blob) : undefined }
  blobs = { ...blobs, [kind]: blob ?? undefined }
  emit()
}

/** Raw blob for uploads (e.g. wound video to `/scans/wound`); undefined after a reload. */
export function getDraftBlob(kind: keyof DraftMedia): Blob | undefined {
  return blobs[kind]
}

export function useReportDraft(): ReportDraft {
  return useSyncExternalStore(subscribe, getDraft, () => INITIAL)
}

export function useDraftMedia(): DraftMedia {
  return useSyncExternalStore(
    subscribe,
    () => media,
    () => media,
  )
}
