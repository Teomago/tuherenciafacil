import type { CollectionBeforeChangeHook } from 'payload'
import { APIError } from 'payload'
import { getRelationshipId } from '../../utils/getRelationshipId'

export const validateHeirRepresentation: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const isRepresentative = data?.esRepresentante ?? originalDoc?.esRepresentante
  if (!isRepresentative) return data

  const heirCaseId = getRelationshipId(data?.case) ?? getRelationshipId(originalDoc?.case)
  const originalHeirId =
    getRelationshipId(data?.herederoOriginal) ?? getRelationshipId(originalDoc?.herederoOriginal)

  if (!originalHeirId) {
    throw new APIError(
      'Un heredero representante debe tener vinculado al heredero original fallecido.',
      422,
    )
  }

  const originalHeir = await req.payload.findByID({
    collection: 'heirs',
    id: originalHeirId,
    req,
    overrideAccess: true,
  })

  if (!originalHeir.esFallecido) {
    throw new APIError('El heredero original debe estar marcado como fallecido.', 422)
  }

  const originalHeirCaseId = getRelationshipId(originalHeir.case)
  if (!heirCaseId || !originalHeirCaseId || originalHeirCaseId !== heirCaseId) {
    throw new APIError('El heredero original debe pertenecer al mismo caso.', 422)
  }

  return data
}
