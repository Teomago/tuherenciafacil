import type { PayloadRequest } from 'payload'
import type { Case, NotaryProcess } from '@/payload/payload-types'

export async function validatePhaseTransition(
  oldPhase: number,
  newPhase: number,
  args: { req: PayloadRequest; doc: Case; completing?: boolean }
): Promise<true | string> {
  const { req, doc } = args

  // We normally only validate strict transitions forward. 
  // If moving backwards or skipping (allowed manually by admin, or just ignored for now), we can pass.
  // The decision says "normally only currentPhase -> currentPhase + 1", 
  // but let's implement the specific gate checks.

  if (oldPhase === 3 && newPhase === 4) {
    // all required relevant checklist items approved
    // exactly one required Poder item approved
    const checklists = await req.payload.find({
      collection: 'document-checklists',
      where: {
        case: { equals: doc.id },
        required: { equals: true },
      },
      limit: 100,
      req,
    })

    let hasUnapproved = false
    let hasApprovedPoder = false

    for (const item of checklists.docs) {
      if (item.status !== 'approved') {
        hasUnapproved = true
      }
      if (item.documentType === 'poder' && item.status === 'approved') {
        hasApprovedPoder = true
      }
    }

    if (hasUnapproved) {
      return 'Todos los documentos obligatorios (incluyendo el Poder) deben estar aprobados antes de avanzar a la Fase 4.'
    }

    if (!hasApprovedPoder) {
      return 'El Poder de Representación Notarial debe estar cargado y aprobado antes de radicar en notaría.'
    }
  }

  if (oldPhase >= 4) {
    // Find notary process for the subsequent checks
    const notaryProcesses = await req.payload.find({
      collection: 'notary-process',
      where: { case: { equals: doc.id } },
      limit: 1,
      req,
    })

    const notaryProcess = notaryProcesses.docs[0] as NotaryProcess | undefined

    if (oldPhase === 4 && newPhase === 5) {
      if (notaryProcess?.respuestaNotario?.status !== 'aprobado') {
        return 'La respuesta del notario debe estar aprobada para avanzar a la Fase 5.'
      }
    }

    if (oldPhase === 5 && newPhase === 6) {
      if (notaryProcess?.edictos?.comprobantesEntregados !== true) {
        return 'Los comprobantes de edictos deben estar entregados para avanzar a la Fase 6.'
      }
    }

    if (oldPhase === 6 && newPhase === 7) {
      if (notaryProcess?.dian?.status !== 'aprobado' || notaryProcess?.ugpp?.status !== 'aprobado') {
        return 'Los estados de DIAN y UGPP deben estar aprobados para avanzar a la Fase 7.'
      }
    }

    if (oldPhase === 7 && newPhase === 8) {
      if (!notaryProcess?.firma?.escrituraPublica) {
        return 'La escritura pública debe estar cargada para avanzar a la Fase 8.'
      }
      // Note: tier 'estandar' logic is handled by the caller (endpoint/hook)
      // to decide between marking completed or moving to phase 8.
    }

    if (oldPhase === 8 && args.completing === true) {
      if (notaryProcess?.registro?.status !== 'registrado') {
        return 'El registro debe estar en estado "Registrado" para completar el proceso.'
      }
    }
  }

  return true
}
