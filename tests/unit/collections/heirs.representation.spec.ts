import { describe, expect, it } from 'vitest'
import { Heirs } from '@/payload/collections/succession/Heirs'
import type { Field, RelationshipField } from 'payload'

const getRelationshipField = (name: string): RelationshipField | undefined => {
  const field = (Heirs.fields as Field[]).find(
    (candidate) => 'name' in candidate && candidate.name === name,
  )
  if (!field || field.type !== 'relationship') return undefined
  return field
}

const evaluateFilter = (field: RelationshipField | undefined, data: Record<string, unknown>) => {
  if (!field || typeof field.filterOptions !== 'function') return undefined
  const filter = field.filterOptions as (args: { data: Record<string, unknown> }) => unknown
  return filter({ data })
}

describe('Heirs representation schema', () => {
  it('adds case + deceased filterOptions to herederoOriginal', () => {
    const field = getRelationshipField('herederoOriginal')
    expect(field).toBeDefined()
    expect(field?.type).toBe('relationship')
    expect(typeof field?.filterOptions).toBe('function')

    const noCaseFilter = evaluateFilter(field, {})
    expect(noCaseFilter).toBe(false)

    const withCaseFilter = evaluateFilter(field, { case: 'case-123' })
    expect(withCaseFilter).toEqual({
      case: { equals: 'case-123' },
      esFallecido: { equals: true },
    })
  })
})
