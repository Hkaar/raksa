import { DEMO_NOW, demo } from "@/lib/demo-data"
import type { Locale } from "@/lib/i18n/provider"

const TIME_ZONE = "Asia/Makassar"
const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

type Parts = { weekday: string; weekdayLong: string; day: string; month: string; year: string; time: string }

const formatters = new Map<Locale, { short: Intl.DateTimeFormat; long: Intl.DateTimeFormat }>()

function parts(iso: string, locale: Locale): Parts {
  let f = formatters.get(locale)
  if (!f) {
    const tag = locale === "id" ? "id-ID" : "en-GB"
    const base: Intl.DateTimeFormatOptions = {
      timeZone: TIME_ZONE,
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }
    f = {
      short: new Intl.DateTimeFormat(tag, { ...base, weekday: "short" }),
      long: new Intl.DateTimeFormat(tag, { timeZone: TIME_ZONE, weekday: "long" }),
    }
    formatters.set(locale, f)
  }
  const date = new Date(iso)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    f.short.formatToParts(date).find((p) => p.type === type)?.value ?? ""
  const separator = locale === "id" ? "." : ":"
  return {
    weekday: get("weekday").replace(/\.$/, ""),
    weekdayLong: f.long.format(date),
    day: get("day"),
    month: get("month").replace(/\.$/, ""),
    year: get("year"),
    time: `${get("hour")}${separator}${get("minute")}`,
  }
}

/** "Jum 6 Nov · 07.30" */
export function fmtDayTime(iso: string, locale: Locale) {
  const p = parts(iso, locale)
  return `${p.weekday} ${p.day} ${p.month} · ${p.time}`
}

/** "Jumat, 6 Nov 2026 · 07.30" */
export function fmtFullDayTime(iso: string, locale: Locale) {
  const p = parts(iso, locale)
  return `${p.weekdayLong}, ${p.day} ${p.month} ${p.year} · ${p.time}`
}

/** "6 Nov 2026, 07.30" */
export function fmtDateTime(iso: string, locale: Locale) {
  const p = parts(iso, locale)
  return `${p.day} ${p.month} ${p.year}, ${p.time}`
}

/** "6 Nov 2026" */
export function fmtDate(iso: string, locale: Locale) {
  const p = parts(iso, locale)
  return `${p.day} ${p.month} ${p.year}`
}

/** "6 Nov" */
export function fmtDayMonth(iso: string, locale: Locale) {
  const p = parts(iso, locale)
  return `${p.day} ${p.month}`
}

/** "Sabtu, 7 Nov" */
export function fmtWeekdayDate(iso: string, locale: Locale) {
  const p = parts(iso, locale)
  return `${p.weekdayLong}, ${p.day} ${p.month}`
}

/** "08.10" */
export function fmtTime(iso: string, locale: Locale) {
  return parts(iso, locale).time
}

/** Elapsed time from `iso` to the demo clock: "11 menit" / "2 jam" / "6 hari". */
export function fmtSince(iso: string, locale: Locale) {
  const ms = Math.max(0, DEMO_NOW - new Date(iso).getTime())
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) return locale === "id" ? `${minutes} menit` : `${minutes} min`
  const hours = Math.floor(ms / HOUR_MS)
  if (hours < 24) return locale === "id" ? `${hours} jam` : `${hours} h`
  const days = Math.floor(ms / DAY_MS)
  return locale === "id" ? `${days} hari` : `${days} ${days === 1 ? "day" : "days"}`
}

/** "23 jam 49 menit" */
export function fmtRemaining(ms: number, locale: Locale) {
  const total = Math.max(0, Math.floor(ms / 60000))
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return locale === "id" ? `${hours} jam ${minutes} menit` : `${hours} h ${minutes} min`
}

/** Day number of an observation at `at` (default: the demo clock), 1-based and clamped to its duration. */
export function observationDay(startedAt: string, durationDays: number, at: string = demo.meta.now) {
  const day = Math.floor((new Date(at).getTime() - new Date(startedAt).getTime()) / DAY_MS) + 1
  return Math.min(Math.max(day, 1), durationDays)
}

export function addHours(iso: string, hours: number) {
  return new Date(new Date(iso).getTime() + hours * HOUR_MS).toISOString()
}
