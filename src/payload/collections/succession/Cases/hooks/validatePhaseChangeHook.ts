import type { CollectionBeforeChangeHook } from 'payload'
import { validatePhaseTransition } from '../utils/validatePhaseTransition'
import type { Case } from '@/payload/payload-types'

export const validatePhaseChangeHook: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
  operation,
}) => {
  if (
    operation === 'update' &&
    typeof data.currentPhase === 'number' &&
    typeof originalDoc?.currentPhase === 'number'
  ) {
    const oldPhase = originalDoc.currentPhase
    const newPhase = data.currentPhase
    
    if (newPhase > oldPhase) {
      // Validate every step if skipping phases, though normally it's +1
      let current = oldPhase
      while (current < newPhase) {
        // Estándar cases cannot move to phase 8+
        if (current === 7 && (originalDoc as Case).tier === 'estandar') {
          throw new Error('Los casos de nivel Estándar finalizan en la Fase 7. No se permite avanzar a la Fase 8 de Registro.')
        }

        const result = await validatePhaseTransition(current, current + 1, { req, doc: originalDoc as Case })
        if (result !== true) {
          throw new Error(result)
        }
        current++
      }
    }
  }
  return data
}
