import { getPayload, Payload } from 'payload'
import configPromise from '@/payload/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import type { Member, User, Case } from '@/payload/payload-types'

let payload: Payload
let clientMember: Member
let assignedLawyer: Member
let staffUser: User
let testCase: Case

describe('DocumentChecklist Integration', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })

    // @ts-expect-error - Payload 3.82.0 TS discriminated union bug for Local API without req
    clientMember = await payload.create({
      collection: 'members',
      data: {
        firstName: 'CheckClient',
        lastName: 'Tester',
        email: `check-client-${Date.now()}@test.com`,
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
        firstName: 'CheckLawyer',
        lastName: 'Lawyer',
        email: `check-lawyer-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `11${Date.now().toString().slice(-8)}`,
        telefono: `310${Date.now().toString().slice(-7)}`,
        ciudad: 'Bogotá',
        role: 'abogado',
        isActive: true,
      },
      overrideAccess: true,
    }) as Member

    staffUser = await payload.create({
      collection: 'users',
      data: {
        email: `check-admin-${Date.now()}@test.com`,
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
  }, 120000)

  afterAll(async () => {
    if (!payload) return
    try {
      await payload.delete({ collection: 'document-checklists', where: { case: { equals: testCase.id } }, overrideAccess: true })
      await payload.delete({ collection: 'cases', id: testCase.id, overrideAccess: true })
      await payload.delete({ collection: 'members', where: { email: { contains: 'check-' } }, overrideAccess: true })
      await payload.delete({ collection: 'users', where: { email: { contains: 'check-admin-' } }, overrideAccess: true })
    } catch {}
  })

  it('allows lawyer to create manual required item', async () => {
    const item = await payload.create({
      collection: 'document-checklists',
      data: {
        case: testCase.id,
        name: 'Manual Required Document',
        documentType: 'otro',
        category: 'custom',
        source: 'manual',
        required: true,
        status: 'pending',
      },
      user: assignedLawyer,
      overrideAccess: false,
    })

    expect(item.id).toBeDefined()
    expect(item.required).toBe(true)
    expect(item.source).toBe('manual')
  })

  it('allows lawyer to create manual optional item', async () => {
    const item = await payload.create({
      collection: 'document-checklists',
      data: {
        case: testCase.id,
        name: 'Manual Optional Document',
        documentType: 'otro',
        category: 'custom',
        source: 'manual',
        required: false,
        status: 'pending',
      },
      user: assignedLawyer,
      overrideAccess: false,
    })

    expect(item.id).toBeDefined()
    expect(item.required).toBe(false)
    expect(item.source).toBe('manual')
  })

  it('denies client from creating checklist item', async () => {
    await expect(
      payload.create({
        collection: 'document-checklists',
        data: {
          case: testCase.id,
          name: 'Client Document',
          documentType: 'otro',
          category: 'custom',
          source: 'manual',
        },
        user: clientMember,
        overrideAccess: false,
      })
    ).rejects.toThrow(/not allowed/)
  })

  it('denies client from updating checklist item', async () => {
    const items = await payload.find({
      collection: 'document-checklists',
      where: { case: { equals: testCase.id } },
      overrideAccess: true,
    })

    await expect(
      payload.update({
        collection: 'document-checklists',
        id: items.docs[0].id,
        data: {
          status: 'approved',
        },
        user: clientMember,
        overrideAccess: false,
      })
    ).rejects.toThrow(/not allowed/)
  })
})
