import { Suspense } from "react"

import { RabiesCenterScreen } from "./screen"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RabiesCenterScreen />
    </Suspense>
  )
}
