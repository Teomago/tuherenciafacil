import type { CollectionConfig, PayloadRequest, Where } from 'payload'
import {
  isStaffUser,
  isActiveLawyer,
  isClient,
  canReadCaseScopedResource,
} from '../permissions'
import { syncChecklistOnDocumentChange } from './hooks/syncChecklistOnDocumentChange'
import { setReviewedBy } from './hooks/setReviewedBy'

export const Documents: CollectionConfig = {
  slug: 'documents',
  hooks: {
    beforeChange: [setReviewedBy],
    afterChange: [syncChecklistOnDocumentChange],
  },
  upload: {
    mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    adminThumbnail: 'thumbnail', // You can adjust this depending on the image sizes generated
  },
  access: {
    read: async (args) => {
      const { req } = args
      if (!req.user) return false
      if (isStaffUser(req.user)) return true

      const baseQuery = await canReadCaseScopedResource(args)
      if (!baseQuery) return false

      if (isClient(req.user)) {
        return {
          and: [
            baseQuery as Where,
            { visibility: { equals: 'client' } },
          ],
        }
      }

      // Lawyer
      return baseQuery
    },
    create: async ({ req, data }) => {
      if (!req.user) return false
      if (isStaffUser(req.user)) return true
      
      const caseId = data?.case
      if (!caseId) return false // can't validate case ownership if not provided

      if (isActiveLawyer(req.user)) {
        const relatedCase = await req.payload.findByID({
          collection: 'cases',
          id: typeof caseId === 'object' ? caseId.id : caseId,
          select: { abogadoAsignado: true },
        })
        const abogadoId = typeof relatedCase.abogadoAsignado === 'object' ? relatedCase.abogadoAsignado?.id : relatedCase.abogadoAsignado
        return abogadoId === req.user.id
      }

      if (isClient(req.user)) {
        const relatedCase = await req.payload.findByID({
          collection: 'cases',
          id: typeof caseId === 'object' ? caseId.id : caseId,
          select: { responsable: true },
        })
        const clientId = typeof relatedCase.responsable === 'object' ? relatedCase.responsable?.id : relatedCase.responsable
        return clientId === req.user.id
      }

      return false
    },
    update: async ({ req, data, id }) => {
      if (!req.user) return false
      if (isStaffUser(req.user)) return true

      if (isActiveLawyer(req.user)) {
        // Can only update if they have access to the case
        if (!id) return false
        const doc = await req.payload.findByID({
          collection: 'documents',
          id,
          select: { case: true },
        })
        const caseId = typeof doc.case === 'object' ? doc.case?.id : doc.case
        if (!caseId) return false

        const relatedCase = await req.payload.findByID({
          collection: 'cases',
          id: caseId,
          select: { abogadoAsignado: true },
        })
        const abogadoId = typeof relatedCase.abogadoAsignado === 'object' ? relatedCase.abogadoAsignado?.id : relatedCase.abogadoAsignado
        if (abogadoId !== req.user.id) return false
        return true
      }

      if (isClient(req.user)) {
        // Client can only update if status is not 'verified' (or 'approved')
        // And they cannot change `status` or `verifiedBy` (handled by field access)
        if (!id) return false
        const doc = await req.payload.findByID({
          collection: 'documents',
          id,
          select: { case: true, status: true },
        })
        if (doc.status === 'approved' || doc.status === 'rejected') return false

        const caseId = typeof doc.case === 'object' ? doc.case?.id : doc.case
        if (!caseId) return false

        const relatedCase = await req.payload.findByID({
          collection: 'cases',
          id: caseId,
          select: { responsable: true },
        })
        const clientId = typeof relatedCase.responsable === 'object' ? relatedCase.responsable?.id : relatedCase.responsable
        if (clientId !== req.user.id) return false
        return true
      }

      return false
    },
    delete: ({ req }) => {
      if (!req.user) return false
      return isStaffUser(req.user)
    },
  },
  admin: {
    group: 'Sucesiones',
    useAsTitle: 'filename',
  },
  endpoints: [
    {
      path: '/:id/url',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const id = req.routeParams?.id as string
        if (!id) return Response.json({ error: 'Missing ID' }, { status: 400 })

        if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

        // Check if user has read access
        try {
          const doc = await req.payload.findByID({
            collection: 'documents',
            id,
            user: req.user,
            overrideAccess: false, // forces access control checks
          })
          
          if (!doc) {
             return Response.json({ error: 'Document not found or access denied' }, { status: 404 })
          }

          // The S3 adapter automatically generates a presigned URL in the doc.url field 
          // if the collection ACL is set to Private.
          return Response.json({ url: doc.url })
        } catch (e) {
          return Response.json({ error: 'Document not found or access denied' }, { status: 404 })
        }
      },
    },
  ],
  fields: [
    {
      name: 'case',
      type: 'relationship',
      relationTo: 'cases',
      required: true,
      index: true,
    },
    {
      name: 'heir',
      type: 'relationship',
      relationTo: 'heirs',
      index: true,
    },
    {
      name: 'asset',
      type: 'relationship',
      relationTo: 'assets',
      index: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
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
      name: 'status',
      type: 'select',
      defaultValue: 'uploaded',
      options: [
        { label: 'Uploaded', value: 'uploaded' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Replaced', value: 'replaced' },
      ],
      access: {
        update: ({ req }) => isStaffUser(req.user) || isActiveLawyer(req.user),
      }
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: ['members', 'users'],
      required: true,
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: ['members', 'users'],
      access: {
        update: ({ req }) => isStaffUser(req.user) || isActiveLawyer(req.user),
      }
    },
    {
      name: 'reviewedAt',
      type: 'date',
      access: {
        update: ({ req }) => isStaffUser(req.user) || isActiveLawyer(req.user),
      }
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
      admin: {
        condition: (data) => data?.status === 'rejected',
      },
      validate: (value, { siblingData }) => {
        const data = siblingData as Record<string, unknown>
        if (data?.status === 'rejected' && !value) {
          return 'Se requiere una razón de rechazo cuando el estado es Rechazado.'
        }
        return true
      },
    },
    {
      name: 'visibility',
      type: 'select',
      defaultValue: 'client',
      options: [
        { label: 'Client', value: 'client' },
        { label: 'Internal', value: 'internal' },
      ],
      access: {
        update: ({ req }) => isStaffUser(req.user) || isActiveLawyer(req.user),
      }
    },
    {
      name: 'version',
      type: 'number',
      defaultValue: 1,
    },
    {
      name: 'previousVersion',
      type: 'relationship',
      relationTo: 'documents',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
