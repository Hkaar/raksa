"use client"

import { Database } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { resetDemo } from "@/lib/demo-store"

/** Clears this browser's demo changes (started observations, owner reports). */
export function ResetDemoButton() {
  return (
    <Button
      variant="outline"
      className="h-12 w-fit"
      onClick={() => {
        resetDemo()
        toast("Data contoh dimuat.")
      }}
    >
      <Database strokeWidth={1.75} aria-hidden />
      Muat data contoh
    </Button>
  )
}
