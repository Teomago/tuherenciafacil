import type { CollectionConfig } from 'payload'
import { isAdminUser, isMemberUser } from '@/lib/auth/typeGuards'
import { assetChecklistHook } from './hooks/generateAssetChecklistItems'

export const Assets: CollectionConfig = {
  slug: 'assets',
  hooks: {
    afterChange: [assetChecklistHook],
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
    useAsTitle: 'identificador',
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
      name: 'tipo',
      type: 'select',
      options: [
        { label: 'Inmueble', value: 'inmueble' },
        { label: 'Vehículo', value: 'vehiculo' },
        { label: 'Cuenta Bancaria', value: 'cuenta' },
        { label: 'Acción/Sociedad', value: 'accion' },
        { label: 'Otro', value: 'otro' },
      ],
      required: true,
    },
    {
      name: 'valorEstimado',
      type: 'number',
      required: true,
    },
    {
      name: 'descripcion',
      type: 'textarea',
      required: true,
    },
    {
      name: 'identificador',
      type: 'text',
      required: true,
    },
    {
      name: 'investigacion',
      type: 'group',
      fields: [
        {
          name: 'resultado',
          type: 'relationship',
          relationTo: 'media',
        },
      ],
    },
  ],
  labels: {
    plural: 'Activos',
    singular: 'Activo',
  },
}
