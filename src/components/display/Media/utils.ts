import type { Media as MediaType } from '@/payload/payload-types'

/**
 * Get the URL for a media resource.
 * Handles both expanded (full object) and non-expanded (ID) references.
 *
 * Payload stores absolute URLs (e.g. http://localhost:3000/api/media/...).
 * next/image cannot optimize same-host absolute URLs because it treats them
 * as remote sources and localhost is blocked. We strip the origin so the path
 * becomes root-relative (/api/media/...) and next/image handles it natively.
 */
export function getMediaUrl(
  resource: MediaType | string | number | null | undefined,
): string | null {
  if (!resource) return null
  if (typeof resource === 'string') return toRelativeUrl(resource)
  if (typeof resource === 'number') return null
  return resource.url ? toRelativeUrl(resource.url) : null
}

/**
 * If the URL's origin matches the current server origin (or is localhost),
 * return only the pathname + search + hash so next/image treats it as same-origin.
 * External URLs (CDN, Supabase, etc.) are returned unchanged.
 */
function toRelativeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    // Same host as server OR any localhost variant → strip origin
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      (typeof window !== 'undefined' && parsed.origin === window.location.origin) ||
      (typeof process !== 'undefined' && parsed.hostname === process.env.NEXT_PUBLIC_SERVER_URL?.replace(/^https?:\/\//, '').split(':')[0])
    ) {
      return parsed.pathname + parsed.search + parsed.hash
    }
  } catch {
    // Not a valid absolute URL — return as-is (already relative)
  }
  return url
}

/**
 * Get alt text from a media resource, with fallback to filename.
 */
export function getMediaAlt(
  resource: MediaType | string | number | null | undefined,
  fallback?: string,
): string {
  if (!resource || typeof resource !== 'object') return fallback || ''
  return resource.alt || resource.filename || fallback || ''
}

/**
 * Get media dimensions from a resource.
 */
export function getMediaDimensions(resource: MediaType | null | undefined): {
  width: number | undefined
  height: number | undefined
} {
  if (!resource || typeof resource !== 'object') {
    return { width: undefined, height: undefined }
  }
  return {
    width: resource.width || undefined,
    height: resource.height || undefined,
  }
}
