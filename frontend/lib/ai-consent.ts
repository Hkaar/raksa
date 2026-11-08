"use client"

export type AiConsent = "granted" | "declined"

const KEY = "raksa-ai-consent"

/** Consent to send voice, story and wound video to Gemini; asked once per tab session. */
export function getAiConsent(): AiConsent | null {
  const value = sessionStorage.getItem(KEY)
  return value === "granted" || value === "declined" ? value : null
}

export function setAiConsent(v: AiConsent): void {
  sessionStorage.setItem(KEY, v)
}
