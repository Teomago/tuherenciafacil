import { getPayload, Payload } from 'payload'
import config from '@/payload/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import type { Member } from '@/payload/payload-types'

let payload: Payload
let testMember: Member

describe('Appointments — creditoAcumulado hook', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // Warm up the appointments collection to trigger any lazy initialization
    await (payload.find as any)({ collection: 'appointments', limit: 0, overrideAccess: true })

    testMember = await payload.create({
      collection: 'members',
      data: {
        firstName: 'Hook',
        lastName: 'Tester',
        email: `appt-hook-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `${Date.now()}`.substring(3, 13),
        telefono: '3009876543',
        ciudad: 'Medellín',
        role: 'cliente',
        creditoAcumulado: 0,
      },
      overrideAccess: true,
    })
  })

  afterAll(async () => {
    await payload.delete({
      collection: 'appointments',
      where: { id: { exists: true } },
      overrideAccess: true,
    })
    await payload.delete({
      collection: 'members',
      where: { email: { contains: '@test.com' } },
      overrideAccess: true,
    })
  })

  it('adds monto to creditoAcumulado when autorizarCredito is set to true and status is realizada', async () => {
    const appt = await payload.create({
      collection: 'appointments',
      data: {
        member: testMember.id,
        tipo: 'consulta_virtual',
        monto: 500000,
        status: 'pendiente_pago',
        autorizarCredito: false,
        creditoApplied: false,
      },
      overrideAccess: true,
    } as any)

    await payload.update({
      collection: 'appointments',
      id: appt.id,
      data: { status: 'realizada' },
      overrideAccess: true,
    } as any)

    await payload.update({
      collection: 'appointments',
      id: appt.id,
      data: { autorizarCredito: true },
      overrideAccess: true,
    } as any)

    const updatedMember = await payload.findByID({
      collection: 'members',
      id: testMember.id,
      overrideAccess: true,
    })

    expect(updatedMember.creditoAcumulado).toBe(500000)

    const updatedAppt = await payload.findByID({
      collection: 'appointments',
      id: appt.id,
      overrideAccess: true,
    } as any)
    expect(updatedAppt.creditoApplied).toBe(true)
  })

  it('does NOT add credit again on a second save (idempotency)', async () => {
    const before = await payload.findByID({
      collection: 'members',
      id: testMember.id,
      overrideAccess: true,
    })
    const balanceBefore = before.creditoAcumulado

    const appts = await payload.find({
      collection: 'appointments',
      where: { member: { equals: testMember.id } },
      overrideAccess: true,
    } as any)
    const appt = appts.docs[0]

    await payload.update({
      collection: 'appointments',
      id: appt.id,
      data: { tipo: 'consulta_presencial' },
      overrideAccess: true,
    } as any)

    const after = await payload.findByID({
      collection: 'members',
      id: testMember.id,
      overrideAccess: true,
    })
    expect(after.creditoAcumulado).toBe(balanceBefore)
  })

  it('subtracts monto when autorizarCredito is revoked and credit was applied', async () => {
    const appts = await payload.find({
      collection: 'appointments',
      where: { member: { equals: testMember.id } },
      overrideAccess: true,
    } as any)
    const appt = appts.docs[0]

    const before = await payload.findByID({
      collection: 'members',
      id: testMember.id,
      overrideAccess: true,
    })

    await payload.update({
      collection: 'appointments',
      id: appt.id,
      data: { autorizarCredito: false },
      overrideAccess: true,
    } as any)

    const after = await payload.findByID({
      collection: 'members',
      id: testMember.id,
      overrideAccess: true,
    })
    expect(after.creditoAcumulado).toBe(before.creditoAcumulado - 500000)
  })

  it('does NOT subtract credit below zero — balance stays >= 0', async () => {
    const poorMember = await payload.create({
      collection: 'members',
      data: {
        firstName: 'Poor',
        lastName: 'Tester',
        email: `poor-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `${Date.now()}`.substring(3, 13),
        telefono: '3001111111',
        ciudad: 'Cali',
        creditoAcumulado: 0,
      },
      overrideAccess: true,
    })

    const appt = await payload.create({
      collection: 'appointments',
      data: {
        member: poorMember.id,
        tipo: 'consulta_virtual',
        monto: 1000000,
        status: 'realizada',
        autorizarCredito: false,
        creditoApplied: false,
      },
      overrideAccess: true,
    } as any)

    await payload.update({
      collection: 'appointments',
      id: appt.id,
      data: { autorizarCredito: true },
      overrideAccess: true,
    } as any)

    await payload.update({
      collection: 'members',
      id: poorMember.id,
      data: { creditoAcumulado: 0 },
      overrideAccess: true,
      context: { skipHooks: true },
    })

    await expect(
      payload.update({
        collection: 'appointments',
        id: appt.id,
        data: { autorizarCredito: false },
        overrideAccess: true,
      } as any),
    ).resolves.toBeDefined()

    const m = await payload.findByID({
      collection: 'members',
      id: poorMember.id,
      overrideAccess: true,
    })
    expect(m.creditoAcumulado).toBeGreaterThanOrEqual(0)
  })
})
