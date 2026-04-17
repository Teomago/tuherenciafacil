import { describe, it, expect } from 'vitest'
import { Members } from '@/payload/collections/settings/Members/index'
import type { Field } from 'payload'

function getField(name: string): Field & { access?: any } {
  const field = Members.fields.find((f: any) => f.name === name) as any
  if (!field) throw new Error(`Field "${name}" not found in Members collection`)
  return field
}

function makeAdminReq() {
  return { user: { collection: 'users', email: 'admin@test.com' } } as any
}

function makeAbogadoReq() {
  return { user: { collection: 'members', role: 'abogado', isActive: true, id: 'abogado-1' } } as any
}

function makeClienteReq() {
  return { user: { collection: 'members', role: 'cliente', id: 'cliente-1' } } as any
}

describe('Members collection — field-level access control', () => {
  describe('creditoAcumulado field (I-2)', () => {
    it('admin can update creditoAcumulado', () => {
      const field = getField('creditoAcumulado')
      expect(field.access?.update?.({ req: makeAdminReq() })).toBe(true)
    })

    it('I-2: abogado CANNOT directly update creditoAcumulado (must go through hook)', () => {
      const field = getField('creditoAcumulado')
      // This is the bug: currently returns true for abogados, must return false
      expect(field.access?.update?.({ req: makeAbogadoReq() })).toBe(false)
    })

    it('cliente cannot update creditoAcumulado', () => {
      const field = getField('creditoAcumulado')
      expect(field.access?.update?.({ req: makeClienteReq() })).toBe(false)
    })
  })

  describe('role field', () => {
    it('only admin can update role', () => {
      const field = getField('role')
      expect(field.access?.update?.({ req: makeAdminReq() })).toBe(true)
      expect(field.access?.update?.({ req: makeAbogadoReq() })).toBe(false)
    })
  })
})
