import { describe, it, expect } from 'vitest'
import { NotaryProcess } from '@/payload/collections/succession/NotaryProcess'
import type { GroupField } from 'payload'

describe('NotaryProcess Schema', () => {
  it('has the correct slug', () => {
    expect(NotaryProcess.slug).toBe('notary-process')
  })

  it('has required case field', () => {
    const field = NotaryProcess.fields.find(f => (f as any).name === 'case')
    expect(field).toBeDefined()
    expect((field as any).required).toBe(true)
    expect((field as any).unique).toBe(true)
  })

  it('contains radicacion group', () => {
    const group = NotaryProcess.fields.find(f => (f as any).name === 'radicacion') as GroupField
    expect(group).toBeDefined()
    expect(group.type).toBe('group')
    expect(group.fields.find(f => (f as any).name === 'fecha')).toBeDefined()
    expect(group.fields.find(f => (f as any).name === 'numero')).toBeDefined()
    expect(group.fields.find(f => (f as any).name === 'escritos')).toBeDefined()
  })

  it('contains respuestaNotario group', () => {
    const group = NotaryProcess.fields.find(f => (f as any).name === 'respuestaNotario') as GroupField
    expect(group).toBeDefined()
    expect(group.type).toBe('group')
    expect(group.fields.find(f => (f as any).name === 'status')).toBeDefined()
    expect(group.fields.find(f => (f as any).name === 'detalle')).toBeDefined()
    expect(group.fields.find(f => (f as any).name === 'fecha')).toBeDefined()
    expect(group.fields.find(f => (f as any).name === 'autorizacionEdictos')).toBeDefined()
  })

  it('contains edictos group', () => {
    const group = NotaryProcess.fields.find(f => (f as any).name === 'edictos') as GroupField
    expect(group).toBeDefined()
  })

  it('contains dian group', () => {
    const group = NotaryProcess.fields.find(f => (f as any).name === 'dian') as GroupField
    expect(group).toBeDefined()
  })

  it('contains ugpp group', () => {
    const group = NotaryProcess.fields.find(f => (f as any).name === 'ugpp') as GroupField
    expect(group).toBeDefined()
  })

  it('contains firma group', () => {
    const group = NotaryProcess.fields.find(f => (f as any).name === 'firma') as GroupField
    expect(group).toBeDefined()
  })

  it('contains costosNotariales group', () => {
    const group = NotaryProcess.fields.find(f => (f as any).name === 'costosNotariales') as GroupField
    expect(group).toBeDefined()
  })

  it('contains registro group', () => {
    const group = NotaryProcess.fields.find(f => (f as any).name === 'registro') as GroupField
    expect(group).toBeDefined()
  })
})
