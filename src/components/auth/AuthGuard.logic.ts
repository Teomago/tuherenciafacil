import type { Member } from '@/payload/payload-types'
import { isMemberUser } from '@/lib/auth/typeGuards'

export type AuthGuardAction = 'allow' | 'redirect_login' | 'redirect_pending_activation'

export type AuthGuardResolution =
  | { outcome: 'redirect_login' }
  | { outcome: 'redirect_pending_activation' }
  | { outcome: 'allow'; member: Member }

export function resolveAuthGuardResolution(user: unknown): AuthGuardResolution {
  if (!user || !isMemberUser(user)) {
    return { outcome: 'redirect_login' }
  }

  if (user.role === 'abogado' && user.isActive === false) {
    return { outcome: 'redirect_pending_activation' }
  }

  return { outcome: 'allow', member: user }
}

export const resolveAuthGuardAction = (user: unknown): AuthGuardAction => {
  const resolution = resolveAuthGuardResolution(user)
  if (resolution.outcome === 'allow') return 'allow'
  return resolution.outcome
}
