import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { getPayload, Payload } from 'payload'
import configPromise from '@/payload/payload.config'
import type { Member, User } from '@/payload/payload-types'

let payload: Payload
let client: Member
let lawyer: Member
let admin: User
let slotId: string
let longSlotId: string
let clientAppointmentId: string
let shortNoticeAppointmentId: string
let guestAppointmentId: string

const now = Date.now()
const isoAtOffsetHours = (hours: number) => new Date(now + hours * 60 * 60 * 1000).toISOString()

describe('Appointments scheduling and rescheduling', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })

    client = await payload.create({
      collection: 'members',
      draft: false,
      data: {
        firstName: 'ScheduleClient',
        lastName: 'Tester',
        email: `schedule-client-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `60${Date.now().toString().slice(-8)}`,
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
        firstName: 'ScheduleLawyer',
        lastName: 'Tester',
        email: `schedule-lawyer-${Date.now()}@test.com`,
        password: 'password1234',
        cedula: `61${Date.now().toString().slice(-8)}`,
        telefono: `310${Date.now().toString().slice(-7)}`,
        ciudad: 'Bogotá',
        preferredLocale: 'es',
        role: 'abogado',
        isActive: true,
      },
      overrideAccess: true,
    })

    admin = await payload.create({
      collection: 'users',
      data: {
        email: `schedule-admin-${Date.now()}@test.com`,
        password: 'password1234',
        roles: ['admin'],
      },
      overrideAccess: true,
    })
  }, 120000)

  afterAll(async () => {
    if (!payload) return
    try {
      await payload.delete({
        collection: 'appointments',
        where: { id: { in: [clientAppointmentId, shortNoticeAppointmentId, guestAppointmentId].filter(Boolean) } },
        overrideAccess: true,
      })
      await payload.delete({
        collection: 'availability-slots',
        where: { id: { in: [slotId, longSlotId].filter(Boolean) } },
        overrideAccess: true,
      })
      await payload.delete({
        collection: 'members',
        where: { email: { contains: 'schedule-' } },
        overrideAccess: true,
      })
      await payload.delete({
        collection: 'users',
        where: { email: { contains: 'schedule-admin-' } },
        overrideAccess: true,
      })
    } catch {
      // best-effort teardown
    }
  })

  it('allows creating a valid availability slot', async () => {
    const slot = await payload.create({
      collection: 'availability-slots',
      data: {
        lawyer: lawyer.id,
        date: isoAtOffsetHours(72),
        startTime: '08:00',
        endTime: '12:00',
        appointmentDuration: 30,
        maxAppointments: 4,
      },
      user: lawyer,
      overrideAccess: false,
    })

    slotId = slot.id
    expect(slot.id).toBeDefined()
  })

  it('allows creating long duration slots (>240) as warning-only behavior', async () => {
    const slot = await payload.create({
      collection: 'availability-slots',
      data: {
        lawyer: lawyer.id,
        date: isoAtOffsetHours(96),
        startTime: '13:00',
        endTime: '18:00',
        appointmentDuration: 300,
        maxAppointments: 2,
      },
      user: lawyer,
      overrideAccess: false,
    })

    longSlotId = slot.id
    expect(slot.id).toBeDefined()
    expect(slot.appointmentDuration).toBe(300)
  })

  it('books an appointment against an available slot', async () => {
    const appointment = await payload.create({
      collection: 'appointments',
      data: {
        member: client.id,
        tipo: 'consulta_virtual',
        monto: 100000,
        status: 'pagada',
        availabilitySlot: slotId,
        fechaAgendada: isoAtOffsetHours(72),
      },
      user: client,
      overrideAccess: false,
    })

    clientAppointmentId = appointment.id
    expect(appointment.id).toBeDefined()
  })

  it('allows client reschedule with >=24 hours notice', async () => {
    const updated = await payload.update({
      collection: 'appointments',
      id: clientAppointmentId,
      data: {
        fechaAgendada: isoAtOffsetHours(80),
      },
      user: client,
      overrideAccess: false,
    })

    expect(updated.fechaAgendada).toBeDefined()
    expect(updated.rescheduledBy).toBe('client')
    expect(updated.rescheduledAt).toBeDefined()
  })

  it('blocks client reschedule with <24 hours notice', async () => {
    const shortNotice = await payload.create({
      collection: 'appointments',
      data: {
        member: client.id,
        tipo: 'consulta_virtual',
        monto: 100000,
        status: 'pagada',
        availabilitySlot: slotId,
        fechaAgendada: isoAtOffsetHours(8),
      },
      user: client,
      overrideAccess: false,
    })
    shortNoticeAppointmentId = shortNotice.id

    await expect(
      payload.update({
        collection: 'appointments',
        id: shortNoticeAppointmentId,
        data: {
          fechaAgendada: isoAtOffsetHours(10),
        },
        user: client,
        overrideAccess: false,
      }),
    ).rejects.toMatchObject({ status: 422 })
  })

  it('allows admin/lawyer reschedule at any time', async () => {
    const updated = await payload.update({
      collection: 'appointments',
      id: shortNoticeAppointmentId,
      data: {
        fechaAgendada: isoAtOffsetHours(20),
      },
      user: admin,
      overrideAccess: false,
    })

    expect(updated.rescheduledBy).toBe('lawyer')
    expect(updated.rescheduledAt).toBeDefined()
  })

  it('allows guest booking without member account', async () => {
    const guestAppointment = await payload.create({
      collection: 'appointments',
      data: {
        tipo: 'consulta_virtual',
        monto: 100000,
        status: 'pendiente_pago',
        availabilitySlot: slotId,
        fechaAgendada: isoAtOffsetHours(100),
        guestName: 'Invitado Test',
        guestEmail: 'invitado@test.com',
        guestPhone: '3001112233',
      },
      overrideAccess: false,
    })
    guestAppointmentId = guestAppointment.id

    expect(guestAppointment.id).toBeDefined()
    expect(guestAppointment.member).toBeNull()
  })
})
