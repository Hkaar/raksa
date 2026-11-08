const API_URL = `${(process.env.NEXT_PUBLIC_RAKSA_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "")}/api/v1`

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

export const officerLogin = (username: string, password: string) =>
  postJson<LoginResponse>("/officer/auth/login", { username, password })

export const officerShortcut = () =>
  request<LoginResponse>("/officer/auth/shortcut", { method: "POST" })

export const officerMe = (accessToken: string) =>
  request<Officer>("/officer/auth/me", { method: "GET", headers: bearer(accessToken) })

export const officerRefresh = (refreshToken: string) =>
  postJson<LoginResponse>("/officer/auth/refresh", { refresh_token: refreshToken })

export const officerLogout = (accessToken: string) =>
  request<void>("/officer/auth/logout", { method: "POST", headers: bearer(accessToken) })

export const transcribeStory = (audio: Blob) =>
  request<TranscriptionResponse>("/stories/transcribe", {
    method: "POST",
    headers: { "Content-Type": audio.type || "audio/webm" },
    body: audio,
  })

export const extractStory = (story: string) =>
  postJson<ExtractionResponse>("/stories/extract", { story })

export const scanWound = (video: Blob) =>
  request<WoundScanResponse>("/scans/wound", {
    method: "POST",
    headers: { "Content-Type": video.type || "video/webm" },
    body: video,
  })

export const createCase = (body: CaseCreate) => postJson<void>("/cases", body)
