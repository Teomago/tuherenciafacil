import { getPayload, Payload } from 'payload'
import configPromise from '@/payload/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { NextRequest } from 'next/server'
import type { Member, User, Case } from '@/payload/payload-types'

let payload: Payload
let clientMember: Member
let assignedLawyer: Member
let unassignedLawyer: Member
let staffUser: User
let testCase: Case
let testDocument: any

describe('Documents Integration', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })

    // @ts-expect-error - Payload 3.82.0 TS discriminated union bug for Local API without req
    clientMember = await payload.create({
      collection: 'members',
      data: {
        firstName: 'DocClient',
        lastName: 'Tester',
        email: `doc-client-${Date.now()}@test.com`,
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
        email: `doc-lawyer1-${Date.now()}@test.com`,
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
        email: `doc-lawyer2-${Date.now()}@test.com`,
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
        email: `doc-admin-${Date.now()}@test.com`,
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
      await payload.delete({ collection: 'documents', where: { case: { equals: testCase.id } }, overrideAccess: true })
      await payload.delete({ collection: 'cases', id: testCase.id, overrideAccess: true })
      await payload.delete({ collection: 'members', where: { email: { contains: 'doc-' } }, overrideAccess: true })
      await payload.delete({ collection: 'users', where: { email: { contains: 'doc-admin-' } }, overrideAccess: true })
    } catch {}
  })

  it('allows client to upload a document to their case', async () => {
    testDocument = await payload.create({
      collection: 'documents',
      data: {
        case: testCase.id,
        type: 'cedula',
        status: 'uploaded',
        uploadedBy: { relationTo: 'members', value: clientMember.id },
        visibility: 'client',
      },
      file: {
        data: Buffer.from('%PDF-1.4\\n%âãÏÓ\\n1 0 obj\\n<</Type/Catalog/Pages 2 0 R>>\\nendobj\\n2 0 obj\\n<</Type/Pages/Count 1/Kids[3 0 R]>>\\nendobj\\n3 0 obj\\n<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>\\nendobj\\nxref\\n0 4\\n0000000000 65535 f\\n0000000015 00000 n\\n0000000060 00000 n\\n0000000117 00000 n\\ntrailer\\n<</Size 4/Root 1 0 R>>\\nstartxref\\n190\\n%%EOF'),
        mimetype: 'application/pdf',
        name: 'test.pdf',
        size: 219,
      },
      user: clientMember,
      overrideAccess: false,
    })

    expect(testDocument.id).toBeDefined()
    expect(testDocument.type).toBe('cedula')
  })

  it('denies unassigned lawyer from reading the document', async () => {
    await expect(
      payload.find({
        collection: 'documents',
        where: { id: { equals: testDocument.id } },
        user: unassignedLawyer,
        overrideAccess: false,
      })
    ).rejects.toThrow(/not allowed/)
  })

  it('allows assigned lawyer to read the document', async () => {
    const res = await payload.find({
      collection: 'documents',
      where: { id: { equals: testDocument.id } },
      user: assignedLawyer,
      overrideAccess: false,
    })
    expect(res.docs.length).toBe(1)
    expect(res.docs[0].id).toBe(testDocument.id)
  })

  it('signed URL endpoint denies unauthorized user (unassigned lawyer)', async () => {
    const endpoints = payload.collections.documents.config.endpoints
    const endpoint = Array.isArray(endpoints) ? endpoints.find((e: any) => e.path === '/:id/url') : undefined
    expect(endpoint).toBeDefined()
    if (!endpoint || typeof endpoint.handler !== 'function') return

    const req = new NextRequest(`http://localhost/api/documents/${testDocument.id}/url`) as any
    req.user = unassignedLawyer
    req.payload = payload
    req.routeParams = { id: testDocument.id }

    const res = await endpoint.handler(req)
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toBe('Document not found or access denied')
  })

  it('signed URL endpoint allows authorized user and returns URL', async () => {
    const endpoints = payload.collections.documents.config.endpoints
    const endpoint = Array.isArray(endpoints) ? endpoints.find((e: any) => e.path === '/:id/url') : undefined
    expect(endpoint).toBeDefined()
    if (!endpoint || typeof endpoint.handler !== 'function') return

    const req = new NextRequest(`http://localhost/api/documents/${testDocument.id}/url`) as any
    req.user = assignedLawyer
    req.payload = payload
    req.routeParams = { id: testDocument.id }

    const res = await endpoint.handler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBeDefined()
  })

  it('requires rejectionReason when status is rejected', async () => {
    await expect(
      payload.update({
        collection: 'documents',
        id: testDocument.id,
        data: { status: 'rejected', rejectionReason: '' },
        user: staffUser,
        overrideAccess: false,
      })
    ).rejects.toThrow(/invalid/i)
  })
})
