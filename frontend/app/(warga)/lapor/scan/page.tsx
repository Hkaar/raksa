import { Suspense } from "react"

import { ScanScreen } from "./screen"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ScanScreen />
    </Suspense>
  )
}
