import type { CollectionConfig } from 'payload'
import { isAdminUser, isMemberUser } from '@/lib/auth/typeGuards'

export const AvailabilitySlots: CollectionConfig = {
  slug: 'availability-slots',
  access: {
    create: ({ req }) => {
      if (isAdminUser(req.user)) return true
      if (isMemberUser(req.user) && req.user.role === 'abogado' && req.user.isActive !== false) {
        return true
      }
      return false
    },
    read: () => true,
    update: ({ req }) => {
      if (isAdminUser(req.user)) return true
      if (isMemberUser(req.user) && req.user.role === 'abogado' && req.user.isActive !== false) {
        return true
      }
      return false
    },
    delete: ({ req }) => isAdminUser(req.user),
  },
  admin: {
    group: 'Sucesiones',
    useAsTitle: 'date',
  },
  fields: [
    {
      name: 'lawyer',
      type: 'relationship',
      relationTo: 'members',
      required: true,
      filterOptions: () => ({
        role: { equals: 'abogado' },
        isActive: { not_equals: false },
      }),
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      index: true,
    },
    {
      name: 'startTime',
      type: 'text',
      required: true,
      admin: {
        description: 'Formato HH:mm (24h). Ejemplo: "08:00"',
      },
    },
    {
      name: 'endTime',
      type: 'text',
      required: true,
      admin: {
        description: 'Formato HH:mm (24h). Ejemplo: "10:00"',
      },
    },
    {
      name: 'appointmentDuration',
      type: 'number',
      required: true,
      min: 15,
      admin: {
        description: 'Duración de cada cita en minutos.',
      },
    },
    {
      name: 'maxAppointments',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        description: 'Cantidad máxima de citas en esta franja.',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'open',
      options: [
        { label: 'Abierta', value: 'open' },
        { label: 'Llena', value: 'full' },
        { label: 'Cancelada', value: 'cancelled' },
      ],
    },
  ],
  labels: {
    plural: 'Franjas de Disponibilidad',
    singular: 'Franja de Disponibilidad',
  },
}
