import { describe, it, expect, vi } from 'vitest'
import {
  isActiveLawyer,
  isClient,
  isStaffUser,
  canReadCaseScopedResource,
  canManageCaseScopedResource
} from '@/payload/collections/succession/permissions'
import { Where } from 'payload'

describe('succession.permissions', () => {
  const staff = { collection: 'users', roles: ['admin'] }
  const client = { collection: 'members', role: 'cliente', id: 'client-1' }
  const activeLawyer = { collection: 'members', role: 'abogado', isActive: true, id: 'lawyer-1' }
  const inactiveLawyer = { collection: 'members', role: 'abogado', isActive: false, id: 'lawyer-2' }

  describe('isActiveLawyer', () => {
    it('returns true for active lawyer', () => {
      expect(isActiveLawyer(activeLawyer)).toBe(true)
    })
    it('returns false for inactive lawyer', () => {
      expect(isActiveLawyer(inactiveLawyer)).toBe(false)
    })
    it('returns false for client and staff', () => {
      expect(isActiveLawyer(client)).toBe(false)
      expect(isActiveLawyer(staff)).toBe(false)
    })
  })

  describe('isClient', () => {
    it('returns true for client', () => {
      expect(isClient(client)).toBe(true)
    })
    it('returns false for lawyers and staff', () => {
      expect(isClient(activeLawyer)).toBe(false)
      expect(isClient(inactiveLawyer)).toBe(false)
      expect(isClient(staff)).toBe(false)
    })
  })

  describe('isStaffUser', () => {
    it('returns true for payload user', () => {
      expect(isStaffUser(staff)).toBe(true)
    })
    it('returns false for members', () => {
      expect(isStaffUser(client)).toBe(false)
      expect(isStaffUser(activeLawyer)).toBe(false)
    })
  })

  describe('canReadCaseScopedResource', () => {
    const mockPayloadFind = vi.fn().mockResolvedValue({ docs: [{ id: 'case-1' }] })
    
    it('allows staff/admin explicit path without mixing member roles', async () => {
      const result = await canReadCaseScopedResource({ req: { user: staff } } as any)
      expect(result).toBe(true)
    })

    it('allows active lawyer to read assigned case resources', async () => {
      mockPayloadFind.mockClear()
      const req = { user: activeLawyer, payload: { find: mockPayloadFind } }
      const result = await canReadCaseScopedResource({ req } as any) as Where
      expect(result).toEqual({ case: { in: ['case-1'] } })
      expect(mockPayloadFind).toHaveBeenCalledWith(expect.objectContaining({
        where: { abogadoAsignado: { equals: activeLawyer.id } }
      }))
    })

    it('allows client to read own case resources', async () => {
      mockPayloadFind.mockClear()
      const req = { user: client, payload: { find: mockPayloadFind } }
      const result = await canReadCaseScopedResource({ req } as any) as Where
      expect(result).toEqual({ case: { in: ['case-1'] } })
      expect(mockPayloadFind).toHaveBeenCalledWith(expect.objectContaining({
        where: { responsable: { equals: client.id } }
      }))
    })

    it('returns false for unassigned lawyer or no cases', async () => {
      mockPayloadFind.mockResolvedValueOnce({ docs: [] })
      const req = { user: activeLawyer, payload: { find: mockPayloadFind } }
      const result = await canReadCaseScopedResource({ req } as any)
      expect(result).toBe(false)
    })

    it('returns false for inactive lawyer', async () => {
      const req = { user: inactiveLawyer, payload: { find: mockPayloadFind } }
      const result = await canReadCaseScopedResource({ req } as any)
      expect(result).toBe(false)
    })
  })

  describe('canManageCaseScopedResource', () => {
    const mockPayloadFind = vi.fn().mockResolvedValue({ docs: [{ id: 'case-1' }] })

    it('allows staff/admin', async () => {
      const result = await canManageCaseScopedResource({ req: { user: staff } } as any)
      expect(result).toBe(true)
    })

    it('allows active lawyer to manage assigned case resources', async () => {
      const req = { user: activeLawyer, payload: { find: mockPayloadFind } }
      const result = await canManageCaseScopedResource({ req } as any) as Where
      expect(result).toEqual({ case: { in: ['case-1'] } })
    })

    it('denies client management', async () => {
      const req = { user: client, payload: { find: mockPayloadFind } }
      const result = await canManageCaseScopedResource({ req } as any)
      expect(result).toBe(false)
    })
  })
})
