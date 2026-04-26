import { describe, it, expect, vi } from 'vitest'
import { Documents } from '@/payload/collections/succession/Documents'

describe('Documents Collection Access', () => {
  const staff = { collection: 'users', roles: ['admin'] }
  const client = { collection: 'members', role: 'cliente', id: 'client-1' }
  const activeLawyer = { collection: 'members', role: 'abogado', isActive: true, id: 'lawyer-1' }
  const mockPayloadFind = vi.fn()
  const mockPayloadFindByID = vi.fn()

  const buildReq = (user: any) => ({
    req: {
      user,
      payload: {
        find: mockPayloadFind,
        findByID: mockPayloadFindByID,
      }
    } as any
  })

  describe('read', () => {
    it('allows staff', async () => {
      const readFn = Documents.access!.read!
      const result = await readFn(buildReq(staff) as any)
      expect(result).toBe(true)
    })

    it('returns false for no user', async () => {
      const readFn = Documents.access!.read!
      const result = await readFn(buildReq(null) as any)
      expect(result).toBe(false)
    })
  })

  describe('create', () => {
    it('allows staff', async () => {
      const createFn = Documents.access!.create!
      const result = await createFn({ ...buildReq(staff), data: { case: 'case-1' } } as any)
      expect(result).toBe(true)
    })

    it('allows active lawyer assigned to case', async () => {
      mockPayloadFindByID.mockResolvedValueOnce({ abogadoAsignado: activeLawyer.id })
      const createFn = Documents.access!.create!
      const result = await createFn({ ...buildReq(activeLawyer), data: { case: 'case-1' } } as any)
      expect(result).toBe(true)
    })

    it('denies active lawyer not assigned to case', async () => {
      mockPayloadFindByID.mockResolvedValueOnce({ abogadoAsignado: 'other-lawyer' })
      const createFn = Documents.access!.create!
      const result = await createFn({ ...buildReq(activeLawyer), data: { case: 'case-1' } } as any)
      expect(result).toBe(false)
    })
  })

  describe('update', () => {
    it('allows staff', async () => {
      const updateFn = Documents.access!.update!
      const result = await updateFn({ ...buildReq(staff), id: 'doc-1' } as any)
      expect(result).toBe(true)
    })

    it('allows client to update their own non-verified document', async () => {
      mockPayloadFindByID.mockResolvedValueOnce({ case: 'case-1', status: 'uploaded' })
      mockPayloadFindByID.mockResolvedValueOnce({ responsable: client.id })
      
      const updateFn = Documents.access!.update!
      const result = await updateFn({ ...buildReq(client), id: 'doc-1' } as any)
      expect(result).toBe(true)
    })

    it('denies client from updating approved document', async () => {
      mockPayloadFindByID.mockResolvedValueOnce({ case: 'case-1', status: 'approved' })
      
      const updateFn = Documents.access!.update!
      const result = await updateFn({ ...buildReq(client), id: 'doc-1' } as any)
      expect(result).toBe(false)
    })
  })

  describe('delete', () => {
    it('allows staff only', () => {
      const deleteFn = Documents.access!.delete!
      expect(deleteFn(buildReq(staff) as any)).toBe(true)
      expect(deleteFn(buildReq(activeLawyer) as any)).toBe(false)
      expect(deleteFn(buildReq(client) as any)).toBe(false)
      expect(deleteFn(buildReq(null) as any)).toBe(false)
    })
  })
})
