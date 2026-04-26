import type { CollectionBeforeChangeHook } from 'payload'

export const setReviewedBy: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  if (operation === 'update' && (data.status === 'approved' || data.status === 'rejected')) {
    if (!data.reviewedBy && req.user) {
      data.reviewedBy = { relationTo: req.user.collection, value: req.user.id }
      data.reviewedAt = new Date().toISOString()
    }
  }
  return data
}
