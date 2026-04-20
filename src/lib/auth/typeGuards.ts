import type { User, Member } from '@/payload/payload-types'

/**
 * Type guard to safely narrow the generic user object to the Admin User collection type.
 */
export function isAdminUser(user: unknown): user is User {
  const candidate = user as Record<string, unknown> | null
  const hasAdminRole =
    Array.isArray(candidate?.roles) && candidate.roles.some((role) => role === 'admin')

  return (
    typeof user === 'object' &&
    user !== null &&
    ('collection' in user || 'roles' in user) &&
    ((user as Record<string, unknown>).collection === 'users' || hasAdminRole)
  )
}

/**
 * Type guard to safely narrow the generic user object to the Member collection type.
 */
export function isMemberUser(user: unknown): user is Member {
  return (
    typeof user === 'object' &&
    user !== null &&
    'collection' in user &&
    (user as Record<string, unknown>).collection === 'members'
  )
}
