import type { CollectionConfig, PayloadRequest, Where } from 'payload'
import {
  isStaffUser,
  isActiveLawyer,
  isClient,
  canReadCaseScopedResource,
  canManageCaseScopedResource,
} from '../permissions'

export const Payments: CollectionConfig = {
  slug: 'payments',
  access: {
    read: async (args) => {
      const { req } = args
      if (!req.user) return false
      if (isStaffUser(req.user)) return true

      const baseQuery = await canReadCaseScopedResource(args)

      if (isClient(req.user)) {
        const query = baseQuery ? (baseQuery as Where) : { case: { exists: false } }
        // Client sees their own visible payments. Must filter by case or member
        return {
          and: [
            {
              or: [
                query,
                { member: { equals: req.user.id } },
              ],
            },
            { visibleToClient: { equals: true } },
          ],
        }
      }

      if (isActiveLawyer(req.user)) {
        return baseQuery ? (baseQuery as Where) : false
      }

      return false
    },
    create: async (args) => {
      const { req } = args
      if (!req.user) return false
      if (isStaffUser(req.user)) return true
      if (isClient(req.user)) return false
      
      return canManageCaseScopedResource(args)
    },
    update: async (args) => {
      const { req } = args
      if (!req.user) return false
      if (isStaffUser(req.user)) return true
      if (isClient(req.user)) return false
      
      return canManageCaseScopedResource(args)
    },
    delete: ({ req }) => {
      if (!req.user) return false
      return isStaffUser(req.user)
    },
  },
  admin: {
    group: 'Sucesiones',
    useAsTitle: 'paymentReference',
  },
  fields: [
    {
      name: 'case',
      type: 'relationship',
      relationTo: 'cases',
      index: true,
      admin: {
        condition: (data) => !data?.member,
      }
    },
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      admin: {
        condition: (data) => !data?.case,
      }
    },
    {
      name: 'tipo',
      type: 'select',
      required: true,
      options: [
        { label: 'Consulta', value: 'consulta' },
        { label: 'Servicio', value: 'servicio' },
        { label: 'Crédito Consulta', value: 'creditoConsulta' },
        { label: 'Investigación', value: 'investigacion' },
        { label: 'Gasto Tercero', value: 'gasto_tercero' },
        { label: 'Cuota', value: 'cuota' },
        { label: 'Ajuste', value: 'ajuste' },
        { label: 'Otro', value: 'otro' },
      ],
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      validate: (val: number | null | undefined, { siblingData }: { siblingData: Record<string, unknown> }) => {
        const data = siblingData
        if (val === 0 && data?.tipo !== 'creditoConsulta' && data?.tipo !== 'ajuste') {
          return 'Amount cannot be zero except for creditoConsulta or ajuste.'
        }
        if (typeof val === 'number') return true
        return 'Amount is required.'
      },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'COP',
    },
    {
      name: 'paymentProvider',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Wompi', value: 'wompi' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'method',
      type: 'select',
      options: [
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'Cash', value: 'cash' },
        { label: 'QR', value: 'qr' },
        { label: 'Nequi', value: 'nequi' },
        { label: 'PSE', value: 'pse' },
        { label: 'Card', value: 'card' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending_confirmation',
      options: [
        { label: 'Requested', value: 'requested' },
        { label: 'Pending Confirmation', value: 'pending_confirmation' },
        { label: 'Approved', value: 'approved' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      name: 'paymentReference',
      type: 'text',
    },
    {
      name: 'providerTransactionId',
      type: 'text',
    },
    {
      name: 'visibleToClient',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'registeredBy',
      type: 'relationship',
      relationTo: ['members', 'users'],
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: ['members', 'users'],
    },
    {
      name: 'approvedAt',
      type: 'date',
    },
    {
      name: 'overrideReason',
      type: 'textarea',
      validate: (val: string | null | undefined, { siblingData, req }) => {
        const data = siblingData as Record<string, unknown>
        const status = data?.status
        // If an admin is correcting an approved/cancelled/refunded payment, reason is required.
        // Assuming this means if the state is transitioned AWAY from these terminal states.
        // But the requirement says "when admin/super-admin directly corrects an approved/cancelled/refunded payment".
        // It's tricky to validate state transitions strictly in field validation without previousDoc.
        // For now, if the status is one of those, or it's being updated, we could enforce it via a hook,
        // or just rely on a simple check: if overrideReason is not empty, it passes.
        return true
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data?.case && !data?.member) {
          throw new Error('Either case or member must be provided.')
        }
        return data
      }
    ],
    beforeChange: [
      ({ data, req, operation, originalDoc }) => {
        const isTerminal = (status: string) => ['approved', 'cancelled', 'refunded'].includes(status)
        
        if (operation === 'update' && originalDoc) {
          const oldStatus = originalDoc.status as string
          
          if (isTerminal(oldStatus) && !data.overrideReason) {
            throw new Error('overrideReason is required when correcting an approved/cancelled/refunded payment.')
          }
        }
        
        if (data.status === 'approved' && originalDoc?.status !== 'approved' && req.user) {
          data.approvedBy = { relationTo: req.user.collection, value: req.user.id }
          data.approvedAt = new Date().toISOString()
        }

        if (operation === 'create' && !data.registeredBy && req.user) {
          data.registeredBy = { relationTo: req.user.collection, value: req.user.id }
        }

        return data
      }
    ],
  }
}
