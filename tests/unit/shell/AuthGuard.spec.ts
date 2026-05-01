import { describe, expect, it } from 'vitest'
import { resolveAuthGuardAction } from '@/components/auth/AuthGuard.logic'

describe('resolveAuthGuardAction', () => {
  it('redirects to login when user is missing', () => {
    expect(resolveAuthGuardAction(null)).toBe('redirect_login')
  })

  it('redirects to login when payload admin user hits app shell', () => {
    const adminUser = { collection: 'users', roles: ['admin'] }
    expect(resolveAuthGuardAction(adminUser)).toBe('redirect_login')
  })

  it('redirects inactive lawyers to pending activation', () => {
    const inactiveLawyer = { collection: 'members', role: 'abogado', isActive: false }
    expect(resolveAuthGuardAction(inactiveLawyer)).toBe('redirect_pending_activation')
  })

  it('allows active clients', () => {
    const client = { collection: 'members', role: 'cliente', isActive: true }
    expect(resolveAuthGuardAction(client)).toBe('allow')
  })

  it('allows active lawyers', () => {
    const lawyer = { collection: 'members', role: 'abogado', isActive: true }
    expect(resolveAuthGuardAction(lawyer)).toBe('allow')
  })
})
