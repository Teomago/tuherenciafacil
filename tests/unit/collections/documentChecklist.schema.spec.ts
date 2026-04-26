import { describe, it, expect } from 'vitest'
import { DocumentChecklist } from '@/payload/collections/succession/DocumentChecklist'

describe('DocumentChecklist Schema', () => {
  it('has the correct slug', () => {
    expect(DocumentChecklist.slug).toBe('document-checklists')
  })

  it('has required case field', () => {
    const field = DocumentChecklist.fields.find(f => (f as any).name === 'case')
    expect(field).toBeDefined()
    expect((field as any).required).toBe(true)
  })

  it('has name field', () => {
    const field = DocumentChecklist.fields.find(f => (f as any).name === 'name')
    expect(field).toBeDefined()
    expect((field as any).required).toBe(true)
  })

  it('has status field with default pending', () => {
    const field = DocumentChecklist.fields.find(f => (f as any).name === 'status')
    expect(field).toBeDefined()
    expect((field as any).defaultValue).toBe('pending')
  })

  it('has required boolean field', () => {
    const field = DocumentChecklist.fields.find(f => (f as any).name === 'required')
    expect(field).toBeDefined()
    expect((field as any).defaultValue).toBe(true)
  })
})
