import { Suspense } from "react"

import { VaccineCardResultScreen } from "./screen"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VaccineCardResultScreen />
    </Suspense>
  )
}
