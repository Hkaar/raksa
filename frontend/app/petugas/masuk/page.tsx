import { Suspense } from "react"

import { OfficerLoginScreen } from "./screen"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OfficerLoginScreen />
    </Suspense>
  )
}
