"use client"

import "leaflet/dist/leaflet.css"
import "./rabies-center-map.css"

import { divIcon, latLngBounds, type DivIcon, type FitBoundsOptions, type Marker as LeafletMarker } from "leaflet"
import { Navigation } from "lucide-react"
import { useReducedMotion } from "motion/react"
import { useEffect, useRef } from "react"
import { AttributionControl, MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet"

import { Button } from "@/components/ui/button"
import { mapsDirectionsUrl } from "@/lib/demo-data"
import { formatKm } from "@/lib/geo"
import { useI18n } from "@/lib/i18n/provider"
import type { LatLng, RabiesCenterNearby } from "@/lib/types"

/** Keeps pins clear of the edges and of the "Lokasi Anda" chip (bottom-left). */
const FIT: FitBoundsOptions = { paddingTopLeft: [28, 24], paddingBottomRight: [28, 40], maxZoom: 16 }
const FOCUS_ZOOM = 15

/** lucide `hospital`, 14px — Leaflet div icons take an HTML string. */
const HOSPITAL_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7v4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M14 9h-4"/><path d="M18 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 21V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16"/></svg>'
const pinIcons = new Map<number, DivIcon>()

/**
 * Numbered pin (pen `egnfG`): primary pill with white outline, hospital icon + number; drops in once.
 * Cached so re-renders keep the same icon (a new icon would rebuild the DOM and replay the drop-in).
 */
function pinIcon(n: number): DivIcon {
  let icon = pinIcons.get(n)
  if (!icon) {
    icon = divIcon({
      className: "raksa-pin-anchor",
      iconSize: [0, 0],
      popupAnchor: [0, -14],
      html: `<span class="raksa-pin" style="animation-delay:${80 + n * 70}ms">${HOSPITAL_SVG}${n}</span>`,
    })
    pinIcons.set(n, icon)
  }
  return icon
}

const USER_ICON = divIcon({
  className: "raksa-pin-anchor",
  iconSize: [0, 0],
  html: '<span class="raksa-user"><span class="raksa-user-halo"></span><span class="raksa-user-dot"></span></span>',
})

function FitToPoints({ points }: { points: string }) {
  const map = useMap()
  const reduceMotion = useReducedMotion()
  useEffect(() => {
    map.fitBounds(latLngBounds(JSON.parse(points) as [number, number][]), { ...FIT, animate: !reduceMotion })
  }, [map, points, reduceMotion])
  return null
}

/** Flies to the selected center (jumps when reduced motion is on) and opens its popup. */
function FocusCenter({
  target,
  markers,
}: {
  target: RabiesCenterNearby | undefined
  markers: React.RefObject<Map<string, LeafletMarker>>
}) {
  const map = useMap()
  const reduceMotion = useReducedMotion()
  const id = target?.id
  const lat = target?.lat
  const lng = target?.lng
  useEffect(() => {
    if (id === undefined || lat === undefined || lng === undefined) return
    const zoom = Math.max(map.getZoom(), FOCUS_ZOOM)
    map.once("moveend", () => markers.current.get(id)?.openPopup())
    if (reduceMotion) map.setView({ lat, lng }, zoom, { animate: false })
    else map.flyTo({ lat, lng }, zoom, { duration: 0.6 })
  }, [map, id, lat, lng, markers, reduceMotion])
  return null
}

export function LeafletMap({
  centers,
  origin,
  selectedId,
}: {
  centers: RabiesCenterNearby[]
  origin: LatLng
  selectedId?: string
}) {
  const { locale, m, t } = useI18n()
  const copy = m.caseUi.map
  const markers = useRef(new Map<string, LeafletMarker>())
  const points = [origin, ...centers].map((p): [number, number] => [p.lat, p.lng])

  return (
    <MapContainer
      className="raksa-map size-full"
      bounds={latLngBounds(points)}
      boundsOptions={FIT}
      minZoom={10}
      maxZoom={18}
      zoomSnap={0.25}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <AttributionControl position="bottomright" prefix={false} />
      <ZoomControl key={locale} position="topright" zoomInTitle={copy.zoomIn} zoomOutTitle={copy.zoomOut} />
      <Marker position={origin} icon={USER_ICON} interactive={false} keyboard={false} />
      {centers.map((center, i) => (
        <Marker
          key={`${center.id}-${locale}`}
          ref={(marker) => {
            if (marker) markers.current.set(center.id, marker)
            else markers.current.delete(center.id)
          }}
          position={center}
          icon={pinIcon(i + 1)}
          title={t(copy.marker, { n: i + 1 })}
        >
          <Popup>
            <div className="flex min-w-[200px] flex-col gap-1 pr-6">
              <p className="text-base/[22px] font-medium text-foreground">{center.name}</p>
              <p className="text-sm/5 tracking-[0.25px] text-muted-foreground">
                {t(copy.hours, { hours: center.hours })} ·{" "}
                {t(m.caseUi.centerRow.distance, { km: formatKm(center.distanceKm, locale) })}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="raksa-popup-route mt-3 h-12 w-full border-transparent bg-muted hover:bg-muted/80"
            >
              <a href={mapsDirectionsUrl(center)} target="_blank" rel="noopener noreferrer">
                <Navigation strokeWidth={1.75} aria-hidden />
                {m.common.route}
              </a>
            </Button>
          </Popup>
        </Marker>
      ))}
      <FitToPoints points={JSON.stringify(points)} />
      <FocusCenter target={centers.find((c) => c.id === selectedId)} markers={markers} />
    </MapContainer>
  )
}
