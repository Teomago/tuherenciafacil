import { describe, expect, it } from 'vitest'
import { DocumentChecklist } from '@/payload/collections/succession/DocumentChecklist'
import { NotaryProcess } from '@/payload/collections/succession/NotaryProcess'
import type { Field, RelationshipField } from 'payload'

const caseScopedExpectedFilter = { case: { equals: 'case-123' } }

const getFieldByName = (fields: Field[], name: string): Field | undefined =>
  fields.find((field) => 'name' in field && field.name === name)

const getNestedField = (
  fields: Field[],
  groupName: string,
  fieldName: string,
): RelationshipField | undefined => {
  const group = getFieldByName(fields, groupName)
  if (!group || !('fields' in group) || !Array.isArray(group.fields)) return undefined
  const nested = getFieldByName(group.fields as Field[], fieldName)
  if (!nested || nested.type !== 'relationship') return undefined
  return nested
}

const runFilter = (field: RelationshipField, data: Record<string, unknown>) => {
  const filter = field.filterOptions as ((args: { data: Record<string, unknown> }) => unknown) | undefined
  if (!filter) return undefined
  return filter({ data })
}

const assertCaseScopedFilter = (field: RelationshipField | undefined, label: string) => {
  expect(field, `${label} should exist`).toBeDefined()
  expect(typeof field?.filterOptions).toBe('function')

  if (!field) return
  expect(runFilter(field, {})).toBe(false)
  expect(runFilter(field, { case: 'case-123' })).toEqual(caseScopedExpectedFilter)
}

describe('Case-scoped document filterOptions', () => {
  it('adds filterOptions to DocumentChecklist.document', () => {
    const candidate = getFieldByName(DocumentChecklist.fields as Field[], 'document')
    const field = candidate && candidate.type === 'relationship' ? candidate : undefined
    assertCaseScopedFilter(field, 'DocumentChecklist.document')
  })

  it('adds filterOptions to all NotaryProcess document relationship fields', () => {
    const radicacionEscritos = getNestedField(
      NotaryProcess.fields as Field[],
      'radicacion',
      'escritos',
    )
    const respuestaAutorizacion = getNestedField(
      NotaryProcess.fields as Field[],
      'respuestaNotario',
      'autorizacionEdictos',
    )
    const edictoPdf = getNestedField(NotaryProcess.fields as Field[], 'edictos', 'edictoPDF')
    const comprobantePago = getNestedField(
      NotaryProcess.fields as Field[],
      'edictos',
      'comprobantePago',
    )
    const escrituraPublica = getNestedField(
      NotaryProcess.fields as Field[],
      'firma',
      'escrituraPublica',
    )
    const certificadoTradicion = getNestedField(
      NotaryProcess.fields as Field[],
      'registro',
      'certificadoTradicionActualizado',
    )

    assertCaseScopedFilter(radicacionEscritos, 'NotaryProcess.radicacion.escritos')
    assertCaseScopedFilter(respuestaAutorizacion, 'NotaryProcess.respuestaNotario.autorizacionEdictos')
    assertCaseScopedFilter(edictoPdf, 'NotaryProcess.edictos.edictoPDF')
    assertCaseScopedFilter(comprobantePago, 'NotaryProcess.edictos.comprobantePago')
    assertCaseScopedFilter(escrituraPublica, 'NotaryProcess.firma.escrituraPublica')
    assertCaseScopedFilter(
      certificadoTradicion,
      'NotaryProcess.registro.certificadoTradicionActualizado',
    )
  })
})
