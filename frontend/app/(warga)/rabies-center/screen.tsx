"use client"

import { MapPin, MapPinOff } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useCallback, useRef, useState } from "react"

import { AppHeader } from "@/components/raksa/app-header"
import { BottomBar } from "@/components/raksa/bottom-bar"
import { LabeledSelect } from "@/components/raksa/labeled-input"
import { RabiesCenterMap } from "@/components/raksa/rabies-center-map"
import { RabiesCenterRow } from "@/components/raksa/rabies-center-row"
import { Screen } from "@/components/raksa/screen"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { demo, nearestRabiesCenters } from "@/lib/demo-data"
import { useI18n } from "@/lib/i18n/provider"
import { DURATION, easeTransition } from "@/lib/motion"
import type { Kecamatan } from "@/lib/types"
import { useUserOrigin } from "@/lib/user-location"

/**
 * Rabies Center terdekat, location denied (pen `bfM2c`). Mobile = design with results below the form;
 * lg: form left, results (map + rows) right.
 */
export function RabiesCenterScreen() {
  const { m } = useI18n()
  const r = m.rabiesCenter
  const reduceMotion = useReducedMotion()
  const origin = useUserOrigin()
  const [kecamatan, setKecamatan] = useState<Kecamatan | undefined>()
  const [shown, setShown] = useState<Kecamatan | undefined>()
  const [selectedId, setSelectedId] = useState<string>()
  const [error, setError] = useState(false)
  const mapBox = useRef<HTMLDivElement>(null)
  const scrollBehavior = reduceMotion ? "auto" : "smooth"

  /** Results mount after each valid submit (and after the previous set exits); bring them into view on phones/tablets. */
  const revealResults = useCallback(
    (el: HTMLElement | null) => {
      // Side by side from lg: the results are already in view.
      if (!el || window.matchMedia("(min-width: 1024px)").matches) return
      el.scrollIntoView({ behavior: scrollBehavior, block: "start" })
    },
    [scrollBehavior],
  )

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!kecamatan) {
      setError(true)
      return
    }
    setShown(kecamatan)
    setSelectedId(undefined)
  }

  function selectCenter(id: string) {
    setSelectedId(id)
    mapBox.current?.scrollIntoView({ behavior: scrollBehavior, block: "nearest" })
  }

  const centers = shown ? nearestRabiesCenters(origin, shown) : []

  return (
    <Screen layout="wide" className="bg-background">
      <AppHeader className="md:px-8" />
      <div className="flex flex-1 flex-col gap-6 px-4 py-8 md:px-8 lg:grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-start lg:gap-x-12 lg:pb-12">
        <form id="rc-form" onSubmit={submit} noValidate className="flex flex-col gap-6">
          <h1 className="text-[32px]/[35px] font-bold text-foreground">{r.title}</h1>
          <Alert>
            <MapPinOff aria-hidden strokeWidth={1.75} />
            <AlertDescription>{r.locationDenied}</AlertDescription>
          </Alert>
          <LabeledSelect
            label={r.kecamatanLabel}
            placeholder={r.kecamatanPlaceholder}
            name="kecamatan"
            options={demo.kecamatan.map((k) => ({ value: k, label: m.enums.kecamatan[k] }))}
            value={kecamatan}
            onValueChange={(v) => {
              setKecamatan(v as Kecamatan)
              setError(false)
            }}
            error={error ? m.common.required : undefined}
          />
          <Button type="submit" className="hidden lg:flex">
            {r.submit}
          </Button>
        </form>

        <div aria-live="polite" className="lg:sticky lg:top-6">
          <AnimatePresence mode="wait" initial={false}>
            {shown ? (
              <motion.section
                key={shown}
                ref={revealResults}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: easeTransition(DURATION.enter) }}
                exit={{ opacity: 0, transition: easeTransition(DURATION.quick) }}
                className="flex scroll-mt-4 flex-col gap-4"
              >
                <div ref={mapBox} className="w-full scroll-mt-4">
                  <RabiesCenterMap centers={centers} origin={origin} selectedId={selectedId} />
                </div>
                <div className="flex flex-col gap-3">
                  {centers.map((c, i) => (
                    <RabiesCenterRow
                      key={c.id}
                      index={i + 1}
                      center={c}
                      selected={c.id === selectedId}
                      onSelect={selectCenter}
                    />
                  ))}
                </div>
              </motion.section>
            ) : (
              <motion.div
                key="placeholder"
                exit={{ opacity: 0, transition: easeTransition(DURATION.quick) }}
                className="hidden aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface-container-low px-10 text-center lg:flex"
              >
                <MapPin aria-hidden strokeWidth={1.75} className="size-8 text-muted-foreground" />
                <p className="max-w-[280px] text-base/6 text-muted-foreground">{r.resultsPlaceholder}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <BottomBar className="md:px-8 lg:hidden">
        <Button type="submit" form="rc-form">
          {r.submit}
        </Button>
      </BottomBar>
    </Screen>
  )
}
