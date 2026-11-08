"use client"

import dynamic from "next/dynamic"

import { useI18n } from "@/lib/i18n/provider"
import type { LatLng, RabiesCenterNearby } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Leaflet touches `window` on import, so the map itself only loads in the browser. */
const LeafletMap = dynamic(() => import("@/components/raksa/rabies-center-leaflet").then((mod) => mod.LeafletMap), {
  ssr: false,
  loading: () => <div aria-hidden className="size-full animate-pulse bg-muted motion-reduce:animate-none" />,
})

/**
 * RabiesCenterMap (pen `egnfG`): OpenStreetMap with the user's location and numbered Rabies Center
 * pins (numbers match `RabiesCenterRow`). `selectedId` flies the map to that center and opens its popup.
 */
export function RabiesCenterMap({
  centers,
  origin,
  selectedId,
  className,
}: {
  centers: RabiesCenterNearby[]
  origin: LatLng
  selectedId?: string
  className?: string
}) {
  const { m } = useI18n()
  const copy = m.caseUi.map

  return (
    <div
      role="region"
      aria-label={copy.label}
      className={cn(
        "relative isolate aspect-[358/200] w-full overflow-hidden rounded-lg border border-border bg-muted md:aspect-[16/10] lg:aspect-[4/3]",
        className,
      )}
    >
      <LeafletMap centers={centers} origin={origin} selectedId={selectedId} />
      <div className="pointer-events-none absolute bottom-3.5 left-2.5 z-[1000] flex items-center gap-1.5 rounded-full bg-card px-2.5 py-[5px] text-sm/[14px] whitespace-nowrap text-foreground">
        <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-foreground" />
        {copy.yourLocation}
      </div>
    </div>
  )
}
