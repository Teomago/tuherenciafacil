import type { CollectionAfterChangeHook, Where } from 'payload'

const getRelationID = (relation: unknown): string | null => {
  if (typeof relation === 'string') return relation
  if (relation && typeof relation === 'object' && 'id' in relation) {
    const id = relation.id
    return typeof id === 'string' ? id : null
  }
  return null
}

export const syncChecklistOnDocumentChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // If replacement upload (doc has previousVersion on create)
  if (operation === 'create' && doc.previousVersion) {
    const prevId = typeof doc.previousVersion === 'object' ? doc.previousVersion.id : doc.previousVersion
    
    // Mark old document as replaced
    await req.payload.update({
      collection: 'documents',
      id: prevId,
      data: { status: 'replaced' },
      req,
    })
    
    // Find checklist item pointing to old document
    const checklists = await req.payload.find({
      collection: 'document-checklists',
      where: { document: { equals: prevId } },
      req,
    })

    // Update checklist to point to new doc and reset status
    for (const checklist of checklists.docs) {
      await req.payload.update({
        collection: 'document-checklists',
        id: checklist.id,
        data: {
          document: doc.id,
          status: 'uploaded',
        },
        req,
      })
    }
    return doc
  }

  // Find associated pending checklist for this case and type if no document is linked yet
  if (operation === 'create' && doc.status === 'uploaded') {
    const caseId = getRelationID(doc.case)
    if (!caseId) return doc

    const where: Where = {
      case: { equals: caseId },
      documentType: { equals: doc.type },
      status: { equals: 'pending' },
    }

    if (doc.heir) {
      const heirId = getRelationID(doc.heir)
      if (!heirId) return doc
      where.heir = { equals: heirId }
    } else if (doc.asset) {
      const assetId = getRelationID(doc.asset)
      if (!assetId) return doc
      where.asset = { equals: assetId }
    } else {
      // Avoid matching heir/asset items if this doc is generic
      where.and = [
        { heir: { exists: false } },
        { asset: { exists: false } },
      ]
    }

    const checklists = await req.payload.find({
      collection: 'document-checklists',
      where,
      limit: 1,
      req,
    })

    if (checklists.docs.length > 0) {
      await req.payload.update({
        collection: 'document-checklists',
        id: checklists.docs[0].id,
        data: {
          status: 'uploaded',
          document: doc.id,
        },
        req,
      })
    }
    return doc
  }

  // Handle status changes (approve / reject)
  if (operation === 'update' && doc.status !== previousDoc?.status) {
    // Find checklist pointing to this doc
    const checklists = await req.payload.find({
      collection: 'document-checklists',
      where: { document: { equals: doc.id } },
      limit: 1,
      req,
    })

    if (checklists.docs.length > 0) {
      const checklist = checklists.docs[0]
      const updateData: Record<string, unknown> = {}

      if (doc.status === 'approved') {
        updateData.status = 'approved'
        updateData.reviewedBy = doc.reviewedBy
        updateData.reviewedAt = new Date().toISOString()
      } else if (doc.status === 'rejected') {
        updateData.status = 'rejected'
        updateData.reviewNote = doc.rejectionReason
        updateData.reviewedBy = doc.reviewedBy
        updateData.reviewedAt = new Date().toISOString()
      } else if (doc.status === 'uploaded') { // Reset
        updateData.status = 'uploaded'
      }

      if (Object.keys(updateData).length > 0) {
        await req.payload.update({
          collection: 'document-checklists',
          id: checklist.id,
          data: updateData,
          req,
        })
      }
    }
  }

  return doc
}
