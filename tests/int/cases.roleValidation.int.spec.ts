import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { getPayload, Payload } from 'payload'
import configPromise from '@/payload/payload.config'
import type { Member, Case } from '@/payload/payload-types'

let payload: Payload
let client: Member
let lawyer: Member
let inactiveLawyer: Member
let testCase: Case

const expectApiError422 = async (
  action: Promise<unknown>,
  expectedMessage: RegExp,
) => {
  try {
    await action
    throw new Error('Expected APIError 422 but operation succeeded.')
  } catch (error) {
    const err = error as { status?: number; message?: string }
    expect(err.status).toBe(422)
    expect(err.message ?? '').toMatch(expectedMessage)
  }
}

describe('Cases role assignment validation', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })

    client = await payload.create({
      collection: 'members',
      draft: false,
      data: {
        firstName: 'RoleClient',
        lastName: 'Tester',
        email: `role-client-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `10${Date.now().toString().slice(-8)}`,
        telefono: `300${Date.now().toString().slice(-7)}`,
        ciudad: 'Bogotá',
        preferredLocale: 'es',
        role: 'cliente',
      },
      overrideAccess: true,
    })

    lawyer = await payload.create({
      collection: 'members',
      draft: false,
      data: {
        firstName: 'RoleLawyer',
        lastName: 'Tester',
        email: `role-lawyer-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `11${Date.now().toString().slice(-8)}`,
        telefono: `310${Date.now().toString().slice(-7)}`,
        ciudad: 'Bogotá',
        preferredLocale: 'es',
        role: 'abogado',
        isActive: true,
      },
      overrideAccess: true,
    })

    inactiveLawyer = await payload.create({
      collection: 'members',
      draft: false,
      data: {
        firstName: 'RoleInactive',
        lastName: 'Lawyer',
        email: `role-inactive-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `12${Date.now().toString().slice(-8)}`,
        telefono: `320${Date.now().toString().slice(-7)}`,
        ciudad: 'Bogotá',
        preferredLocale: 'es',
        role: 'abogado',
        isActive: false,
      },
      overrideAccess: true,
    })

    testCase = await payload.create({
      collection: 'cases',
      data: {
        responsable: client.id,
        abogadoAsignado: lawyer.id,
        tier: 'estandar',
        tieneTestamento: false,
        acuerdoHerederos: 'si',
        status: 'active',
        currentPhase: 0,
      },
      overrideAccess: true,
    })
  }, 120000)

  afterAll(async () => {
    if (!payload) return
    try {
      await payload.delete({
        collection: 'cases',
        id: testCase.id,
        overrideAccess: true,
      })
      await payload.delete({
        collection: 'members',
        where: { email: { contains: 'role-' } },
        overrideAccess: true,
      })
    } catch {
      // best-effort teardown
    }
  })

  it('rejects assigning responsable to a lawyer', async () => {
    await expectApiError422(
      payload.update({
        collection: 'cases',
        id: testCase.id,
        data: { responsable: lawyer.id },
        overrideAccess: true,
      }),
      /responsable debe ser/i,
    )
  })

  it('rejects assigning abogadoAsignado to a client', async () => {
    await expectApiError422(
      payload.update({
        collection: 'cases',
        id: testCase.id,
        data: { abogadoAsignado: client.id },
        overrideAccess: true,
      }),
      /abogado asignado debe ser un abogado activo/i,
    )
  })

  it('rejects assigning abogadoAsignado to an inactive lawyer', async () => {
    await expectApiError422(
      payload.update({
        collection: 'cases',
        id: testCase.id,
        data: { abogadoAsignado: inactiveLawyer.id },
        overrideAccess: true,
      }),
      /abogado asignado debe ser un abogado activo/i,
    )
  })

  it('allows valid role assignments', async () => {
    const updatedCase = await payload.update({
      collection: 'cases',
      id: testCase.id,
      data: {
        responsable: client.id,
        abogadoAsignado: lawyer.id,
      },
      overrideAccess: true,
    })

    const responsableId =
      typeof updatedCase.responsable === 'object' && updatedCase.responsable
        ? updatedCase.responsable.id
        : updatedCase.responsable
    const abogadoId =
      typeof updatedCase.abogadoAsignado === 'object' && updatedCase.abogadoAsignado
        ? updatedCase.abogadoAsignado.id
        : updatedCase.abogadoAsignado

    expect(responsableId).toBe(client.id)
    expect(abogadoId).toBe(lawyer.id)
  })
})
