import { getPayload, Payload } from 'payload'
import configPromise from '@/payload/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import type { Member, User, Case, DocumentChecklist, Document } from '@/payload/payload-types'

let payload: Payload
let clientMember: Member
let staffUser: User
let testCase: Case
let checklistItem: DocumentChecklist
let firstDocument: Document

describe('Checklist Sync on Document Change', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })

    // @ts-expect-error - Payload 3.82.0 TS discriminated union bug for Local API without req
    clientMember = await payload.create({
      collection: 'members',
      data: {
        firstName: 'SyncClient',
        lastName: 'Tester',
        email: `sync-client-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `10${Date.now().toString().slice(-8)}`,
        telefono: `300${Date.now().toString().slice(-7)}`,
        ciudad: 'Bogotá',
        role: 'cliente',
      },
      overrideAccess: true,
    }) as Member

    staffUser = await payload.create({
      collection: 'users',
      data: {
        email: `sync-admin-${Date.now()}@test.com`,
        password: 'password1234',
        roles: ['admin']
      },
      overrideAccess: true,
    }) as User

    testCase = await payload.create({
      collection: 'cases',
      data: {
        responsable: clientMember.id,
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

    checklistItem = await payload.create({
      collection: 'document-checklists',
      data: {
        case: testCase.id,
        name: 'Registro Civil Test',
        category: 'causante',
        documentType: 'registro_civil',
        source: 'system',
        required: true,
        status: 'pending',
      },
      overrideAccess: true,
    }) as DocumentChecklist
  }, 120000)

  afterAll(async () => {
    if (!payload) return
    try {
      await payload.delete({ collection: 'document-checklists', where: { case: { equals: testCase.id } }, overrideAccess: true })
      await payload.delete({ collection: 'documents', where: { case: { equals: testCase.id } }, overrideAccess: true })
      await payload.delete({ collection: 'cases', id: testCase.id, overrideAccess: true })
      await payload.delete({ collection: 'members', where: { email: { contains: 'sync-client-' } }, overrideAccess: true })
      await payload.delete({ collection: 'users', where: { email: { contains: 'sync-admin-' } }, overrideAccess: true })
    } catch {}
  })

  it('uploading a document links to checklist and changes status to uploaded', async () => {
    firstDocument = await payload.create({
      collection: 'documents',
      data: {
        case: testCase.id,
        type: 'registro_civil',
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
      overrideAccess: true,
      req: { payload } as any, // Mock req.payload
    }) as Document

    const updatedChecklist = await payload.findByID({
      collection: 'document-checklists',
      id: checklistItem.id,
      overrideAccess: true,
    })

    expect(updatedChecklist.status).toBe('uploaded')
    expect(typeof updatedChecklist.document === 'object' ? updatedChecklist.document?.id : updatedChecklist.document).toBe(firstDocument.id)
  })

  it('approving document updates both records', async () => {
    await payload.update({
      collection: 'documents',
      id: firstDocument.id,
      data: { status: 'approved' },
      user: staffUser,
      overrideAccess: false,
    })

    const updatedChecklist = await payload.findByID({
      collection: 'document-checklists',
      id: checklistItem.id,
      overrideAccess: true,
    })

    expect(updatedChecklist.status).toBe('approved')
    const revVal = typeof updatedChecklist.reviewedBy === 'object' ? updatedChecklist.reviewedBy?.value : undefined
    const revId = typeof revVal === 'object' && revVal !== null ? (revVal as any).id : revVal
    expect(revId).toBe(staffUser.id)
  })

  it('rejecting document updates both records and requires note', async () => {
    // Reset back to uploaded to test rejection
    await payload.update({
      collection: 'documents',
      id: firstDocument.id,
      data: { status: 'uploaded' },
      overrideAccess: true,
    })

    await expect(
      payload.update({
        collection: 'documents',
        id: firstDocument.id,
        data: { status: 'rejected', rejectionReason: '' },
        user: staffUser,
        overrideAccess: false,
      })
    ).rejects.toThrow(/invalid/i)

    await payload.update({
      collection: 'documents',
      id: firstDocument.id,
      data: { status: 'rejected', rejectionReason: 'Ilegible' },
      user: staffUser,
      overrideAccess: false,
    })

    const updatedChecklist = await payload.findByID({
      collection: 'document-checklists',
      id: checklistItem.id,
      overrideAccess: true,
    })

    expect(updatedChecklist.status).toBe('rejected')
    expect(updatedChecklist.reviewNote).toBe('Ilegible')
  })

  it('replacement upload marks old as replaced and updates checklist', async () => {
    const secondDocument = await payload.create({
      collection: 'documents',
      data: {
        case: testCase.id,
        type: 'registro_civil',
        status: 'uploaded',
        uploadedBy: { relationTo: 'members', value: clientMember.id },
        visibility: 'client',
        previousVersion: firstDocument.id,
      },
      file: {
        data: Buffer.from('%PDF-1.4\\n%âãÏÓ\\n1 0 obj\\n<</Type/Catalog/Pages 2 0 R>>\\nendobj\\n2 0 obj\\n<</Type/Pages/Count 1/Kids[3 0 R]>>\\nendobj\\n3 0 obj\\n<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>\\nendobj\\nxref\\n0 4\\n0000000000 65535 f\\n0000000015 00000 n\\n0000000060 00000 n\\n0000000117 00000 n\\ntrailer\\n<</Size 4/Root 1 0 R>>\\nstartxref\\n190\\n%%EOF'),
        mimetype: 'application/pdf',
        name: 'test2.pdf',
        size: 219,
      },
      overrideAccess: true,
      req: { payload } as any, // Mock req.payload
    }) as Document

    const oldDocument = await payload.findByID({
      collection: 'documents',
      id: firstDocument.id,
      overrideAccess: true,
    })

    expect(oldDocument.status).toBe('replaced')

    const updatedChecklist = await payload.findByID({
      collection: 'document-checklists',
      id: checklistItem.id,
      overrideAccess: true,
    })

    expect(updatedChecklist.status).toBe('uploaded')
    expect(typeof updatedChecklist.document === 'object' ? updatedChecklist.document?.id : updatedChecklist.document).toBe(secondDocument.id)
  })

  it('deterministically matches checklist item when multiple heirs exist', async () => {
    // 0. Advance case to phase 2 so heirs trigger checklist generation
    await payload.update({
      collection: 'cases',
      id: testCase.id,
      data: { currentPhase: 2 },
      overrideAccess: true,
    })

    // 1. Create two heirs
    const heir1 = await payload.create({
      collection: 'heirs',
      data: {
        case: testCase.id,
        nombre: 'Heir One',
        cedula: '111',
        parentesco: 'hijo',
      },
      overrideAccess: true,
    })

    const heir2 = await payload.create({
      collection: 'heirs',
      data: {
        case: testCase.id,
        nombre: 'Heir Two',
        cedula: '222',
        parentesco: 'hijo',
      },
      overrideAccess: true,
    })

    // 2. Checklist items should have been generated by hooks
    const checklists = await payload.find({
      collection: 'document-checklists',
      where: {
        case: { equals: testCase.id },
        documentType: { equals: 'cedula' },
      },
      overrideAccess: true,
    })

    // We expect at least 2: Heir One Cedula and Heir Two Cedula
    const item1 = checklists.docs.find((d: any) => d.heir?.id === heir1.id || d.heir === heir1.id)
    const item2 = checklists.docs.find((d: any) => d.heir?.id === heir2.id || d.heir === heir2.id)

    expect(item1).toBeDefined()
    expect(item2).toBeDefined()
    if (!item1 || !item2) return

    // 3. Upload document specifically for Heir Two
    const docForHeir2 = await payload.create({
      collection: 'documents',
      data: {
        case: testCase.id,
        heir: heir2.id,
        type: 'cedula',
        status: 'uploaded',
        uploadedBy: { relationTo: 'members', value: clientMember.id },
      },
      file: {
        data: Buffer.from('%PDF-1.4\\n%âãÏÓ\\n1 0 obj\\n<</Type/Catalog/Pages 2 0 R>>\\nendobj\\n2 0 obj\\n<</Type/Pages/Count 1/Kids[3 0 R]>>\\nendobj\\n3 0 obj\\n<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>\\nendobj\\nxref\\n0 4\\n0000000000 65535 f\\n0000000015 00000 n\\n0000000060 00000 n\\n0000000117 00000 n\\ntrailer\\n<</Size 4/Root 1 0 R>>\\nstartxref\\n190\\n%%EOF'),
        mimetype: 'application/pdf',
        name: 'heir2.pdf',
        size: 219,
      },
      overrideAccess: true,
      req: { payload } as any,
    })

    // 4. Verify checklist item 2 is updated, but item 1 remains pending
    const updated1 = await payload.findByID({ collection: 'document-checklists', id: item1.id, overrideAccess: true })
    const updated2 = await payload.findByID({ collection: 'document-checklists', id: item2.id, overrideAccess: true })

    expect(updated1.status).toBe('pending')
    expect(updated2.status).toBe('uploaded')
    expect(typeof updated2.document === 'object' ? updated2.document?.id : updated2.document).toBe(docForHeir2.id)
  })
})
