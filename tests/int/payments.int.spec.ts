import { getPayload, Payload } from 'payload'
import configPromise from '@/payload/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import type { Member, User, Case } from '@/payload/payload-types'

let payload: Payload
let clientMember: Member
let assignedLawyer: Member
let staffUser: User
let testCase: Case

describe('Payments Integration', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })

    // @ts-expect-error - Payload 3.82.0 TS discriminated union bug for Local API without req
    clientMember = await payload.create({
      collection: 'members',
      data: {
        firstName: 'PayClient',
        lastName: 'Tester',
        email: `pay-client-${Date.now()}@test.com`,
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
        email: `pay-lawyer1-${Date.now()}@test.com`,
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
        email: `pay-admin-${Date.now()}@test.com`,
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
      await payload.delete({ collection: 'payments', where: { case: { equals: testCase.id } }, overrideAccess: true })
      await payload.delete({ collection: 'cases', id: testCase.id, overrideAccess: true })
      await payload.delete({ collection: 'members', where: { email: { contains: 'pay-' } }, overrideAccess: true })
      await payload.delete({ collection: 'users', where: { email: { contains: 'pay-admin-' } }, overrideAccess: true })
    } catch {}
  })

  it('manual cash payment can be recorded and approved without Wompi', async () => {
    const payment = await payload.create({
      collection: 'payments',
      data: {
        case: testCase.id,
        tipo: 'servicio',
        amount: 500000,
        currency: 'COP',
        paymentProvider: 'manual',
        method: 'cash',
        status: 'pending_confirmation',
      },
      user: assignedLawyer,
      overrideAccess: false,
    })

    expect(payment.id).toBeDefined()
    
    // Approve it
    const approved = await payload.update({
      collection: 'payments',
      id: payment.id,
      data: {
        status: 'approved',
      },
      user: staffUser,
      overrideAccess: false,
    })

    expect(approved.status).toBe('approved')
    expect(approved.approvedBy).toBeDefined()
  })

  it('QR/bank transfer methods are accepted', async () => {
    const qrPayment = await payload.create({
      collection: 'payments',
      data: {
        case: testCase.id,
        tipo: 'servicio',
        amount: 100000,
        method: 'qr',
      },
      user: assignedLawyer,
      overrideAccess: false,
    })
    expect(qrPayment.id).toBeDefined()
    expect(qrPayment.method).toBe('qr')

    const bankPayment = await payload.create({
      collection: 'payments',
      data: {
        case: testCase.id,
        tipo: 'servicio',
        amount: 200000,
        method: 'bank_transfer',
      },
      user: assignedLawyer,
      overrideAccess: false,
    })
    expect(bankPayment.id).toBeDefined()
    expect(bankPayment.method).toBe('bank_transfer')
  })

  it('client cannot see hidden/internal payment', async () => {
    const hiddenPayment = await payload.create({
      collection: 'payments',
      data: {
        case: testCase.id,
        tipo: 'ajuste',
        amount: 0, // valid for ajuste
        method: 'other',
        visibleToClient: false,
      },
      user: staffUser,
      overrideAccess: false,
    })
    expect(hiddenPayment.id).toBeDefined()

    const clientPayments = await payload.find({
      collection: 'payments',
      where: { case: { equals: testCase.id } },
      user: clientMember,
      overrideAccess: false,
    })

    // They should not see the hidden one
    const foundHidden = clientPayments.docs.find(p => p.id === hiddenPayment.id)
    expect(foundHidden).toBeUndefined()
  })
})
