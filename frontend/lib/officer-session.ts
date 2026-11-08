"use client"

/**
 * Officer tokens from the backend, kept in sessionStorage: scoped to the tab, gone when it closes.
 * Pages read it through `OfficerGuard`, which calls `verifyOfficerSession` on mount.
 */
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

/** `expiresAt` is a local epoch-ms estimate; the backend's `/me` check stays authoritative. */
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

/** Clears the local session first, then revokes it server-side best-effort (errors ignored). */
export async function signOutOfficer(): Promise<void> {
  const token = getOfficerSession()?.accessToken
  clearOfficerSession()
  if (token) await officerLogout(token).catch(() => {})
}
