import { Suspense } from "react"

import { FirstAidScreen } from "./screen"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FirstAidScreen />
    </Suspense>
  )
}
