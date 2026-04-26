import { isAdminUser, isMemberUser } from '@/lib/auth/typeGuards'
import type { PayloadRequest, Where } from 'payload'

export function isActiveLawyer(user: unknown): boolean {
  if (!isMemberUser(user)) return false
  return user.role === 'abogado' && user.isActive !== false
}

export function isClient(user: unknown): boolean {
  if (!isMemberUser(user)) return false
  return user.role === 'cliente'
}

export function isStaffUser(user: unknown): boolean {
  return isAdminUser(user)
}

export async function canReadCaseScopedResource({ req }: { req: PayloadRequest }): Promise<boolean | Where> {
  const user = req.user
  if (!user) return false
  if (isStaffUser(user)) return true

  if (isActiveLawyer(user)) {
    const cases = await req.payload.find({
      collection: 'cases',
      where: { abogadoAsignado: { equals: user.id } },
      limit: 100,
    })
    const ids = cases.docs.map((c) => c.id)
    if (ids.length === 0) return false
    return { case: { in: ids } } as Where
  }

  if (isClient(user)) {
    const cases = await req.payload.find({
      collection: 'cases',
      where: { responsable: { equals: user.id } },
      limit: 100,
    })
    const ids = cases.docs.map((c) => c.id)
    if (ids.length === 0) return false
    return { case: { in: ids } } as Where
  }

  return false
}

export async function canManageCaseScopedResource({ req }: { req: PayloadRequest }): Promise<boolean | Where> {
  const user = req.user
  if (!user) return false
  if (isStaffUser(user)) return true

  if (isActiveLawyer(user)) {
    const cases = await req.payload.find({
      collection: 'cases',
      where: { abogadoAsignado: { equals: user.id } },
      limit: 100,
    })
    const ids = cases.docs.map((c) => c.id)
    if (ids.length === 0) return false
    return { case: { in: ids } } as Where
  }

  return false
}
