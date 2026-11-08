import { Suspense } from "react"

import { LaporScreen } from "./screen"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LaporScreen />
    </Suspense>
  )
}
