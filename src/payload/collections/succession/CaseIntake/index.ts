import type { CollectionConfig, Where } from 'payload'
import { isAdminUser, isMemberUser } from '@/lib/auth/typeGuards'

export const CaseIntake: CollectionConfig = {
  slug: 'case-intakes',
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
      return { member: { equals: user.id } } as Where
    },
    update: ({ req }) => {
      const user = req.user
      if (!user) return false
      if (isAdminUser(user)) return true
      if (!isMemberUser(user)) return false
      if (user.role === 'abogado' && user.isActive !== false) return true
      return { member: { equals: user.id } } as Where
    },
    delete: ({ req }) => isAdminUser(req.user),
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === 'create' && !data.member && req.user && isMemberUser(req.user)) {
          data.member = req.user.id
        }
        if (data.status === 'submitted') {
          if (!data.tierElegido) {
            throw new Error('El tierElegido es requerido para enviar el intake.')
          }
          if (!data.acuerdoHerederos) {
            throw new Error('Debe confirmar el acuerdo de herederos.')
          }
        }
        return data
      },
    ],
  },
  admin: {
    useAsTitle: 'causanteNombre',
    group: 'Sucesiones',
  },
  fields: [
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Paid', value: 'paid' },
      ],
    },
    {
      name: 'tierElegido',
      type: 'select',
      options: [
        { label: 'Estándar', value: 'estandar' },
        { label: 'Premium', value: 'premium' },
        { label: 'Elite', value: 'elite' },
      ],
    },
    {
      name: 'tieneTestamento',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true },
    },
    {
      name: 'acuerdoHerederos',
      type: 'select',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No sabe', value: 'no_sabe' },
      ],
      required: true,
    },
    {
      name: 'causanteNombre',
      type: 'text',
      required: true,
    },
    {
      name: 'causanteCedula',
      type: 'text',
      required: true,
    },
    {
      name: 'causanteFechaFallecimiento',
      type: 'date',
      required: true,
    },
    {
      name: 'causanteCiudadFallecimiento',
      type: 'text',
      required: true,
    },
    {
      name: 'bienesDescripcion',
      type: 'textarea',
    },
    {
      name: 'parentescoConCausante',
      type: 'select',
      options: [
        { label: 'Hijo/a',      value: 'hijo'       },
        { label: 'Hermano/a',   value: 'hermano'    },
        { label: 'Cónyuge',     value: 'conyuge'    },
        { label: 'Nieto/a',     value: 'nieto'      },
        { label: 'Sobrino/a',   value: 'sobrino'    },
        { label: 'Padre/Madre', value: 'padre_madre'},
        { label: 'Otro',        value: 'otro'       },
      ],
    },
    {
      name: 'appointment',
      type: 'relationship',
      relationTo: 'appointments',
      admin: { description: 'Cita previa si el cliente tuvo una antes de abrir el caso.' },
    },
    {
      name: 'wompiTransactionId',
      type: 'text',
      admin: { description: 'ID de transacción Wompi. Se llena en RFC-008.' },
    },
    {
      name: 'montoTotal',
      type: 'number',
      admin: { description: 'Monto total pagado en COP. Se llena en RFC-008.' },
    },
    {
      name: 'herederosEstimados',
      type: 'number',
      min: 1,
      required: true,
    },
    {
      name: 'valorEstimadoTotal',
      type: 'number',
    },
    {
      name: 'case',
      type: 'relationship',
      relationTo: 'cases',
      admin: {
        readOnly: true,
        description: 'Se llena automáticamente al confirmar el pago.',
      },
    },
  ],
  labels: {
    plural: 'Intakes',
    singular: 'Intake',
  },
}
