import { Suspense } from "react"

import { OfficerQueueScreen } from "./screen"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OfficerQueueScreen />
    </Suspense>
  )
}
