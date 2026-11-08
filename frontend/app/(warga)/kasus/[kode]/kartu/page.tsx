import { Suspense } from "react"
import { notFound } from "next/navigation"
import { demo, getCase } from "@/lib/demo-data"
import { KartuScreen as Screen } from "./screen"

export async function generateStaticParams() {
  return demo.cases.map((c) => ({ kode: c.code }))
}

async function Resolved({ params }: { params: PageProps<"/kasus/[kode]/kartu">["params"] }) {
  const { kode } = await params
  if (!getCase(kode)) notFound()
  return <Screen code={kode} />
}

export default function Page({ params }: PageProps<"/kasus/[kode]/kartu">) {
  return (
    <Suspense fallback={null}>
      <Resolved params={params} />
    </Suspense>
  )
}
