import { Suspense } from "react"

import { SplashScreen } from "./screen"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SplashScreen />
    </Suspense>
  )
}
