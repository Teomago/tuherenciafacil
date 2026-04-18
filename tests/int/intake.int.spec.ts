import { getPayload, Payload } from 'payload'
import config from '@/payload/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import type { Member, CaseIntake, Case } from '@/payload/payload-types'

let payload: Payload
let testMember: Member
let adminUser: any
let createdIntake: CaseIntake

describe('CaseIntake & Conversion', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // @ts-expect-error - Payload 3.82.0 TS discriminated union bug for Local API without req

    testMember = await payload.create({
      collection: 'members',
      data: {
        firstName: 'Intake',
        lastName: 'Tester',
        email: `intake-test-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `10${Date.now().toString().slice(-8)}`,
        telefono: `300${Date.now().toString().slice(-7)}`,
        ciudad: 'Bogotá',
        role: 'cliente',
      },
      overrideAccess: true,
    })


    adminUser = await payload.create({
      collection: 'users',
      data: {
        email: `admin-${Date.now()}@test.com`,
        password: 'password1234',
      },
      overrideAccess: true,
    })
  }, 120000)

  afterAll(async () => {
    if (!payload) return
    try {
      await payload.delete({
        collection: 'members',
        where: { email: { contains: 'intake-test-' } },
        overrideAccess: true,
      })
      await payload.delete({
        collection: 'users',
        where: { email: { contains: 'admin-' } },
        overrideAccess: true,
      })
    } catch {
      // best-effort teardown
    }
  })

  it('allows creating a draft intake without tierElegido', async () => {
    createdIntake = await payload.create({
      collection: 'case-intakes',
      data: {
        member: testMember.id,
        status: 'draft',
        acuerdoHerederos: 'si',
        causanteNombre: 'Juan Perez',
        causanteCedula: '987654321',
        causanteFechaFallecimiento: '2025-01-01T00:00:00.000Z',
        causanteCiudadFallecimiento: 'Medellín',
        herederosEstimados: 3,
        // tierElegido omitted
      },
      overrideAccess: true,
    })

    expect(createdIntake.id).toBeDefined()
    expect(createdIntake.status).toBe('draft')
    expect(createdIntake.tierElegido).toBeNull()
  })

  it('prevents changing status to submitted if tierElegido is missing', async () => {
    await expect(
      payload.update({
        collection: 'case-intakes',
        id: createdIntake.id,
        data: {
          status: 'submitted',
        },
        overrideAccess: true,
      })
    ).rejects.toThrow(/El tierElegido es requerido para enviar el intake/)
  })

  it('allows changing status to submitted if tierElegido is present', async () => {
    const updatedIntake = await payload.update({
      collection: 'case-intakes',
      id: createdIntake.id,
      data: {
        status: 'submitted',
        tierElegido: 'estandar',
      },
      overrideAccess: true,
    })

    expect(updatedIntake.status).toBe('submitted')
    expect(updatedIntake.tierElegido).toBe('estandar')
  })

  // We skip testing the actual REST endpoint via fetch here, and instead test the logic 
  // that would be triggered. To test the handler directly, we'd need a mock Request object, 
  // or we can test the expected DB states after a simulated conversion.
})
