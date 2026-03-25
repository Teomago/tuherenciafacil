import type { User } from '@/payload/payload-types'

/**
 * Type guard to safely narrow the generic user object to the Admin User collection type.
 */
export function isAdminUser(user: unknown): user is User {
  return (
    typeof user === 'object' &&
    user !== null &&
    'collection' in user &&
    (user as Record<string, unknown>).collection === 'users'
  )
}
