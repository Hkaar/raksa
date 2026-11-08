"use client"

import { useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useReducedMotion } from "motion/react"
import { CircleQuestionMark, CloudOff, Download, Info, Navigation, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { AppHeader } from "@/components/raksa/app-header"
import { BottomBar } from "@/components/raksa/bottom-bar"
import { DeadlineMeter } from "@/components/raksa/deadline-meter"
import { Stagger, StaggerItem } from "@/components/raksa/motion"
import { NextSteps } from "@/components/raksa/next-steps"
import { RabiesCenterMap } from "@/components/raksa/rabies-center-map"
import { RabiesCenterRow } from "@/components/raksa/rabies-center-row"
import { ReportCardMini } from "@/components/raksa/report-card"
import { Screen } from "@/components/raksa/screen"
import { SectionHeader } from "@/components/raksa/section-header"
import { CategoryBadge, RiskBadge, SavedBadge } from "@/components/raksa/status-badges"
import { UrgencyCard } from "@/components/raksa/urgency-card"
import { WhySheet } from "@/components/raksa/why-sheet"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { demo, getCase, mapsDirectionsUrl, nearestRabiesCenters } from "@/lib/demo-data"
import { useSaveReportCard } from "@/lib/export-card"
import { addHours } from "@/lib/format"
import { useI18n } from "@/lib/i18n/provider"
import type { Case } from "@/lib/types"
import { requestUserPosition, useUserOrigin } from "@/lib/user-location"

const ICON = { strokeWidth: 1.75, "aria-hidden": true } as const

/**
 * Hasil (`ZRxtB`/`KBklW`, `WMz1K`, `p8GJVp`). Mobile = design; `md:` two columns — result, next steps
 * and report card left, the Rabies Center column (map, rows, route action) right (300px, 400px from
 * `lg`) — sticky only on viewports tall enough to show it whole.
 */
export function HasilScreen({ code }: { code: string }) {
  const c = getCase(code) as Case
  const { m } = useI18n()
  const copy = m.hasil
  const router = useRouter()
  const pathname = usePathname()
  const failed = useSearchParams().get("keadaan") === "gagal-simpan"
  const reduceMotion = useReducedMotion()
  const [whyOpen, setWhyOpen] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [selectedId, setSelectedId] = useState<string>()
  const mapBox = useRef<HTMLDivElement>(null)
  const card = useSaveReportCard(c)
  const origin = useUserOrigin()
  const centers = nearestRabiesCenters(origin)
  const deadlineAt = addHours(c.bittenAt, 24)
  const scrollBehavior = reduceMotion ? "auto" : "smooth"

  async function findRabiesCenter() {
    if (await requestUserPosition()) {
      document.getElementById("rabies-center")?.scrollIntoView({ behavior: scrollBehavior, block: "start" })
    } else {
      router.push("/rabies-center")
    }
  }

  function selectCenter(id: string) {
    setSelectedId(id)
    mapBox.current?.scrollIntoView({ behavior: scrollBehavior, block: "nearest" })
  }

  function retry() {
    setRetrying(true)
    setTimeout(() => {
      setRetrying(false)
      router.replace(pathname)
      toast(copy.resent, { icon: <SavedBadge /> })
    }, 1000)
  }

  const result = (
    <>
      <UrgencyCard
        urgency={c.urgency}
        reasons={c.explanation.reasons.map((r) => m.enums.reason[r])}
        deadlineAt={deadlineAt}
        onFindRabiesCenter={findRabiesCenter}
      />
      <div className="flex w-full flex-wrap items-center gap-2">
        <CategoryBadge category={c.woundCategory} />
        <RiskBadge risk={c.animalRisk} />
      </div>
    </>
  )

  const routeNearest = (
    <Button asChild>
      <a href={mapsDirectionsUrl(centers[0])} target="_blank" rel="noopener noreferrer">
        <Navigation {...ICON} />
        {copy.routeNearest}
      </a>
    </Button>
  )

  if (failed) {
    return (
      <Screen layout="wide">
        <AppHeader className="md:px-8" />
        <Stagger className="flex w-full flex-1 flex-col items-start gap-6 px-4 py-8 md:px-8 lg:mx-auto lg:max-w-[720px]">
          <StaggerItem className="flex w-full flex-col items-start gap-6">{result}</StaggerItem>
          <StaggerItem className="w-full">
            <Alert>
              <CloudOff {...ICON} />
              <AlertDescription>{copy.notSaved}</AlertDescription>
            </Alert>
          </StaggerItem>
          <StaggerItem>
            <Button variant="link" size="sm" onClick={retry} disabled={retrying}>
              <RefreshCw {...ICON} className={retrying ? "animate-spin motion-reduce:animate-none" : undefined} />
              {copy.retry}
            </Button>
          </StaggerItem>
        </Stagger>
        <BottomBar className="md:px-8 lg:mx-auto lg:max-w-[720px]">
          <Button onClick={card.save} disabled={card.saving}>
            <Download {...ICON} />
            {copy.saveCard}
          </Button>
        </BottomBar>
        {card.node}
      </Screen>
    )
  }

  return (
    <Screen layout="wide">
      <AppHeader className="md:px-8" />
      <Stagger className="flex w-full flex-col gap-9 px-4 py-8 md:grid md:grid-cols-[minmax(0,1fr)_300px] md:items-start md:gap-x-8 md:px-8 md:pb-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-x-12">
        {/* Mobile: one column in design order (report card last); md: this block is the left column. */}
        <div className="contents md:flex md:flex-col md:gap-9">
          <StaggerItem className="flex w-full flex-col items-start gap-3">
            {result}
            <Button variant="link" size="sm" onClick={() => setWhyOpen(true)}>
              <CircleQuestionMark {...ICON} />
              {copy.whyLink}
            </Button>
          </StaggerItem>

          <StaggerItem className="w-full">
            {c.urgency === "HARI_INI" ? (
              <NextSteps />
            ) : (
              <DeadlineMeter bittenAt={c.bittenAt} deadlineAt={deadlineAt} now={demo.meta.now} />
            )}
          </StaggerItem>

          <StaggerItem className="w-full">
            <Alert role="note">
              <Info {...ICON} />
              <AlertDescription>{copy.disclaimer}</AlertDescription>
            </Alert>
          </StaggerItem>

          <StaggerItem className="w-full max-md:order-last">
            <section className="flex w-full flex-col gap-3">
              <SectionHeader title={copy.reportCard} className="pb-0" />
              <ReportCardMini caseData={c} />
              <Button
                className="w-full bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90"
                onClick={card.save}
                disabled={card.saving}
              >
                <Download {...ICON} />
                {m.caseUi.reportCard.saveAsImage}
              </Button>
            </section>
          </StaggerItem>
        </div>

        <StaggerItem className="w-full md:col-start-2 md:row-start-1 md:[@media(min-height:900px)]:sticky md:[@media(min-height:900px)]:top-6">
          <section id="rabies-center" className="flex w-full scroll-mt-4 flex-col gap-3">
            <SectionHeader title={copy.nearestCenters} className="pb-0" />
            <div ref={mapBox} className="w-full scroll-mt-4">
              <RabiesCenterMap
                centers={centers}
                origin={origin}
                selectedId={selectedId}
                className="md:aspect-[4/3] lg:aspect-[16/11]"
              />
            </div>
            <div className="hidden w-full pt-1 md:flex [&>*]:flex-1">{routeNearest}</div>
            <div className="flex w-full flex-col">
              {centers.map((center, i) => (
                <RabiesCenterRow
                  key={center.id}
                  index={i + 1}
                  center={center}
                  selected={center.id === selectedId}
                  onSelect={selectCenter}
                />
              ))}
            </div>
          </section>
        </StaggerItem>
      </Stagger>
      <BottomBar className="pb-7 md:hidden">{routeNearest}</BottomBar>
      <WhySheet caseData={c} open={whyOpen} onOpenChange={setWhyOpen} />
      {card.node}
    </Screen>
  )
}
