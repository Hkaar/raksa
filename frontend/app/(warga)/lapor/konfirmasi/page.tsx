import { Suspense } from "react"

import { ConfirmScreen } from "./screen"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ConfirmScreen />
    </Suspense>
  )
}
