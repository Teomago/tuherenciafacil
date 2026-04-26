import type { CollectionAfterChangeHook } from 'payload'
import { generateAssetChecklistItems } from '../../DocumentChecklist/utils/generateChecklistItems'

export const assetChecklistHook: CollectionAfterChangeHook = async ({ doc, req }) => {
  const caseId = typeof doc.case === 'object' ? doc.case?.id : doc.case
  if (!caseId) return doc

  const parentCase = await req.payload.findByID({
    collection: 'cases',
    id: caseId,
    select: { currentPhase: true },
    req,
  })

  if (parentCase.currentPhase && parentCase.currentPhase >= 2) {
    await generateAssetChecklistItems(req, doc)
  }

  return doc
}
