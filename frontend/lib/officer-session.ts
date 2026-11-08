"use client"

import { ApiError, officerLogout, officerMe, officerRefresh, type LoginResponse, type Officer } from "@/lib/api"

const KEY = "raksa-officer-session"

export type OfficerSession = { accessToken: string; refreshToken: string; expiresAt: number; officer: Officer }

export function getOfficerSession(): OfficerSession | null {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as OfficerSession
  } catch {
    return null
  }
}

export function saveOfficerSession(r: LoginResponse): void {
  const session: OfficerSession = {
    accessToken: r.access_token,
    refreshToken: r.refresh_token,
    expiresAt: Date.now() + r.expires_in * 1000,
    officer: r.officer,
  }
  sessionStorage.setItem(KEY, JSON.stringify(session))
}

export function clearOfficerSession(): void {
  sessionStorage.removeItem(KEY)
}

/** Confirms the stored session with `GET /me`, refreshing once on 401. Clears it on any failure. */
export async function verifyOfficerSession(): Promise<boolean> {
  const session = getOfficerSession()
  if (!session) return false
  try {
    try {
      await officerMe(session.accessToken)
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) throw e
      const refreshed = await officerRefresh(session.refreshToken)
      saveOfficerSession(refreshed)
      await officerMe(refreshed.access_token)
    }
    return true
  } catch {
    clearOfficerSession()
    return false
  }
}

export async function signOutOfficer(): Promise<void> {
  const token = getOfficerSession()?.accessToken
  clearOfficerSession()
  if (token) await officerLogout(token).catch(() => {})
}
