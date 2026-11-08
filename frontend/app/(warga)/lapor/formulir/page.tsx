import { Suspense } from "react"

import { FormScreen } from "./screen"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FormScreen />
    </Suspense>
  )
}
