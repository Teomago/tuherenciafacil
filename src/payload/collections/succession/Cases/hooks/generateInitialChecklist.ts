import type { CollectionAfterChangeHook } from 'payload'
import {
  generatePoderChecklistItem,
  generateCaseChecklistItems,
  generateHeirChecklistItems,
  generateAssetChecklistItems,
} from '../../DocumentChecklist/utils/generateChecklistItems'

export const generateInitialChecklist: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // 1. Generate Poder item on creation
  if (operation === 'create') {
    await generatePoderChecklistItem(req, doc.id)
  }

  // 2. Generate other items when phase >= 2
  const currentPhase = doc.currentPhase || 1
  const previousPhase = previousDoc?.currentPhase || 1

  if (currentPhase >= 2 && previousPhase < 2) {
    await generateCaseChecklistItems(req, doc.id, doc.causante)

    // Fetch existing heirs and assets
    const heirs = await req.payload.find({
      collection: 'heirs',
      where: { case: { equals: doc.id } },
      limit: 100,
      req,
    })

    const assets = await req.payload.find({
      collection: 'assets',
      where: { case: { equals: doc.id } },
      limit: 100,
      req,
    })

    for (const heir of heirs.docs) {
      await generateHeirChecklistItems(req, heir)
    }

    for (const asset of assets.docs) {
      await generateAssetChecklistItems(req, asset)
    }
  }

  return doc
}
