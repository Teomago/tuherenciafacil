import type { CollectionBeforeDeleteHook } from 'payload'
import type { Where } from 'payload'

function relationId(value: unknown): string | null {
  if (value == null) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'id' in value && typeof (value as { id: unknown }).id === 'string') {
    return (value as { id: string }).id
  }
  return null
}

/**
 * Postgres FKs from `appointments`, `case-intakes`, and `cases` → `members` block DELETE.
 * That surfaces as "current transaction is aborted" after a failed statement; Payload then
 * errors on unrelated queries (e.g. payload_preferences cleanup). Clear dependents first.
 */
export const clearRelatedBeforeMemberDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  if (id === undefined || id === null) return
  const memberId = String(id)

  const deleteWhereInBatches = async (collection: 'appointments' | 'case-intakes', where: Where) => {
    for (;;) {
      const res = await req.payload.find({
        collection,
        where,
        depth: 0,
        limit: 200,
        req,
        overrideAccess: true,
      })
      if (res.docs.length === 0) break
      for (const doc of res.docs) {
        await req.payload.delete({
          collection,
          id: doc.id,
          req,
          overrideAccess: true,
        })
      }
    }
  }

  await deleteWhereInBatches('appointments', { member: { equals: memberId } })
  await deleteWhereInBatches('case-intakes', { member: { equals: memberId } })

  const casesRes = await req.payload.find({
    collection: 'cases',
    where: {
      or: [
        { responsable: { equals: memberId } },
        { abogadoAsignado: { equals: memberId } },
      ],
    },
    depth: 0,
    limit: 500,
    req,
    overrideAccess: true,
  })

  for (const doc of casesRes.docs) {
    const data: { responsable?: null; abogadoAsignado?: null } = {}
    if (relationId(doc.responsable) === memberId) data.responsable = null
    if (relationId(doc.abogadoAsignado) === memberId) data.abogadoAsignado = null
    if (Object.keys(data).length === 0) continue

    await req.payload.update({
      collection: 'cases',
      id: doc.id,
      data,
      req,
      overrideAccess: true,
    })
  }
}
