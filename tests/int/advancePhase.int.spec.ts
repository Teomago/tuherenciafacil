import { getPayload, Payload } from 'payload'
import configPromise from '@/payload/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { NextRequest } from 'next/server'
import type { Member, User, Case, DocumentChecklist, NotaryProcess } from '@/payload/payload-types'

let payload: Payload
let clientMember: Member
let assignedLawyer: Member
let unassignedLawyer: Member
let staffUser: User
let testCase: Case
let notaryProcess: NotaryProcess
let dummyDocument: any

describe('Advance Phase Integration', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })

    // @ts-expect-error - Payload 3.82.0 TS discriminated union bug for Local API without req
    clientMember = await payload.create({
      collection: 'members',
      data: {
        firstName: 'AdvClient',
        lastName: 'Tester',
        email: `adv-client-${Date.now()}@test.com`,
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
        email: `adv-lawyer1-${Date.now()}@test.com`,
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
        email: `adv-lawyer2-${Date.now()}@test.com`,
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
        email: `adv-admin-${Date.now()}@test.com`,
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
        currentPhase: 3,
        causante: {
          nombre: 'Causante Test',
          cedula: '123456',
        }
      },
      overrideAccess: true,
    }) as Case

    dummyDocument = await payload.create({
      collection: 'documents',
      data: {
        case: testCase.id,
        type: 'escritura',
        uploadedBy: { relationTo: 'members', value: clientMember.id },
      },
      file: {
        data: Buffer.from('%PDF-1.4\\n%âãÏÓ\\n1 0 obj\\n<</Type/Catalog/Pages 2 0 R>>\\nendobj\\n2 0 obj\\n<</Type/Pages/Count 1/Kids[3 0 R]>>\\nendobj\\n3 0 obj\\n<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>\\nendobj\\nxref\\n0 4\\n0000000000 65535 f\\n0000000015 00000 n\\n0000000060 00000 n\\n0000000117 00000 n\\ntrailer\\n<</Size 4/Root 1 0 R>>\\nstartxref\\n190\\n%%EOF'),
        mimetype: 'application/pdf',
        name: 'dummy.pdf',
        size: 219,
      },
      overrideAccess: true,
    })

    notaryProcess = await payload.create({
      collection: 'notary-process',
      data: {
        case: testCase.id,
      },
      overrideAccess: true,
    }) as NotaryProcess

  }, 120000)

  afterAll(async () => {
    if (!payload) return
    try {
      await payload.delete({ collection: 'document-checklists', where: { case: { equals: testCase.id } }, overrideAccess: true })
      await payload.delete({ collection: 'notary-process', where: { case: { equals: testCase.id } }, overrideAccess: true })
      await payload.delete({ collection: 'cases', id: testCase.id, overrideAccess: true })
      await payload.delete({ collection: 'members', where: { email: { contains: 'adv-' } }, overrideAccess: true })
      await payload.delete({ collection: 'users', where: { email: { contains: 'adv-admin-' } }, overrideAccess: true })
    } catch {}
  })

  async function callAdvancePhase(user: any, caseId: string) {
    const endpoints = payload.collections.cases.config.endpoints
    const endpoint = Array.isArray(endpoints) ? endpoints.find((e: any) => e.path === '/:id/advance-phase') : undefined
    if (!endpoint || typeof endpoint.handler !== 'function') throw new Error('Endpoint not found')

    const req = new NextRequest(`http://localhost/api/cases/${caseId}/advance-phase`, { method: 'POST' }) as any
    req.user = user
    req.payload = payload
    req.routeParams = { id: caseId }

    return endpoint.handler(req)
  }

  it('unauthorized client cannot advance', async () => {
    const res = await callAdvancePhase(clientMember, testCase.id)
    expect(res.status).toBe(403)
  })

  it('unassigned lawyer cannot advance', async () => {
    const res = await callAdvancePhase(unassignedLawyer, testCase.id)
    expect(res.status).toBe(403)
  })

  it('phase 3 -> 4 blocked without approved Poder', async () => {
    // There is no approved poder yet
    const res = await callAdvancePhase(assignedLawyer, testCase.id)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/Poder/i)
  })

  it('allows transition after checklist items approved', async () => {
    const lists = await payload.find({
      collection: 'document-checklists',
      where: { case: { equals: testCase.id } },
      overrideAccess: true,
    })
    for (const item of lists.docs) {
      await payload.update({
        collection: 'document-checklists',
        id: item.id,
        data: { status: 'approved' },
        overrideAccess: true,
      })
    }

    const res = await callAdvancePhase(assignedLawyer, testCase.id)
    expect(res.status).toBe(200)
    const updated = await payload.findByID({ collection: 'cases', id: testCase.id, overrideAccess: true })
    expect(updated.currentPhase).toBe(4)
  })

  it('phase 4 -> 5 blocked without notary approval', async () => {
    const res = await callAdvancePhase(assignedLawyer, testCase.id)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/respuesta del notario/i)
  })

  it('allows 4 -> 5 after notary approval', async () => {
    await payload.update({
      collection: 'notary-process',
      id: notaryProcess.id,
      data: { respuestaNotario: { status: 'aprobado' } },
      overrideAccess: true,
    })

    const res = await callAdvancePhase(assignedLawyer, testCase.id)
    expect(res.status).toBe(200)
    const updated = await payload.findByID({ collection: 'cases', id: testCase.id, overrideAccess: true })
    expect(updated.currentPhase).toBe(5)
  })

  it('allows 5 -> 6 -> 7 when conditions met', async () => {
    await payload.update({
      collection: 'notary-process',
      id: notaryProcess.id,
      data: { edictos: { comprobantesEntregados: true } },
      overrideAccess: true,
    })

    await callAdvancePhase(assignedLawyer, testCase.id) // 5 -> 6

    await payload.update({
      collection: 'notary-process',
      id: notaryProcess.id,
      data: { dian: { status: 'aprobado' }, ugpp: { status: 'aprobado' } },
      overrideAccess: true,
    })

    await callAdvancePhase(assignedLawyer, testCase.id) // 6 -> 7

    const updated = await payload.findByID({ collection: 'cases', id: testCase.id, overrideAccess: true })
    expect(updated.currentPhase).toBe(7)
  })

  it('estándar tier completes at signature instead of moving to phase 8', async () => {
    // Reset to phase 7 for this test
    await payload.update({
      collection: 'cases',
      id: testCase.id,
      data: { tier: 'estandar', currentPhase: 7, status: 'active' },
      overrideAccess: true,
    })

    await payload.update({
      collection: 'notary-process',
      id: notaryProcess.id,
      data: { firma: { escrituraPublica: dummyDocument.id } },
      overrideAccess: true,
    })

    const res = await callAdvancePhase(assignedLawyer, testCase.id)
    expect(res.status).toBe(200)
    const updated = await payload.findByID({ collection: 'cases', id: testCase.id, overrideAccess: true })
    expect(updated.currentPhase).toBe(7)
    expect(updated.status).toBe('completed')
  })

  it('premium tier can move to phase 8', async () => {
    await payload.update({
      collection: 'cases',
      id: testCase.id,
      data: { tier: 'premium', currentPhase: 7, status: 'active' },
      overrideAccess: true,
    })

    const res = await callAdvancePhase(assignedLawyer, testCase.id)
    expect(res.status).toBe(200)
    const updated = await payload.findByID({ collection: 'cases', id: testCase.id, overrideAccess: true })
    expect(updated.currentPhase).toBe(8)
  })

  it('allows phase 8 completion', async () => {
    await payload.update({
      collection: 'cases',
      id: testCase.id,
      data: { currentPhase: 8, status: 'active' },
      overrideAccess: true,
    })

    await payload.update({
      collection: 'notary-process',
      id: notaryProcess.id,
      data: { registro: { status: 'registrado' } },
      overrideAccess: true,
    })

    const res = await callAdvancePhase(assignedLawyer, testCase.id)
    expect(res.status).toBe(200)
    const updated = await payload.findByID({ collection: 'cases', id: testCase.id, overrideAccess: true })
    expect(updated.currentPhase).toBe(8)
    expect(updated.status).toBe('completed')
  })

  it('direct currentPhase updates apply the same validation (hook protection)', async () => {
    // Reset to phase 7 for this test
    await payload.update({
      collection: 'cases',
      id: testCase.id,
      data: { currentPhase: 7, tier: 'premium', status: 'active' },
      overrideAccess: true,
    })

    // Clear escritura publica so 7 -> 8 should fail
    await payload.update({
      collection: 'notary-process',
      id: notaryProcess.id,
      data: { firma: { escrituraPublica: null } },
      overrideAccess: true,
    })

    // Attempting a direct phase jump should still enforce phase-gate checks.
    await expect(
      payload.update({
        collection: 'cases',
        id: testCase.id,
        data: { currentPhase: 8 },
        user: staffUser,
        overrideAccess: false,
      })
    ).rejects.toThrow(/escritura pública/i)
  })
})
