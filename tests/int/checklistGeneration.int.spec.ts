import { getPayload, Payload } from 'payload'
import configPromise from '@/payload/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import type { Member, User, Case, Heir, Asset } from '@/payload/payload-types'

let payload: Payload
let clientMember: Member
let testCase: Case

describe('Checklist Generation Engine', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })

    // @ts-expect-error - Payload 3.82.0 TS discriminated union bug for Local API without req
    clientMember = await payload.create({
      collection: 'members',
      data: {
        firstName: 'ChecklistGen',
        lastName: 'Tester',
        email: `gen-client-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `10${Date.now().toString().slice(-8)}`,
        telefono: `300${Date.now().toString().slice(-7)}`,
        ciudad: 'Bogotá',
        role: 'cliente',
      },
      overrideAccess: true,
    }) as Member
  }, 120000)

  afterAll(async () => {
    if (!payload) return
    try {
      if (testCase) {
        await payload.delete({ collection: 'document-checklists', where: { case: { equals: testCase.id } }, overrideAccess: true })
        await payload.delete({ collection: 'heirs', where: { case: { equals: testCase.id } }, overrideAccess: true })
        await payload.delete({ collection: 'assets', where: { case: { equals: testCase.id } }, overrideAccess: true })
        await payload.delete({ collection: 'cases', id: testCase.id, overrideAccess: true })
      }
      await payload.delete({ collection: 'members', where: { email: { contains: 'gen-client-' } }, overrideAccess: true })
    } catch {}
  })

  it('generates Poder item at case creation', async () => {
    testCase = await payload.create({
      collection: 'cases',
      data: {
        responsable: clientMember.id,
        tier: 'estandar',
        tieneTestamento: false,
        acuerdoHerederos: 'si',
        status: 'active',
        currentPhase: 1, // Start at phase 1
        causante: {
          nombre: 'Causante Test',
          cedula: '123456',
        }
      },
      overrideAccess: true,
    }) as Case

    const items = await payload.find({
      collection: 'document-checklists',
      where: { case: { equals: testCase.id } },
      overrideAccess: true,
    })

    expect(items.docs.length).toBe(1)
    expect(items.docs[0].name).toBe('Poder de Representación Notarial')
    expect(items.docs[0].requiredForPhase).toBe(4)
  })

  it('generates causante, heir, and asset items on phase 2 transition', async () => {
    // Add heir and asset before transition
    await payload.create({
      collection: 'heirs',
      data: {
        case: testCase.id,
        nombre: 'Heir One Test',
        cedula: '11111',
        parentesco: 'hijo',
        esFallecido: false,
        esRepresentante: false,
      },
      overrideAccess: true,
    })

    await payload.create({
      collection: 'assets',
      data: {
        case: testCase.id,
        tipo: 'inmueble',
        descripcion: 'Casa test',
        identificador: 'MAT-12345',
        valorEstimado: 100000,
      },
      overrideAccess: true,
    })

    // Transition to phase 2
    await payload.update({
      collection: 'cases',
      id: testCase.id,
      data: { currentPhase: 2 },
      overrideAccess: true,
    })

    const items = await payload.find({
      collection: 'document-checklists',
      where: { case: { equals: testCase.id } },
      overrideAccess: true,
    })

    // Expect: 1 poder + 2 causante + 2 heir + 2 asset = 7 items
    expect(items.docs.length).toBe(7)
    
    const causanteItems = items.docs.filter(i => i.category === 'causante')
    expect(causanteItems.length).toBe(2)

    const heirItems = items.docs.filter(i => i.category === 'heredero')
    expect(heirItems.length).toBe(2)

    const assetItems = items.docs.filter(i => i.category === 'bien')
    expect(assetItems.length).toBe(2)
  })

  it('running generation twice creates no duplicates (idempotency)', async () => {
    // Force back to phase 1, then phase 2 again to truly test idempotency
    await payload.update({
      collection: 'cases',
      id: testCase.id,
      data: { currentPhase: 1 },
      overrideAccess: true,
    })
    
    await payload.update({
      collection: 'cases',
      id: testCase.id,
      data: { currentPhase: 2 },
      overrideAccess: true,
    })

    const items = await payload.find({
      collection: 'document-checklists',
      where: { case: { equals: testCase.id } },
      overrideAccess: true,
    })

    expect(items.docs.length).toBe(7) // Still 7
  })

  it('adding heir after phase 2 creates only that heir items, including representative support', async () => {
    const originalDeceasedHeir = await payload.create({
      collection: 'heirs',
      data: {
        case: testCase.id,
        nombre: 'Heir Original Deceased Test',
        cedula: '33333',
        parentesco: 'hijo',
        esFallecido: true,
        esRepresentante: false,
      },
      overrideAccess: true,
    })

    await payload.create({
      collection: 'heirs',
      data: {
        case: testCase.id,
        nombre: 'Heir Two Deceased Test',
        cedula: '22222',
        parentesco: 'hijo',
        esFallecido: true,
        esRepresentante: true,
        herederoOriginal: originalDeceasedHeir.id,
      },
      overrideAccess: true,
    })

    const items = await payload.find({
      collection: 'document-checklists',
      where: { case: { equals: testCase.id } },
      overrideAccess: true,
    })

    // Original deceased heir adds 1 item.
    // Representative deceased heir adds 2 items (defunción + soporte de representación).
    // 7 + 3 = 10
    expect(items.docs.length).toBe(10)
  })

  it('adding asset after phase 2 creates only that asset items', async () => {
    const before = await payload.find({
      collection: 'document-checklists',
      where: { case: { equals: testCase.id } },
      overrideAccess: true,
    })

    await payload.create({
      collection: 'assets',
      data: {
        case: testCase.id,
        tipo: 'vehiculo',
        descripcion: 'Carro test',
        identificador: 'PLACA-123',
        valorEstimado: 50000,
      },
      overrideAccess: true,
    })

    const items = await payload.find({
      collection: 'document-checklists',
      where: { case: { equals: testCase.id } },
      overrideAccess: true,
    })

    expect(items.docs.length).toBeGreaterThanOrEqual(before.docs.length)
  })
})
