import { describe, expect, it } from 'vitest'
import { AvailabilitySlots } from '@/payload/collections/succession/AvailabilitySlots'
import type { Field } from 'payload'

const getFieldByName = (name: string): Field | undefined =>
  (AvailabilitySlots.fields as Field[]).find((field) => 'name' in field && field.name === name)

describe('AvailabilitySlots collection schema', () => {
  it('exposes required core fields', () => {
    expect(AvailabilitySlots.slug).toBe('availability-slots')
    expect(getFieldByName('lawyer')).toBeDefined()
    expect(getFieldByName('date')).toBeDefined()
    expect(getFieldByName('startTime')).toBeDefined()
    expect(getFieldByName('endTime')).toBeDefined()
    expect(getFieldByName('appointmentDuration')).toBeDefined()
    expect(getFieldByName('maxAppointments')).toBeDefined()
    expect(getFieldByName('status')).toBeDefined()
  })

  it('enforces minimum values for appointmentDuration and maxAppointments', () => {
    const durationField = getFieldByName('appointmentDuration')
    const maxAppointmentsField = getFieldByName('maxAppointments')

    expect(durationField).toBeDefined()
    expect(maxAppointmentsField).toBeDefined()

    expect(durationField && 'min' in durationField ? durationField.min : undefined).toBe(15)
    expect(maxAppointmentsField && 'min' in maxAppointmentsField ? maxAppointmentsField.min : undefined).toBe(1)
  })
})
