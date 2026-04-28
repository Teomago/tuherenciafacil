import type { CollectionConfig } from 'payload'
import { isAdminUser, isMemberUser } from '@/lib/auth/typeGuards'
import { handleCreditoAcumulado } from './hooks/handleCreditoAcumulado'
import { validateReschedule } from './hooks/validateReschedule'

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  access: {
    create: () => true,
    read: ({ req }) => {
      const user = req.user
      if (!user) return false
      if (isAdminUser(user)) return true
      if (!isMemberUser(user)) return false

      if (user.role === 'abogado' && user.isActive !== false) return true
      return { member: { equals: user.id } }
    },
    update: ({ req }) => {
      const user = req.user
      if (isAdminUser(user)) return true
      if (isMemberUser(user) && user.role === 'abogado' && user.isActive !== false) return true
      if (isMemberUser(user)) return { member: { equals: user.id } }
      return false
    },
    delete: ({ req }) => isAdminUser(req.user),
  },
  hooks: {
    beforeChange: [validateReschedule],
    afterChange: [handleCreditoAcumulado],
  },
  admin: {
    defaultColumns: ['member', 'tipo', 'status', 'monto', 'autorizarCredito'],
    group: 'Sucesiones',
  },
  fields: [
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: false,
    },
    {
      name: 'availabilitySlot',
      type: 'relationship',
      relationTo: 'availability-slots',
      admin: {
        description: 'Franja de disponibilidad seleccionada por el cliente.',
      },
    },
    {
      name: 'fechaAgendada',
      type: 'date',
      admin: {
        description: 'Fecha y hora de la cita agendada.',
      },
    },
    {
      name: 'tipo',
      type: 'select',
      required: true,
      options: [
        { label: 'Consulta Virtual', value: 'consulta_virtual' },
        { label: 'Consulta Presencial', value: 'consulta_presencial' },
        { label: 'Mediación Virtual', value: 'mediacion_virtual' },
        { label: 'Mediación Presencial', value: 'mediacion_presencial' },
        { label: 'Caso Virtual', value: 'caso_virtual' },
        { label: 'Caso Presencial', value: 'caso_presencial' },
      ],
    },
    {
      name: 'monto',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pendiente_pago',
      options: [
        { label: 'Pendiente de Pago', value: 'pendiente_pago' },
        { label: 'Pagada', value: 'pagada' },
        { label: 'Realizada', value: 'realizada' },
        { label: 'Cancelada', value: 'cancelada' },
      ],
    },
    {
      name: 'autorizarCredito',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Solo Paola puede activar esta casilla. Suma el monto al crédito del cliente cuando el estado sea "Realizada".',
      },
      access: {
        update: ({ req }) => isAdminUser(req.user),
      },
    },
    {
      name: 'creditoApplied',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'Gestionado automáticamente por el hook. No editar manualmente.',
      },
      access: {
        update: ({ req }) => isAdminUser(req.user),
      },
    },
    {
      name: 'guestName',
      type: 'text',
      admin: {
        description: 'Nombre del invitado si no tiene cuenta.',
        condition: (data) => !data?.member,
      },
    },
    {
      name: 'guestEmail',
      type: 'text',
      admin: {
        description: 'Email del invitado para confirmación y recordatorios.',
        condition: (data) => !data?.member,
      },
    },
    {
      name: 'guestPhone',
      type: 'text',
      admin: {
        description: 'Teléfono del invitado.',
        condition: (data) => !data?.member,
      },
    },
    {
      name: 'rescheduledAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Fecha del último reagendamiento.',
      },
    },
    {
      name: 'rescheduledBy',
      type: 'select',
      options: [
        { label: 'Cliente', value: 'client' },
        { label: 'Abogado', value: 'lawyer' },
      ],
      admin: {
        readOnly: true,
        condition: (data) => Boolean(data?.rescheduledAt),
      },
    },
  ],
  labels: {
    plural: 'Citas',
    singular: 'Cita',
  },
}
