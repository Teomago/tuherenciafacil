import { getPayload } from '@/lib/payload/getPayload'
import { headers } from 'next/headers'
import type { Payload } from 'payload'
import type { User } from '@/payload/payload-types'

export interface AuthContext {
  user: User
  payload: Payload
}

/**
 * Validates the current Server Action session.
 * Throws an Error if unauthenticated, halting the Action.
 * Returns the typed User and the ready Payload instance.
 */
export async function assertUser(): Promise<AuthContext> {
  const payload = await getPayload()
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || user.collection !== 'users') {
    throw new Error('Unauthorized')
  }

  return { user: user as User, payload }
}
