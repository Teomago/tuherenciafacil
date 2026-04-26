import { describe, it, expect, vi } from 'vitest'
import { validatePhaseTransition } from '@/payload/collections/succession/Cases/utils/validatePhaseTransition'

describe('validatePhaseTransition', () => {
  it('allows generic transitions not covered by strict rules', async () => {
    const result = await validatePhaseTransition(1, 2, { req: {} } as any)
    expect(result).toBe(true)
  })

  it('blocks 3 -> 4 if checklist not fully approved', async () => {
    const mockFind = vi.fn().mockResolvedValue({
      docs: [{ status: 'pending', required: true }] // Mock unapproved item
    })
    const result = await validatePhaseTransition(3, 4, {
      req: { payload: { find: mockFind } },
      doc: { id: 'case-1' }
    } as any)
    expect(result).toBe('Todos los documentos obligatorios (incluyendo el Poder) deben estar aprobados antes de avanzar a la Fase 4.')
  })

  it('allows 3 -> 4 if checklist is fully approved', async () => {
    const mockFind = vi.fn().mockResolvedValue({
      docs: [{ status: 'approved', documentType: 'poder' }] // All items approved, including poder
    })
    const req = { payload: { find: mockFind } }

    const result = await validatePhaseTransition(3, 4, { req, doc: { id: 'case-1' } } as any)
    expect(result).toBe(true)
  })

  it('blocks 3 -> 4 if Poder is missing entirely', async () => {
    const mockFind = vi.fn().mockResolvedValue({ docs: [] })
    const mockFindPoder = vi.fn().mockResolvedValue({ docs: [] })
    const req = { payload: { find: vi.fn().mockImplementation(async (args) => {
      if (args.where?.documentType?.equals === 'poder') return mockFindPoder()
      return mockFind()
    }) } }

    const result = await validatePhaseTransition(3, 4, { req, doc: { id: 'case-1' } } as any)
    expect(result).toBe('El Poder de Representación Notarial debe estar cargado y aprobado antes de radicar en notaría.')
  })

  it('blocks 4 -> 5 without notary approval', async () => {
    const mockFind = vi.fn().mockResolvedValue({
      docs: [{ respuestaNotario: { status: 'pendiente' } }]
    })
    const result = await validatePhaseTransition(4, 5, {
      req: { payload: { find: mockFind } },
      doc: { id: 'case-1' }
    } as any)
    expect(result).toBe('La respuesta del notario debe estar aprobada para avanzar a la Fase 5.')
  })

  it('blocks 5 -> 6 without edictos delivered', async () => {
    const mockFind = vi.fn().mockResolvedValue({
      docs: [{ edictos: { comprobantesEntregados: false } }]
    })
    const result = await validatePhaseTransition(5, 6, {
      req: { payload: { find: mockFind } },
      doc: { id: 'case-1' }
    } as any)
    expect(result).toBe('Los comprobantes de edictos deben estar entregados para avanzar a la Fase 6.')
  })

  it('blocks 6 -> 7 without DIAN/UGPP approved', async () => {
    const mockFind = vi.fn().mockResolvedValue({
      docs: [{ dian: { status: 'pendiente' }, ugpp: { status: 'aprobado' } }]
    })
    const result = await validatePhaseTransition(6, 7, {
      req: { payload: { find: mockFind } },
      doc: { id: 'case-1' }
    } as any)
    expect(result).toBe('Los estados de DIAN y UGPP deben estar aprobados para avanzar a la Fase 7.')
  })

  it('blocks 7 -> 8 without escritura publica', async () => {
    const mockFind = vi.fn().mockResolvedValue({
      docs: [{ firma: {} }]
    })
    const result = await validatePhaseTransition(7, 8, {
      req: { payload: { find: mockFind } },
      doc: { id: 'case-1', tier: 'premium' }
    } as any)
    expect(result).toBe('La escritura pública debe estar cargada para avanzar a la Fase 8.')
  })

  it('allows 7 -> 8 if escritura publica exists (tier check is done by caller)', async () => {
    const mockFind = vi.fn().mockResolvedValue({
      docs: [{ firma: { escrituraPublica: 'doc-1' } }]
    })
    const result = await validatePhaseTransition(7, 8, {
      req: { payload: { find: mockFind } },
      doc: { id: 'case-1', tier: 'estandar' }
    } as any)
    expect(result).toBe(true)
  })

  it('blocks phase 8 completion without registro status', async () => {
    const mockFind = vi.fn().mockResolvedValue({
      docs: [{ registro: { status: 'pendiente' } }]
    })
    const result = await validatePhaseTransition(8, 8, {
      req: { payload: { find: mockFind } },
      doc: { id: 'case-1' },
      completing: true,
    } as any)
    expect(result).toBe('El registro debe estar en estado "Registrado" para completar el proceso.')
  })

  it('allows phase 8 completion if registered', async () => {
    const mockFind = vi.fn().mockResolvedValue({
      docs: [{ registro: { status: 'registrado' } }]
    })
    const result = await validatePhaseTransition(8, 8, {
      req: { payload: { find: mockFind } },
      doc: { id: 'case-1' },
      completing: true,
    } as any)
    expect(result).toBe(true)
  })
})
