import { Suspense } from "react"
import { notFound } from "next/navigation"

import { demo, getCase } from "@/lib/demo-data"

import { OfficerCaseScreen } from "./screen"

export async function generateStaticParams() {
  return demo.cases.map((c) => ({ kode: c.code }))
}

export default function Page({ params }: PageProps<"/petugas/kasus/[kode]">) {
  return (
    <Suspense fallback={null}>
      <Resolved params={params} />
    </Suspense>
  )
}

async function Resolved({ params }: { params: PageProps<"/petugas/kasus/[kode]">["params"] }) {
  const { kode } = await params
  if (!getCase(kode)) notFound()
  return <OfficerCaseScreen code={kode} />
}
