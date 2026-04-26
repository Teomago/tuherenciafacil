import type { CollectionConfig } from 'payload'
import { isAdminUser, isMemberUser } from '@/lib/auth/typeGuards'
import { heirChecklistHook } from './hooks/generateHeirChecklistItems'

export const Heirs: CollectionConfig = {
  slug: 'heirs',
  hooks: {
    afterChange: [heirChecklistHook],
  },
  access: {
    create: ({ req }) => {
      const user = req.user
      if (!user) return false
      if (isAdminUser(user)) return true
      if (isMemberUser(user)) return true
      return false
    },
    read: ({ req }) => {
      const user = req.user
      if (!user) return false
      if (isAdminUser(user)) return true
      if (isMemberUser(user)) return true
      return false
    },
    update: ({ req }) => {
      const user = req.user
      if (!user) return false
      if (isAdminUser(user)) return true
      if (isMemberUser(user)) return true
      return false
    },
    delete: ({ req }) => isAdminUser(req.user),
  },
  admin: {
    useAsTitle: 'nombre',
    group: 'Sucesiones',
  },
  fields: [
    {
      name: 'case',
      type: 'relationship',
      relationTo: 'cases',
      required: true,
    },
    {
      name: 'nombre',
      type: 'text',
      required: true,
    },
    {
      name: 'cedula',
      type: 'text',
      required: true,
    },
    {
      name: 'parentesco',
      type: 'select',
      options: [
        { label: 'Hijo/a', value: 'hijo' },
        { label: 'Cónyuge/Compañero', value: 'conyuge' },
        { label: 'Padre/Madre', value: 'padre' },
        { label: 'Hermano/a', value: 'hermano' },
        { label: 'Otro', value: 'otro' },
      ],
      required: true,
    },
    {
      name: 'esFallecido',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'esRepresentante',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'herederoOriginal',
      type: 'relationship',
      relationTo: 'heirs',
      admin: {
        condition: (data, siblingData) => Boolean(siblingData?.esRepresentante),
      },
    },
    {
      name: 'representacionValidada',
      type: 'checkbox',
      defaultValue: false,
      access: {
        read: () => true,
        update: ({ req }) => {
          if (isAdminUser(req.user)) return true
          if (isMemberUser(req.user) && req.user.role === 'abogado' && req.user.isActive !== false) return true
          return false
        },
      },
      admin: {
        description: 'Solo abogados o administradores pueden validar la representación.',
      },
    },
  ],
  labels: {
    plural: 'Herederos',
    singular: 'Heredero',
  },
}
