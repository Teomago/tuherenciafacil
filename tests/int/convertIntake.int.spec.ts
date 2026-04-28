import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { getPayload, Payload } from 'payload'
import configPromise from '@/payload/payload.config'
import { convertIntakeHandler } from '@/payload/endpoints/convertIntake'
import type { Member, CaseIntake, Case } from '@/payload/payload-types'

let payload: Payload
let lawyer: Member
let member: Member
let intakeWithWill: CaseIntake
let intakeWithoutWill: CaseIntake
let createdCaseIdFromSuccessPath: string | null = null

const buildRequest = (intakeId: string) =>
  ({
    payload,
    user: lawyer,
    json: async () => ({ intakeId }),
    routeParams: {},
    query: {},
    payloadAPI: 'REST',
  }) as Parameters<typeof convertIntakeHandler>[0]

describe('convert-intake endpoint', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })

    member = await payload.create({
      collection: 'members',
      draft: false,
      data: {
        firstName: 'ConvertMember',
        lastName: 'Tester',
        email: `convert-member-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `50${Date.now().toString().slice(-8)}`,
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
        firstName: 'ConvertLawyer',
        lastName: 'Tester',
        email: `convert-lawyer-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `51${Date.now().toString().slice(-8)}`,
        telefono: `310${Date.now().toString().slice(-7)}`,
        ciudad: 'Bogotá',
        preferredLocale: 'es',
        role: 'abogado',
        isActive: true,
      },
      overrideAccess: true,
    })

    intakeWithWill = await payload.create({
      collection: 'case-intakes',
      data: {
        member: member.id,
        status: 'submitted',
        tierElegido: 'estandar',
        tieneTestamento: true,
        acuerdoHerederos: 'si',
        causanteNombre: 'Causante Con Testamento',
        causanteCedula: '123123123',
        causanteFechaFallecimiento: '2020-01-01T00:00:00.000Z',
        causanteCiudadFallecimiento: 'Bogotá',
        herederosEstimados: 1,
      },
      overrideAccess: true,
    })

    intakeWithoutWill = await payload.create({
      collection: 'case-intakes',
      data: {
        member: member.id,
        status: 'submitted',
        tierElegido: 'estandar',
        tieneTestamento: false,
        acuerdoHerederos: 'si',
        causanteNombre: 'Causante Sin Testamento',
        causanteCedula: '456456456',
        causanteFechaFallecimiento: '2020-01-01T00:00:00.000Z',
        causanteCiudadFallecimiento: 'Bogotá',
        herederosEstimados: 2,
      },
      overrideAccess: true,
    })
  }, 120000)

  afterAll(async () => {
    if (!payload) return
    try {
      if (createdCaseIdFromSuccessPath) {
        await payload.delete({
          collection: 'cases',
          id: createdCaseIdFromSuccessPath,
          overrideAccess: true,
        })
      }
      await payload.delete({
        collection: 'case-intakes',
        where: { id: { in: [intakeWithWill.id, intakeWithoutWill.id] } },
        overrideAccess: true,
      })
      await payload.delete({
        collection: 'members',
        where: { email: { contains: 'convert-' } },
        overrideAccess: true,
      })
    } catch {
      // best-effort teardown
    }
  })

  it('returns 422 when intake has tieneTestamento=true', async () => {
    const response = await convertIntakeHandler(buildRequest(intakeWithWill.id))
    expect(response.status).toBe(422)

    const body = (await response.json()) as { error?: string }
    expect(body.error ?? '').toMatch(/sucesiones testadas/i)
  })

  it('converts intake when tieneTestamento=false', async () => {
    const response = await convertIntakeHandler(buildRequest(intakeWithoutWill.id))
    expect(response.status).toBe(200)

    const body = (await response.json()) as { caseId?: string; success?: boolean }
    expect(body.success).toBe(true)
    expect(typeof body.caseId).toBe('string')
    createdCaseIdFromSuccessPath = body.caseId ?? null

    const updatedIntake = await payload.findByID({
      collection: 'case-intakes',
      id: intakeWithoutWill.id,
      overrideAccess: true,
    })
    const linkedCaseId =
      typeof updatedIntake.case === 'object' && updatedIntake.case
        ? updatedIntake.case.id
        : updatedIntake.case
    expect(updatedIntake.status).toBe('paid')
    expect(linkedCaseId).toBe(body.caseId)

    const createdCase = await payload.findByID({
      collection: 'cases',
      id: body.caseId as string,
      overrideAccess: true,
    })
    expect(createdCase.tieneTestamento).toBe(false)
  })
})
