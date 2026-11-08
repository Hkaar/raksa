import { Suspense } from "react"

import { NotBiteScreen } from "./screen"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NotBiteScreen />
    </Suspense>
  )
}
