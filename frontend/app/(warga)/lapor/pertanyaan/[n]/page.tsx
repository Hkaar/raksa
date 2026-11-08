import { notFound } from "next/navigation"
import { Suspense } from "react"

import { demo } from "@/lib/demo-data"

import { QuestionScreen } from "./screen"

export async function generateStaticParams() {
  return demo.reportDemo.followUpQuestions.map((_, i) => ({ n: String(i + 1) }))
}

export default function Page({ params }: PageProps<"/lapor/pertanyaan/[n]">) {
  return (
    <Suspense fallback={null}>
      <Resolved params={params} />
    </Suspense>
  )
}

async function Resolved({ params }: { params: PageProps<"/lapor/pertanyaan/[n]">["params"] }) {
  const { n } = await params
  const step = Number(n)
  if (!Number.isInteger(step) || step < 1 || step > demo.reportDemo.followUpQuestions.length || String(step) !== n) {
    notFound()
  }
  return <QuestionScreen step={step} />
}
