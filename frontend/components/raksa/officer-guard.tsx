"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { verifyOfficerSession } from "@/lib/officer-session"

/** Renders officer screens only after the backend confirms the stored session. */
export function OfficerGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    let live = true
    void verifyOfficerSession().then((ok) => {
      if (!live) return
      if (ok) setAllowed(true)
      else router.replace("/petugas/masuk")
    })
    return () => {
      live = false
    }
  }, [router])

  return allowed ? children : null
}
