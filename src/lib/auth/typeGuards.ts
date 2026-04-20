import type { User, Member } from '@/payload/payload-types'

/** Roles on the Payload `users` auth collection (admin UI accounts). Not `members.role` (cliente/abogado). */
const USERS_COLLECTION_ROLES = ['admin', 'editor', 'user'] as const

/**
 * True if this is a `users`-collection account (admin / editor / user), including when
 * `req.user` omits `collection` but still has `roles` from the JWT (common on some API paths).
 */
export function isAdminUser(user: unknown): user is User {
  if (typeof user !== 'object' || user === null) return false
  const u = user as Record<string, unknown>
  if (u.collection === 'users') return true
  if (Array.isArray(u.roles) && u.roles.some((r) => USERS_COLLECTION_ROLES.includes(r as (typeof USERS_COLLECTION_ROLES)[number]))) {
    return true
  }
  return false
}

/**
 * Admin or Editor staff: can manage member records in the admin (list, edit, delete).
 * The `user` role is treated as read-oriented for this collection (view-only for destructive ops).
 */
export function staffCanManageMembersInAdmin(user: unknown): boolean {
  if (!isAdminUser(user)) return false
  const u = user as unknown as Record<string, unknown>
  const raw = u.roles
  const roles = Array.isArray(raw) ? raw.filter((r): r is string => typeof r === 'string') : []
  if (roles.length === 0) return true
  return roles.some((r) => r === 'admin' || r === 'editor')
}

/**
 * Only Admin role (Payload users collection): for sensitive member fields (e.g. role, activation).
 */
export function staffIsPayloadAdminRole(user: unknown): boolean {
  if (!isAdminUser(user)) return false
  const u = user as unknown as Record<string, unknown>
  const raw = u.roles
  const roles = Array.isArray(raw) ? raw.filter((r): r is string => typeof r === 'string') : []
  if (roles.length === 0) return true
  return roles.includes('admin')
}

/**
 * Type guard to safely narrow the generic user object to the Member collection type.
 */
export function isMemberUser(user: unknown): user is Member {
  if (typeof user !== 'object' || user === null) return false
  const u = user as Record<string, unknown>
  if (u.collection === 'members') return true
  if (u.role === 'cliente' || u.role === 'abogado') return true
  return false
}
