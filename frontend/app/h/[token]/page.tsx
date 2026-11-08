import { Suspense } from "react"
import { notFound } from "next/navigation"

import { demo, getCaseByOwnerToken } from "@/lib/demo-data"

import { OwnerScreen } from "./screen"

export async function generateStaticParams() {
  return demo.cases.map((c) => ({ token: c.ownerToken }))
}

export default function Page({ params }: PageProps<"/h/[token]">) {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-background">
      <Suspense fallback={null}>
        <Resolved params={params} />
      </Suspense>
    </div>
  )
}

async function Resolved({ params }: { params: PageProps<"/h/[token]">["params"] }) {
  const { token } = await params
  if (!getCaseByOwnerToken(token)) notFound()
  return <OwnerScreen token={token} />
}
