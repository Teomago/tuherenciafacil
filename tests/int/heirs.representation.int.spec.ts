import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { getPayload, Payload } from 'payload'
import configPromise from '@/payload/payload.config'
import type { Case, Member, Heir } from '@/payload/payload-types'

let payload: Payload
let client: Member
let lawyer: Member
let caseA: Case
let caseB: Case
let deceasedHeir: Heir
let livingHeir: Heir
let otherCaseDeceasedHeir: Heir

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

describe('Heirs representation validation', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })

    client = await payload.create({
      collection: 'members',
      draft: false,
      data: {
        firstName: 'HeirClient',
        lastName: 'Tester',
        email: `heir-client-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `20${Date.now().toString().slice(-8)}`,
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
        firstName: 'HeirLawyer',
        lastName: 'Tester',
        email: `heir-lawyer-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `21${Date.now().toString().slice(-8)}`,
        telefono: `310${Date.now().toString().slice(-7)}`,
        ciudad: 'Bogotá',
        preferredLocale: 'es',
        role: 'abogado',
        isActive: true,
      },
      overrideAccess: true,
    })

    caseA = await payload.create({
      collection: 'cases',
      data: {
        responsable: client.id,
        abogadoAsignado: lawyer.id,
        tier: 'estandar',
        tieneTestamento: false,
        acuerdoHerederos: 'si',
        status: 'active',
      },
      overrideAccess: true,
    })

    caseB = await payload.create({
      collection: 'cases',
      data: {
        responsable: client.id,
        abogadoAsignado: lawyer.id,
        tier: 'estandar',
        tieneTestamento: false,
        acuerdoHerederos: 'si',
        status: 'active',
      },
      overrideAccess: true,
    })

    deceasedHeir = await payload.create({
      collection: 'heirs',
      data: {
        case: caseA.id,
        nombre: 'Fallecido A',
        cedula: `30${Date.now().toString().slice(-8)}`,
        parentesco: 'hijo',
        esFallecido: true,
      },
      overrideAccess: true,
    })

    livingHeir = await payload.create({
      collection: 'heirs',
      data: {
        case: caseA.id,
        nombre: 'Vivo A',
        cedula: `31${Date.now().toString().slice(-8)}`,
        parentesco: 'hijo',
        esFallecido: false,
      },
      overrideAccess: true,
    })

    otherCaseDeceasedHeir = await payload.create({
      collection: 'heirs',
      data: {
        case: caseB.id,
        nombre: 'Fallecido B',
        cedula: `32${Date.now().toString().slice(-8)}`,
        parentesco: 'hijo',
        esFallecido: true,
      },
      overrideAccess: true,
    })
  }, 120000)

  afterAll(async () => {
    if (!payload) return
    try {
      await payload.delete({
        collection: 'heirs',
        where: {
          or: [
            { nombre: { equals: 'Fallecido A' } },
            { nombre: { equals: 'Vivo A' } },
            { nombre: { equals: 'Fallecido B' } },
            { nombre: { contains: 'Representante' } },
          ],
        },
        overrideAccess: true,
      })
      await payload.delete({
        collection: 'cases',
        where: {
          or: [{ id: { equals: caseA.id } }, { id: { equals: caseB.id } }],
        },
        overrideAccess: true,
      })
      await payload.delete({
        collection: 'members',
        where: { email: { contains: 'heir-' } },
        overrideAccess: true,
      })
    } catch {
      // best-effort teardown
    }
  })

  it('rejects representative heir without herederoOriginal', async () => {
    await expectApiError422(
      payload.create({
        collection: 'heirs',
        data: {
          case: caseA.id,
          nombre: 'Representante sin original',
          cedula: `40${Date.now().toString().slice(-8)}`,
          parentesco: 'hijo',
          esRepresentante: true,
        },
        overrideAccess: true,
      }),
      /debe tener vinculado/i,
    )
  })

  it('rejects representative heir linked to a living heir', async () => {
    await expectApiError422(
      payload.create({
        collection: 'heirs',
        data: {
          case: caseA.id,
          nombre: 'Representante sobre vivo',
          cedula: `41${Date.now().toString().slice(-8)}`,
          parentesco: 'hijo',
          esRepresentante: true,
          herederoOriginal: livingHeir.id,
        },
        overrideAccess: true,
      }),
      /debe estar marcado como fallecido/i,
    )
  })

  it('rejects representative heir linked to a different case', async () => {
    await expectApiError422(
      payload.create({
        collection: 'heirs',
        data: {
          case: caseA.id,
          nombre: 'Representante otra caso',
          cedula: `42${Date.now().toString().slice(-8)}`,
          parentesco: 'hijo',
          esRepresentante: true,
          herederoOriginal: otherCaseDeceasedHeir.id,
        },
        overrideAccess: true,
      }),
      /mismo caso/i,
    )
  })

  it('allows valid representative heir (same case and deceased original)', async () => {
    const representative = await payload.create({
      collection: 'heirs',
      data: {
        case: caseA.id,
        nombre: 'Representante válido',
        cedula: `43${Date.now().toString().slice(-8)}`,
        parentesco: 'hijo',
        esRepresentante: true,
        herederoOriginal: deceasedHeir.id,
      },
      overrideAccess: true,
    })

    expect(representative.id).toBeDefined()
  })

  it('allows creating non-representative heirs without herederoOriginal', async () => {
    const heir = await payload.create({
      collection: 'heirs',
      data: {
        case: caseA.id,
        nombre: 'No representante',
        cedula: `44${Date.now().toString().slice(-8)}`,
        parentesco: 'hijo',
        esRepresentante: false,
      },
      overrideAccess: true,
    })

    expect(heir.id).toBeDefined()
  })
})
