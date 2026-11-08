const BITE_KEYWORDS = ["gigit", "cakar", "jilat", "bite", "bit", "scratch", "lick", "cokot", "gutgut"]

/**
 * Stand-in for the backend story classifier: a story counts as a bite report when it
 * mentions any bite/scratch/lick keyword (Indonesian, English, Balinese).
 */
export function isBiteStory(text: string) {
  const lower = text.toLowerCase()
  return BITE_KEYWORDS.some((keyword) => lower.includes(keyword))
}
