import type { CollectionBeforeChangeHook } from 'payload'
import { APIError } from 'payload'
import { getRelationshipId } from '../../utils/getRelationshipId'

export const validateRoleAssignments: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  const responsableId = getRelationshipId(data?.responsable)
  const originalResponsableId = getRelationshipId(originalDoc?.responsable)

  if (responsableId && (operation === 'create' || responsableId !== originalResponsableId)) {
    const member = await req.payload.findByID({
      collection: 'members',
      id: responsableId,
      req,
      overrideAccess: true,
    })

    if (member.role !== 'cliente') {
      throw new APIError('El responsable debe ser un miembro con rol cliente.', 422)
    }
  }

  const abogadoId = getRelationshipId(data?.abogadoAsignado)
  const originalAbogadoId = getRelationshipId(originalDoc?.abogadoAsignado)

  if (abogadoId && (operation === 'create' || abogadoId !== originalAbogadoId)) {
    const member = await req.payload.findByID({
      collection: 'members',
      id: abogadoId,
      req,
      overrideAccess: true,
    })

    if (member.role !== 'abogado' || member.isActive === false) {
      throw new APIError('El abogado asignado debe ser un abogado activo.', 422)
    }
  }

  return data
}
