import { describe, expect, it } from 'vitest'
import { Cases } from '@/payload/collections/succession/Cases'
import type { Field, RelationshipField } from 'payload'

const getRelationshipField = (name: string): RelationshipField | undefined => {
  const field = (Cases.fields as Field[]).find(
    (candidate) => 'name' in candidate && candidate.name === name,
  )
  if (!field || field.type !== 'relationship') return undefined
  return field
}

const evaluateFilter = (field: RelationshipField | undefined) => {
  if (!field || typeof field.filterOptions !== 'function') return undefined
  const filter = field.filterOptions as () => unknown
  return filter()
}

describe('Cases role validation schema', () => {
  it('adds filterOptions to responsable field for cliente role', () => {
    const responsableField = getRelationshipField('responsable')
    expect(responsableField).toBeDefined()
    expect(responsableField?.type).toBe('relationship')
    expect(typeof responsableField?.filterOptions).toBe('function')
    expect(evaluateFilter(responsableField)).toEqual({ role: { equals: 'cliente' } })
  })

  it('adds filterOptions to abogadoAsignado field for active lawyers', () => {
    const abogadoField = getRelationshipField('abogadoAsignado')
    expect(abogadoField).toBeDefined()
    expect(abogadoField?.type).toBe('relationship')
    expect(typeof abogadoField?.filterOptions).toBe('function')
    expect(evaluateFilter(abogadoField)).toEqual({
      role: { equals: 'abogado' },
      isActive: { not_equals: false },
    })
  })
})
