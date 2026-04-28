import type { CollectionBeforeChangeHook } from 'payload'
import { APIError } from 'payload'
import { isAdminUser, isMemberUser } from '@/lib/auth/typeGuards'

const hasScheduledDateChanged = (
  newDate: string | null | undefined,
  previousDate: string | null | undefined,
) => {
  if (!newDate || !previousDate) return false
  return new Date(newDate).getTime() !== new Date(previousDate).getTime()
}

export const validateReschedule: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (operation !== 'update') return data
  if (!originalDoc?.fechaAgendada) return data

  const previousDate = new Date(originalDoc.fechaAgendada).toISOString()
  const nextDate = data?.fechaAgendada ? new Date(data.fechaAgendada).toISOString() : null

  if (!hasScheduledDateChanged(nextDate, previousDate)) return data

  const user = req.user
  if (isAdminUser(user) || (isMemberUser(user) && user.role === 'abogado' && user.isActive !== false)) {
    data.rescheduledAt = new Date().toISOString()
    data.rescheduledBy = 'lawyer'
    return data
  }

  const hoursUntilAppointment =
    (new Date(originalDoc.fechaAgendada).getTime() - Date.now()) / (1000 * 60 * 60)

  if (hoursUntilAppointment < 24) {
    throw new APIError('No es posible reagendar con menos de 24 horas de anticipación.', 422)
  }

  data.rescheduledAt = new Date().toISOString()
  data.rescheduledBy = 'client'
  return data
}
