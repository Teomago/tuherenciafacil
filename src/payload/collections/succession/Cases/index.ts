import type { CollectionConfig, CollectionBeforeChangeHook, Where } from 'payload'
import { isAdminUser, isMemberUser } from '@/lib/auth/typeGuards'
import { generateCaseNumber } from './utils/generateCaseNumber'
import { generateInitialChecklist } from './hooks/generateInitialChecklist'
import { advancePhaseEndpoint } from './endpoints/advancePhase'
import { validatePhaseChangeHook } from './hooks/validatePhaseChangeHook'

const setResponsableAndCaseNumber: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  if (operation !== 'create') return data

  const caseNumber = generateCaseNumber()

  const user = req.user
  if (isMemberUser(user) && user.role === 'cliente') {
    return { ...data, caseNumber, responsable: user.id }
  }

  return { ...data, caseNumber }
}

export const Cases: CollectionConfig = {
  slug: 'cases',
  access: {
    create: ({ req }) => {
      const user = req.user
      if (isAdminUser(user)) return true
      if (isMemberUser(user)) return true
      return false
    },
    read: ({ req }) => {
      const user = req.user
      if (!user) return false
      if (isAdminUser(user)) return true
      if (!isMemberUser(user)) return false

      if (user.role === 'abogado' && user.isActive !== false) {
        return { abogadoAsignado: { equals: user.id } } as Where
      }

      return { responsable: { equals: user.id } } as Where
    },
    update: ({ req }) => {
      const user = req.user
      if (isAdminUser(user)) return true
      if (isMemberUser(user) && user.role === 'abogado' && user.isActive !== false) {
        return { abogadoAsignado: { equals: user.id } }
      }
      return false
    },
    delete: ({ req }) => isAdminUser(req.user),
  },
  endpoints: [
    {
      path: '/:id/advance-phase',
      method: 'post',
      handler: advancePhaseEndpoint,
    },
  ],
  hooks: {
    beforeChange: [setResponsableAndCaseNumber, validatePhaseChangeHook],
    afterChange: [generateInitialChecklist],
  },
  admin: {
    defaultColumns: ['caseNumber', 'status', 'currentPhase', 'tier', 'responsable'],
    useAsTitle: 'caseNumber',
    group: 'Sucesiones',
  },
  fields: [
    {
      name: 'caseNumber',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        description: 'Generado automáticamente al crear el caso.',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Activo', value: 'active' },
        { label: 'Completado', value: 'completed' },
      ],
    },
    {
      name: 'currentPhase',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 8,
    },
    {
      name: 'tier',
      type: 'select',
      required: true,
      defaultValue: 'estandar',
      options: [
        { label: 'Estándar', value: 'estandar' },
        { label: 'Premium', value: 'premium' },
        { label: 'Elite', value: 'elite' },
      ],
    },
    {
      name: 'responsable',
      type: 'relationship',
      relationTo: 'members',
    },
    {
      name: 'abogadoAsignado',
      type: 'relationship',
      relationTo: 'members',
    },
    {
      name: 'invitacionCedula',
      type: 'text',
      admin: {
        description:
          'Cédula del cliente invitado (solo cuando el abogado crea el caso). Sin puntos.',
        condition: (data) => data?.invitacionCedula !== undefined,
      },
    },
    {
      name: 'invitacionStatus',
      type: 'select',
      defaultValue: 'pendiente_aceptacion',
      options: [
        { label: 'Pendiente de aceptación', value: 'pendiente_aceptacion' },
        { label: 'Aceptada', value: 'aceptada' },
      ],
      admin: {
        description: 'Estado de la invitación cuando el caso fue creado por el abogado.',
      },
    },
    {
      name: 'tieneTestamento',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Se copia del Intake.',
      },
    },
    {
      name: 'acuerdoHerederos',
      type: 'select',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No sabe', value: 'no_sabe' },
      ],
      admin: {
        description: 'Se copia del Intake.',
      },
    },
    {
      name: 'causante',
      type: 'group',
      fields: [
        { name: 'nombre', type: 'text' },
        { name: 'cedula', type: 'text' },
        { name: 'fechaFallecimiento', type: 'date' },
        { name: 'ciudadFallecimiento', type: 'text' },
      ],
    },
    {
      name: 'caseIntake',
      type: 'relationship',
      relationTo: 'case-intakes',
      admin: {
        readOnly: true,
        description: 'El formulario de intake que originó este caso.',
      },
    },
    {
      name: 'appointment',
      type: 'relationship',
      relationTo: 'appointments',
      admin: {
        description: 'Consulta previa si el cliente tuvo una antes de abrir el caso.',
      },
    },
    {
      name: 'notasInternas',
      type: 'richText',
      access: {
        read: ({ req }) => {
          if (isAdminUser(req.user)) return true
          if (
            isMemberUser(req.user) &&
            req.user.role === 'abogado' &&
            req.user.isActive !== false
          )
            return true
          return false
        },
        update: ({ req }) => {
          if (isAdminUser(req.user)) return true
          if (
            isMemberUser(req.user) &&
            req.user.role === 'abogado' &&
            req.user.isActive !== false
          )
            return true
          return false
        },
      },
      admin: {
        description: 'Solo visible para abogados y administradores.',
      },
    },
    {
      name: 'notasAlCliente',
      type: 'richText',
      admin: {
        description: 'Visible para el cliente en su dashboard.',
      },
    },
  ],
  labels: {
    plural: 'Casos',
    singular: 'Caso',
  },
}
