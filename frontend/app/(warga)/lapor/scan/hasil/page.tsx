import { Suspense } from "react"

import { ScanResultScreen } from "./screen"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ScanResultScreen />
    </Suspense>
  )
}
