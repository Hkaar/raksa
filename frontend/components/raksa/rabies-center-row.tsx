"use client"

import { Navigation, Phone } from "lucide-react"
import { useId } from "react"

import { Button } from "@/components/ui/button"
import { mapsDirectionsUrl } from "@/lib/demo-data"
import { formatKm } from "@/lib/geo"
import { useI18n } from "@/lib/i18n/provider"
import type { RabiesCenterNearby } from "@/lib/types"
import { cn } from "@/lib/utils"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const

/**
 * RabiesCenterRow (pen `OMy2X`, styled as used in `ZRxtB`): name, address, distance, Route and Call actions.
 * With `onSelect`, the name block becomes a button that shows the center on the map.
 */
export function RabiesCenterRow({
  index,
  center,
  selected = false,
  onSelect,
  className,
}: {
  /** 1-based number matching the map marker. */
  index: number
  center: RabiesCenterNearby
  selected?: boolean
  onSelect?: (id: string) => void
  className?: string
}) {
  const { locale, m, t } = useI18n()
  const copy = m.caseUi.centerRow
  const id = useId()

  const info = (
    <>
      <span className="flex flex-1 flex-col gap-1">
        <span
          className={cn(
            "text-base/[22px] font-medium text-foreground transition-colors duration-[160ms] ease-[var(--ease-raksa)]",
            selected && "text-primary",
          )}
        >
          <span className="sr-only">{index}. </span>
          {center.name}
        </span>
        <span id={`${id}-address`} className="text-base/6 text-muted-foreground">
          {t(copy.addressHours, { address: center.address, hours: center.hours })}
        </span>
      </span>
      <span id={`${id}-distance`} className="text-base font-medium whitespace-nowrap text-foreground">
        {t(copy.distance, { km: formatKm(center.distanceKm, locale) })}
      </span>
    </>
  )

  return (
    <div className={cn("flex w-full flex-col gap-4 border-b border-border py-5", className)}>
      {onSelect ? (
        <button
          type="button"
          aria-pressed={selected}
          aria-label={t(copy.showOnMap, { name: center.name })}
          aria-describedby={`${id}-address ${id}-distance`}
          onClick={() => onSelect(center.id)}
          className="-m-2 flex items-start justify-between gap-3 rounded-md p-2 text-left transition-colors duration-[160ms] ease-[var(--ease-raksa)] outline-none hover:bg-state-hover focus-visible:outline-3 focus-visible:outline-focus-ring"
        >
          {info}
        </button>
      ) : (
        <div className="flex w-full items-start justify-between gap-3">{info}</div>
      )}
      <div className="flex w-full items-start gap-2.5">
        <Button asChild variant="outline" className="h-12 flex-1 border-transparent bg-muted hover:bg-muted/80">
          <a href={mapsDirectionsUrl(center)} target="_blank" rel="noopener noreferrer">
            <Navigation {...ICON} />
            {m.common.route}
          </a>
        </Button>
        <Button asChild className="h-12 flex-1">
          <a href={`tel:${center.phone}`}>
            <Phone {...ICON} />
            {m.common.call}
          </a>
        </Button>
      </div>
    </div>
  )
}
