/**
 * Formats a date string into a consistent localized date-time representation.
 * Example: Jun 20, 2026, 3:36:45 PM
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "N/A"
  
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(date)
}

/**
 * Formats seconds into a human-readable duration string.
 * Example: 341 seconds -> 5m 41s
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0s"

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  const parts: string[] = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  if (s > 0 || parts.length === 0) parts.push(`${s}s`)

  return parts.join(" ")
}
