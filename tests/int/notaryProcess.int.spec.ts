import { getPayload, Payload } from 'payload'
import configPromise from '@/payload/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import type { Member, User, Case } from '@/payload/payload-types'

let payload: Payload
let clientMember: Member
let assignedLawyer: Member
let unassignedLawyer: Member
let staffUser: User
let testCase: Case
let secondCase: Case

describe('NotaryProcess Integration', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })

    // @ts-expect-error - Payload 3.82.0 TS discriminated union bug for Local API without req
    clientMember = await payload.create({
      collection: 'members',
      data: {
        firstName: 'NotaryClient',
        lastName: 'Tester',
        email: `notary-client-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `10${Date.now().toString().slice(-8)}`,
        telefono: `300${Date.now().toString().slice(-7)}`,
        ciudad: 'Bogotá',
        role: 'cliente',
      },
      overrideAccess: true,
    }) as Member

    // @ts-expect-error - Payload 3.82.0 TS discriminated union bug for Local API without req
    assignedLawyer = await payload.create({
      collection: 'members',
      data: {
        firstName: 'Assigned',
        lastName: 'Lawyer',
        email: `notary-lawyer1-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `11${Date.now().toString().slice(-8)}`,
        telefono: `310${Date.now().toString().slice(-7)}`,
        ciudad: 'Bogotá',
        role: 'abogado',
        isActive: true,
      },
      overrideAccess: true,
    }) as Member

    // @ts-expect-error - Payload 3.82.0 TS discriminated union bug for Local API without req
    unassignedLawyer = await payload.create({
      collection: 'members',
      data: {
        firstName: 'Unassigned',
        lastName: 'Lawyer',
        email: `notary-lawyer2-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `12${Date.now().toString().slice(-8)}`,
        telefono: `320${Date.now().toString().slice(-7)}`,
        ciudad: 'Bogotá',
        role: 'abogado',
        isActive: true,
      },
      overrideAccess: true,
    }) as Member

    staffUser = await payload.create({
      collection: 'users',
      data: {
        email: `notary-admin-${Date.now()}@test.com`,
        password: 'password1234',
        roles: ['admin']
      },
      overrideAccess: true,
    }) as User

    testCase = await payload.create({
      collection: 'cases',
      data: {
        responsable: clientMember.id,
        abogadoAsignado: assignedLawyer.id,
        tier: 'estandar',
        tieneTestamento: false,
        acuerdoHerederos: 'si',
        status: 'active',
        currentPhase: 1,
        causante: {
          nombre: 'Causante Test',
          cedula: '123456',
        }
      },
      overrideAccess: true,
    }) as Case

    secondCase = await payload.create({
      collection: 'cases',
      data: {
        responsable: clientMember.id,
        abogadoAsignado: unassignedLawyer.id,
        tier: 'estandar',
        tieneTestamento: false,
        acuerdoHerederos: 'si',
        status: 'active',
        currentPhase: 1,
        causante: {
          nombre: 'Causante Two',
          cedula: '654321',
        }
      },
      overrideAccess: true,
    }) as Case
  }, 240000)

  afterAll(async () => {
    if (!payload) return
    try {
      await payload.delete({ collection: 'notary-process', where: { case: { in: [testCase.id, secondCase.id] } }, overrideAccess: true })
      await payload.delete({ collection: 'cases', where: { id: { in: [testCase.id, secondCase.id] } }, overrideAccess: true })
      await payload.delete({ collection: 'members', where: { email: { contains: 'notary-' } }, overrideAccess: true })
      await payload.delete({ collection: 'users', where: { email: { contains: 'notary-admin-' } }, overrideAccess: true })
    } catch {}
  })

  it('collection exists and lawyer can create process for their case', async () => {
    const process = await payload.create({
      collection: 'notary-process',
      data: {
        case: testCase.id,
      },
      user: assignedLawyer,
      overrideAccess: false,
    })

    expect(process.id).toBeDefined()
    expect(typeof process.case === 'object' ? process.case?.id : process.case).toBe(testCase.id)
  })

  it('enforces unique one-to-one constraint on case field', async () => {
    await expect(
      payload.create({
        collection: 'notary-process',
        data: {
          case: testCase.id,
        },
        user: staffUser,
        overrideAccess: true,
      })
    ).rejects.toThrow(/invalid/i)
  })

  it('denies client from reading raw notary process', async () => {
    await expect(
      payload.find({
        collection: 'notary-process',
        where: { case: { equals: testCase.id } },
        user: clientMember,
        overrideAccess: false,
      })
    ).rejects.toThrow(/allowed/)
  })

  it('denies unassigned lawyer from reading the notary process', async () => {
    const res = await payload.find({
      collection: 'notary-process',
      where: { case: { equals: testCase.id } },
      user: unassignedLawyer,
      overrideAccess: false,
    })
    expect(res.docs.length).toBe(0)
  })
})
