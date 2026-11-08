import { Suspense } from "react"

import { BerandaScreen } from "./screen"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BerandaScreen />
    </Suspense>
  )
}
