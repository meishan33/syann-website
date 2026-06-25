const KEY = 'syann_last_reading'
const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 1 day

type LastReading = { id: string; savedAt: number }

export function saveLastReading(id: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ id, savedAt: Date.now() }))
  } catch {}
}

export function getLastReading(): LastReading | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LastReading
    if (!parsed?.id || Date.now() - parsed.savedAt > MAX_AGE_MS) return null
    return parsed
  } catch {
    return null
  }
}

export function clearLastReading() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}
