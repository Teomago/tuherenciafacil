import type { PayloadRequest } from 'payload'
import { validatePhaseTransition } from '../utils/validatePhaseTransition'
import type { Case } from '@/payload/payload-types'
import {
  isStaffUser,
  isActiveLawyer,
} from '../../permissions'

export const advancePhaseEndpoint = async (req: PayloadRequest) => {
  const id = req.routeParams?.id as string
  if (!id) return Response.json({ error: 'Missing Case ID' }, { status: 400 })

  const user = req.user
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Only assigned active lawyer or authorized staff/admin can advance
  if (!isStaffUser(user) && !isActiveLawyer(user)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payload = req.payload
  
  // Fetch current case
  const doc = await payload.findByID({
    collection: 'cases',
    id,
    req,
  })

  // Validate ownership for lawyer
  if (!isStaffUser(user) && isActiveLawyer(user)) {
    const abogadoAsignadoId = typeof doc.abogadoAsignado === 'object' ? doc.abogadoAsignado?.id : doc.abogadoAsignado
    if (abogadoAsignadoId !== user.id) {
      return Response.json({ error: 'Forbidden: No assigned to this case' }, { status: 403 })
    }
  }

  const currentPhase = doc.currentPhase || 1
  let newPhase = currentPhase + 1
  let markCompleted = false

  // Specific rules for completion
  if (currentPhase === 7 && doc.tier === 'estandar') {
    newPhase = 7 // Stay in 7
    markCompleted = true
  } else if (currentPhase === 8) {
    newPhase = 8 // Stay in 8
    markCompleted = true
  }

  const completingAtPhase8 = currentPhase === 8
  const validationResult = await validatePhaseTransition(
    currentPhase,
    completingAtPhase8 ? 8 : currentPhase + 1,
    { req, doc, completing: completingAtPhase8 },
  )

  if (validationResult !== true) {
    return Response.json({ error: validationResult }, { status: 400 })
  }

  const updateData: Partial<Case> = {
    currentPhase: newPhase,
  }

  if (markCompleted) {
    updateData.status = 'completed'
  }

  const updatedDoc = await payload.update({
    collection: 'cases',
    id,
    data: updateData,
    req,
  })

  return Response.json(updatedDoc, { status: 200 })
}
