"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react"
import { id } from "./messages-id"
import { en } from "./messages-en"

export type Locale = "id" | "en"
export type Messages = typeof id

const STORAGE_KEY = "raksa-locale"
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

function getSnapshot(): Locale {
  return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "id"
}

function getServerSnapshot(): Locale {
  return "id"
}

/** Replaces `{key}` tokens in a message template. */
export function format(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match))
}

type I18nValue = {
  locale: Locale
  m: Messages
  setLocale: (locale: Locale) => void
  t: (template: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    window.localStorage.setItem(STORAGE_KEY, next)
    for (const listener of listeners) listener()
  }, [])

  const value = useMemo<I18nValue>(
    () => ({ locale, m: locale === "en" ? en : id, setLocale, t: format }),
    [locale, setLocale],
  )

  return <I18nContext value={value}>{children}</I18nContext>
}

export function useI18n() {
  const value = useContext(I18nContext)
  if (!value) throw new Error("useI18n must be used inside I18nProvider")
  return value
}
