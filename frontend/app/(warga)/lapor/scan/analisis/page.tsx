import { Suspense } from "react"

import { ScanAnalysisScreen } from "./screen"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ScanAnalysisScreen />
    </Suspense>
  )
}
