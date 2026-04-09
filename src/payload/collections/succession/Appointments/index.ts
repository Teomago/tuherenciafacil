import type { CollectionConfig } from 'payload'
import { isAdminUser, isMemberUser } from '@/lib/auth/typeGuards'
import { handleCreditoAcumulado } from './hooks/handleCreditoAcumulado'

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  access: {
    create: ({ req }) => {
      if (isAdminUser(req.user)) return true
      if (isMemberUser(req.user)) return true
      return false
    },
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
      return false
    },
    delete: ({ req }) => isAdminUser(req.user),
  },
  hooks: {
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
      required: true,
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
  ],
  labels: {
    plural: 'Citas',
    singular: 'Cita',
  },
}
