import type { CollectionConfig } from 'payload'
import {
  isStaffUser,
  isActiveLawyer,
  isClient,
  canReadCaseScopedResource,
  canManageCaseScopedResource,
} from '../permissions'

export const DocumentChecklist: CollectionConfig = {
  slug: 'document-checklists',
  access: {
    read: async (args) => {
      const { req } = args
      if (!req.user) return false
      if (isStaffUser(req.user)) return true
      return canReadCaseScopedResource(args)
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
    delete: async (args) => {
      const { req } = args
      if (!req.user) return false
      if (isStaffUser(req.user)) return true
      if (isClient(req.user)) return false
      return canManageCaseScopedResource(args)
    },
  },
  admin: {
    group: 'Sucesiones',
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'case',
      type: 'relationship',
      relationTo: 'cases',
      required: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'guiaDePaola',
      type: 'textarea',
    },
    {
      name: 'documentType',
      type: 'select',
      options: [
        { label: 'Registro Civil', value: 'registro_civil' },
        { label: 'Cédula', value: 'cedula' },
        { label: 'Poder', value: 'poder' },
        { label: 'Certificado de Tradición', value: 'certificado_tradicion' },
        { label: 'Escritura', value: 'escritura' },
        { label: 'Notarial', value: 'notarial' },
        { label: 'Otro', value: 'otro' },
      ],
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Causante', value: 'causante' },
        { label: 'Heredero', value: 'heredero' },
        { label: 'Bien', value: 'bien' },
        { label: 'Poder', value: 'poder' },
        { label: 'Legal', value: 'legal' },
        { label: 'Notarial', value: 'notarial' },
        { label: 'Personalizado', value: 'custom' },
      ],
    },
    {
      name: 'heir',
      type: 'relationship',
      relationTo: 'heirs',
    },
    {
      name: 'asset',
      type: 'relationship',
      relationTo: 'assets',
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'system',
      options: [
        { label: 'Sistema', value: 'system' },
        { label: 'Manual', value: 'manual' },
      ],
    },
    {
      name: 'required',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'requiredForPhase',
      type: 'number',
    },
    {
      name: 'requestedBy',
      type: 'relationship',
      relationTo: ['members', 'users'],
    },
    {
      name: 'requestedAt',
      type: 'date',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pendiente', value: 'pending' },
        { label: 'Subido', value: 'uploaded' },
        { label: 'Aprobado', value: 'approved' },
        { label: 'Rechazado', value: 'rejected' },
      ],
    },
    {
      name: 'receivedPhysically',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'receivedPhysicallyAt',
      type: 'date',
    },
    {
      name: 'document',
      type: 'relationship',
      relationTo: 'documents',
    },
    {
      name: 'reviewNote',
      type: 'textarea',
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: ['members', 'users'],
    },
    {
      name: 'reviewedAt',
      type: 'date',
    },
  ],
}
