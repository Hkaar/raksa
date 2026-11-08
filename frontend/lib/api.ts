/**
 * Client for the RAKSA FastAPI backend (`backend/`). Every call goes to `${NEXT_PUBLIC_RAKSA_API_URL}/api/v1`.
 * Failures throw `ApiError`; successful AI calls may still return `mode: "manual"` (see the response types).
 */
const API_URL = `${(process.env.NEXT_PUBLIC_RAKSA_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "")}/api/v1`

/**
 * Non-2xx response or network failure. `status` 0 means the backend was unreachable (`code: "network_error"`).
 * `code` is the backend's `detail` (string) or `detail.code`, e.g. `invalid_credentials`, `persistence_not_configured`.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
  ) {
    super(`API ${status}${code ? ` ${code}` : ""}`)
    this.name = "ApiError"
  }
}

export type Officer = { id: string; role: string }

export type LoginResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  officer: Officer
}

/**
 * AI endpoints (transcribe / extract / scan) never fail just because the AI is down: they answer 200 with
 * `mode: "manual"`, `null` content and a `reason`, and the UI falls back to manual input. `needs_confirmation`
 * is always true: results are suggestions the user must confirm, never diagnoses.
 */
export type StorySuggestion = {
  time_text: string | null
  place_text: string | null
  animal_species: string | null
  event_type: "bite" | "scratch" | "lick" | "other" | null
  body_part: string | null
  bleeding_reported: boolean | null
}

export type TranscriptionResponse = {
  mode: "ai" | "manual"
  transcript: string | null
  language: "id" | "en" | "unknown"
  needs_confirmation: true
  reason: "ai_unavailable" | "audio_unclear" | null
}

export type ExtractionResponse = {
  mode: "ai" | "manual"
  suggestion: StorySuggestion | null
  needs_confirmation: true
  reason: "ai_unavailable" | null
}

export type VisibleFeature =
  | "puncture_like_marks"
  | "abrasion_like_area"
  | "irregular_open_edges"
  | "crust_like_area"
  | "redness"

export type WoundScanSuggestion = {
  video_quality: "usable" | "poor"
  body_part: string | null
  blood_visibility: "visible" | "not_visible" | "unclear"
  wound_count: number | null
  visible_features: VisibleFeature[]
}

export type WoundScanResponse = {
  mode: "ai" | "manual"
  suggestion: WoundScanSuggestion | null
  needs_confirmation: true
  reason: "ai_unavailable" | "video_unclear" | null
}

/** Body of `POST /cases`; built from the report draft by `draftToCaseCreate` in `lapor/submit-report.ts`. */
export type CaseCreate = {
  story: string
  occurred_at: string | null
  location: { latitude: number; longitude: number } | null
  animal: {
    species: string
    ownership: "owned" | "stray" | "unknown"
    vaccination_status: "reported_vaccinated" | "reported_unvaccinated" | "unknown"
  }
  bleeding_reported: boolean | null
}

function errorCode(body: unknown): string | null {
  if (!body || typeof body !== "object" || !("detail" in body)) return null
  const detail = body.detail
  if (typeof detail === "string") return detail
  if (detail && typeof detail === "object" && "code" in detail && typeof detail.code === "string") {
    return detail.code
  }
  return null
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(API_URL + path, init)
  } catch {
    throw new ApiError(0, "network_error")
  }
  if (!res.ok) {
    let body: unknown = null
    try {
      body = await res.json()
    } catch {}
    throw new ApiError(res.status, errorCode(body))
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` })

/** The backend accepts exactly one of `email` or `username`; anything with an "@" is sent as email. */
export const officerLogin = (identifier: string, password: string) =>
  postJson<LoginResponse>(
    "/officer/auth/login",
    identifier.includes("@") ? { email: identifier, password } : { username: identifier, password },
  )

/** "Masuk sebagai demo": signs in with server-held demo credentials; 503 `shortcut_unavailable` when disabled. */
export const officerShortcut = () =>
  request<LoginResponse>("/officer/auth/shortcut", { method: "POST" })

/** Validates the token and officer role; 401 when expired/invalid, 403 when the account is not an officer. */
export const officerMe = (accessToken: string) =>
  request<Officer>("/officer/auth/me", { method: "GET", headers: bearer(accessToken) })

export const officerRefresh = (refreshToken: string) =>
  postJson<LoginResponse>("/officer/auth/refresh", { refresh_token: refreshToken })

export const officerLogout = (accessToken: string) =>
  request<void>("/officer/auth/logout", { method: "POST", headers: bearer(accessToken) })

/** Raw audio body (not multipart); the backend caps it at 8 MB. Call only after AI consent (`lib/ai-consent.ts`). */
export const transcribeStory = (audio: Blob) =>
  request<TranscriptionResponse>("/stories/transcribe", {
    method: "POST",
    headers: { "Content-Type": audio.type || "audio/webm" },
    body: audio,
  })

export const extractStory = (story: string) =>
  postJson<ExtractionResponse>("/stories/extract", { story })

/** Raw mp4/webm body (not multipart); the backend caps it at 12 MB. Call only after AI consent (`lib/ai-consent.ts`). */
export const scanWound = (video: Blob) =>
  request<WoundScanResponse>("/scans/wound", {
    method: "POST",
    headers: { "Content-Type": video.type || "video/webm" },
    body: video,
  })

/**
 * Saves a confirmed report (201). The created case in the response is ignored for now: the result screen
 * still shows demo data because there is no read endpoint. 503 `persistence_not_configured` = saving disabled.
 */
export const createCase = (body: CaseCreate) => postJson<void>("/cases", body)
