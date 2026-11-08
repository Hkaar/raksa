import { Suspense } from "react"

import { VaccineCardScreen } from "./screen"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VaccineCardScreen />
    </Suspense>
  )
}
