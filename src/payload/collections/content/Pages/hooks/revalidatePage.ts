import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

export const revalidatePageAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req: { payload },
}) => {
  // Only revalidate if the document is published
  if (doc._status === 'published') {
    const { revalidatePath } = await import('next/cache')
    if (doc.pathname) {
      payload.logger.info(`Revalidating page path: ${doc.pathname}`)
      revalidatePath(doc.pathname)
    }
    // If the pathname changed, revalidate the old one too
    if (previousDoc?.pathname && previousDoc.pathname !== doc.pathname) {
      revalidatePath(previousDoc.pathname)
    }
  }
  return doc
}

export const revalidatePageAfterDelete: CollectionAfterDeleteHook = async ({
  doc,
  req: { payload },
}) => {
  if (doc?.pathname) {
    const { revalidatePath } = await import('next/cache')
    payload.logger.info(`Revalidating deleted page path: ${doc.pathname}`)
    revalidatePath(doc.pathname)
  }
  return doc
}
