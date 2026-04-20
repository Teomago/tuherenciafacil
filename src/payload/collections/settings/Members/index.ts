import type { CollectionConfig } from 'payload'
import type { Where } from 'payload'
import {
  isAdminUser,
  isMemberUser,
  staffCanManageMembersInAdmin,
  staffIsPayloadAdminRole,
} from '@/lib/auth/typeGuards'
import { getPublicServerURL } from '@/lib/env/publicServerUrl'
import { clearRelatedBeforeMemberDelete } from './hooks/clearRelatedBeforeMemberDelete'

export const Members: CollectionConfig = {
  slug: 'members',
  hooks: {
    beforeDelete: [clearRelatedBeforeMemberDelete],
  },
  access: {
    create: () => true,
    delete: ({ req }) => {
      const user = req.user
      if (!user) return false
      if (staffCanManageMembersInAdmin(user)) return true
      if (isMemberUser(user)) return { id: { equals: user.id } }
      return false
    },
    read: async ({ req }): Promise<boolean | Where> => {
      const user = req.user
      if (!user) return false
      if (isAdminUser(user)) return true

      // All members can always read their own profile
      const ownProfile: Where = { id: { equals: user.id } }

      // Active abogados can also read clients assigned to their cases
      // Uses 'as any' because the Cases collection type is registered in TASK-11
      if (isMemberUser(user) && user.role === 'abogado' && user.isActive !== false) {
        const cases = await req.payload.find({
          collection: 'cases' as any,
          where: { abogadoAsignado: { equals: user.id } },
          depth: 0,
          limit: 500,
          overrideAccess: true,
        })

        const clientIds = (cases.docs as any[])
          .map((c) =>
            typeof c.responsable === 'object' && c.responsable ? c.responsable.id : c.responsable,
          )
          .filter((id): id is string => Boolean(id))

        if (clientIds.length === 0) return ownProfile
        return { or: [{ id: { equals: user.id } }, { id: { in: clientIds } }] }
      }

      return ownProfile
    },
    update: ({ req }) => {
      const user = req.user
      if (!user) return false
      if (staffCanManageMembersInAdmin(user)) return true
      if (isMemberUser(user)) return { id: { equals: user.id } }
      return false
    },
  },
  admin: {
    defaultColumns: ['firstName', 'lastName', 'email', 'role', 'isActive'],
    useAsTitle: 'email',
    group: 'Settings',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 600000,
    forgotPassword: {
      expiration: 3600000,
      generateEmailHTML: (args) => {
        const token = args?.token || ''
        const user = args?.user || { email: '', preferredLocale: 'es' }
        const locale = user.preferredLocale || 'es'
        const serverURL = getPublicServerURL()
        const resetURL = `${serverURL}/${locale}/reset-password?token=${token}`

        const strings = {
          en: {
            title: 'Reset Your Password',
            greeting: `Hello, ${user.email}!`,
            body: 'You requested to reset your password. Click the button below to set a new one:',
            button: 'Reset Password',
            expiry: 'This link will expire in 1 hour.',
            ignore: 'If you did not request this, please ignore this email.',
            footer: 'tuHerenciaFácil — Tu herencia, simplificada',
          },
          es: {
            title: 'Restablecer tu Contraseña',
            greeting: `Hola, ${user.email}!`,
            body: 'Solicitaste restablecer tu contraseña. Haz clic en el botón para establecer una nueva:',
            button: 'Restablecer Contraseña',
            expiry: 'Este enlace expirará en 1 hora.',
            ignore: 'Si no solicitaste esto, ignora este correo.',
            footer: 'tuHerenciaFácil — Tu herencia, simplificada',
          },
        }

        const t = strings[locale as keyof typeof strings] || strings.es

        return `
          <!doctype html>
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #1a1a1a;">${t.title}</h1>
              <p>${t.greeting}</p>
              <p>${t.body}</p>
              <p style="text-align: center; margin: 32px 0;">
                <a href="${resetURL}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  ${t.button}
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">${t.expiry}</p>
              <p style="color: #666; font-size: 14px;">${t.ignore}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="color: #999; font-size: 12px;">${t.footer}</p>
            </body>
          </html>
        `
      },
      generateEmailSubject: (args) => {
        const locale = args?.user?.preferredLocale || 'es'
        return locale === 'es'
          ? 'tuHerenciaFácil — Restablecer tu contraseña'
          : 'tuHerenciaFácil — Reset your password'
      },
    },
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'secondName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'secondLastName',
      type: 'text',
    },
    {
      name: 'preferredLocale',
      type: 'select',
      defaultValue: 'es',
      required: true,
      options: [
        { label: 'Español', value: 'es' },
        { label: 'English', value: 'en' },
      ],
      admin: {
        description: "The user's preferred language for emails and system notifications.",
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'cliente',
      saveToJWT: true,
      options: [
        { label: 'Cliente', value: 'cliente' },
        { label: 'Abogado', value: 'abogado' },
      ],
      access: {
        update: ({ req }) => staffIsPayloadAdminRole(req.user),
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      saveToJWT: true,
      admin: {
        description:
          'Inactive lawyers are redirected to a pending-activation page on login. Takes effect on next login.',
      },
      access: {
        update: ({ req }) => staffIsPayloadAdminRole(req.user),
      },
    },
    {
      name: 'cedula',
      type: 'text',
      unique: true,
      validate: (value: string | null | undefined) => {
        if (!value) return true
        if (!/^[0-9]{6,12}$/.test(value)) {
          return 'La cédula debe contener entre 6 y 12 dígitos numéricos, sin puntos ni espacios.'
        }
        return true
      },
      admin: {
        description: 'Solo dígitos, sin puntos. Ejemplo: 1012345678',
      },
    },
    {
      name: 'telefono',
      type: 'text',
      validate: (value: string | null | undefined) => {
        if (!value) return true
        if (!/^3[0-9]{9}$/.test(value)) {
          return 'El teléfono debe ser un número móvil colombiano de 10 dígitos que comience con 3.'
        }
        return true
      },
      admin: {
        description: 'Número móvil colombiano. Ejemplo: 3001234567',
      },
    },
    {
      name: 'ciudad',
      type: 'text',
    },
    {
      name: 'creditoAcumulado',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description:
          'Crédito acumulado en pesos COP. Gestionado automáticamente por el hook autorizarCredito. Solo editable por Admin directamente; los abogados deben usar el campo autorizarCredito en Citas.',
      },
      access: {
        // I-2: Only admin can write creditoAcumulado directly.
        // Abogados must go through the autorizarCredito hook on Appointments —
        // allowing direct writes would bypass the financial control gate entirely.
        update: ({ req }) => staffIsPayloadAdminRole(req.user),
      },
    },
    {
      name: 'isVerified',
      type: 'checkbox',
      defaultValue: false,
      access: {
        update: ({ req }) => staffIsPayloadAdminRole(req.user),
      },
    },
  ],
  labels: {
    plural: 'Members',
    singular: 'Member',
  },
}
