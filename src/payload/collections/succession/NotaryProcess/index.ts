import type { CollectionConfig } from 'payload'
import {
  isStaffUser,
  isActiveLawyer,
  isClient,
  canReadCaseScopedResource,
  canManageCaseScopedResource,
} from '../permissions'

export const NotaryProcess: CollectionConfig = {
  slug: 'notary-process',
  access: {
    read: async (args) => {
      const { req } = args
      if (!req.user) return false
      if (isStaffUser(req.user)) return true
      if (isClient(req.user)) return false
      return canReadCaseScopedResource(args)
    },
    create: async (args) => {
      const { req } = args
      if (!req.user) return false
      if (isStaffUser(req.user)) return true
      return canManageCaseScopedResource(args)
    },
    update: async (args) => {
      const { req } = args
      if (!req.user) return false
      if (isStaffUser(req.user)) return true
      return canManageCaseScopedResource(args)
    },
    delete: ({ req }) => {
      if (!req.user) return false
      return isStaffUser(req.user)
    },
  },
  admin: {
    group: 'Sucesiones',
    useAsTitle: 'case',
  },
  fields: [
    {
      name: 'case',
      type: 'relationship',
      relationTo: 'cases',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'radicacion',
      type: 'group',
      fields: [
        {
          name: 'fecha',
          type: 'date',
        },
        {
          name: 'numero',
          type: 'text',
        },
        {
          name: 'escritos',
          type: 'relationship',
          relationTo: 'documents',
          hasMany: true,
        },
      ],
    },
    {
      name: 'respuestaNotario',
      type: 'group',
      fields: [
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pendiente', value: 'pendiente' },
            { label: 'Aprobado', value: 'aprobado' },
            { label: 'Requiere Documentos', value: 'requiere_documentos' },
            { label: 'Requiere Correcciones', value: 'requiere_correcciones' },
          ],
        },
        {
          name: 'detalle',
          type: 'textarea',
        },
        {
          name: 'fecha',
          type: 'date',
        },
        {
          name: 'autorizacionEdictos',
          type: 'relationship',
          relationTo: 'documents',
        },
      ],
    },
    {
      name: 'edictos',
      type: 'group',
      fields: [
        {
          name: 'medio',
          type: 'text',
        },
        {
          name: 'fechaPublicacion',
          type: 'date',
        },
        {
          name: 'costo',
          type: 'number',
        },
        {
          name: 'fechaVencimiento',
          type: 'date',
        },
        {
          name: 'edictoPDF',
          type: 'relationship',
          relationTo: 'documents',
        },
        {
          name: 'comprobantePago',
          type: 'relationship',
          relationTo: 'documents',
        },
        {
          name: 'comprobantesEntregados',
          type: 'checkbox',
        },
        {
          name: 'fechaEntrega',
          type: 'date',
        },
      ],
    },
    {
      name: 'dian',
      type: 'group',
      fields: [
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pendiente', value: 'pendiente' },
            { label: 'En Validación', value: 'en_validacion' },
            { label: 'Aprobado', value: 'aprobado' },
            { label: 'Hallazgos', value: 'hallazgos' },
          ],
        },
      ],
    },
    {
      name: 'ugpp',
      type: 'group',
      fields: [
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pendiente', value: 'pendiente' },
            { label: 'En Validación', value: 'en_validacion' },
            { label: 'Aprobado', value: 'aprobado' },
            { label: 'Hallazgos', value: 'hallazgos' },
          ],
        },
      ],
    },
    {
      name: 'firma',
      type: 'group',
      fields: [
        {
          name: 'fecha',
          type: 'date',
        },
        {
          name: 'hora',
          type: 'text',
        },
        {
          name: 'lugar',
          type: 'text',
        },
        {
          name: 'escrituraPublica',
          type: 'relationship',
          relationTo: 'documents',
        },
      ],
    },
    {
      name: 'costosNotariales',
      type: 'group',
      fields: [
        {
          name: 'derechosNotariales',
          type: 'number',
        },
        {
          name: 'impuestoRegistro',
          type: 'number',
        },
        {
          name: 'boletaFiscal',
          type: 'number',
        },
      ],
    },
    {
      name: 'registro',
      type: 'group',
      fields: [
        {
          name: 'fechaSalida',
          type: 'date',
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pendiente', value: 'pendiente' },
            { label: 'Registrado', value: 'registrado' },
            { label: 'Rechazado', value: 'rechazado' },
          ],
        },
        {
          name: 'certificadoTradicionActualizado',
          type: 'relationship',
          relationTo: 'documents',
        },
      ],
    },
  ],
}
