"use client"

import { useSyncExternalStore } from "react"

import { demo } from "@/lib/demo-data"
import { distanceKm } from "@/lib/geo"
import type { LatLng } from "@/lib/types"

/** Granted geolocation for this browser session (sessionStorage; cleared with the tab). */
const KEY = "raksa-user-location"

/**
 * Demo fallback: the demo Rabies Centers only exist around Denpasar, so a real position farther
 * than this from `demo.userLocation` (e.g. a judge testing from elsewhere) is ignored and the
 * demo location (Dauh Puri, Denpasar Barat) is used as the origin instead.
 */
const DEMO_RADIUS_KM = 25

const listeners = new Set<() => void>()
let snapshot: { raw: string | null; origin: LatLng } | undefined

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getOrigin(): LatLng {
  const raw = sessionStorage.getItem(KEY)
  if (snapshot?.raw === raw) return snapshot.origin
  let origin = demo.userLocation
  if (raw) {
    const position = JSON.parse(raw) as LatLng
    if (distanceKm(position, demo.userLocation) <= DEMO_RADIUS_KM) origin = position
  }
  snapshot = { raw, origin }
  return origin
}

/**
 * Asks for the device position (8 s timeout) and remembers it for the session.
 * Resolves `false` when geolocation is unsupported, denied, or times out.
 */
export function requestUserPosition(): Promise<boolean> {
  if (!("geolocation" in navigator)) return Promise.resolve(false)
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        sessionStorage.setItem(KEY, JSON.stringify({ lat: coords.latitude, lng: coords.longitude }))
        listeners.forEach((listener) => listener())
        resolve(true)
      },
      () => resolve(false),
      { timeout: 8000 },
    )
  })
}

/** Origin for distances and the map: the granted position when near Denpasar, else the demo location. */
export function useUserOrigin(): LatLng {
  return useSyncExternalStore(subscribe, getOrigin, () => demo.userLocation)
}
