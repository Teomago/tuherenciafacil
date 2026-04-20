/**
 * `new URL()` requires a full origin with scheme. Env mistakes like `example.com`
 * (no https://) break Payload admin and any code building absolute URLs.
 */
export function normalizePublicServerURL(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return 'http://localhost:3000'

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/$/, '')
  }

  const isLocal =
    trimmed.startsWith('localhost') ||
    trimmed.startsWith('127.0.0.1') ||
    trimmed === '[::1]'

  const withScheme = isLocal ? `http://${trimmed}` : `https://${trimmed}`
  return withScheme.replace(/\/$/, '')
}

/** Resolved public origin for server-side code. Prefer NEXT_PUBLIC_SERVER_URL; then Vercel preview URL. */
export function getPublicServerURL(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SERVER_URL?.trim()
  if (fromEnv) {
    return normalizePublicServerURL(fromEnv)
  }
  if (process.env.VERCEL_URL) {
    return normalizePublicServerURL(`https://${process.env.VERCEL_URL}`)
  }
  return normalizePublicServerURL('')
}
