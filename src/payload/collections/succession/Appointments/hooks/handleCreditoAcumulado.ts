import type { CollectionAfterChangeHook } from 'payload'

export const handleCreditoAcumulado: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  if (operation === 'create' || !previousDoc) return doc

  const autorizarChanged = doc.autorizarCredito !== previousDoc.autorizarCredito
  if (!autorizarChanged) return doc

  const memberId = typeof doc.member === 'object' ? doc.member.id : doc.member
  if (!memberId) {
    req.payload.logger.error('[creditoAcumulado] No member ID on appointment doc')
    return doc
  }

  // === APPLY CREDIT ===
  if (doc.autorizarCredito === true && doc.status === 'realizada' && !doc.creditoApplied) {
    await req.payload.update({
      collection: 'appointments' as any,
      id: doc.id,
      data: { creditoApplied: true } as any,
      req, // Must pass req to stay within Payload's transaction
      overrideAccess: true,
    })

    const member = await req.payload.findByID({
      collection: 'members',
      id: memberId,
      req,
      overrideAccess: true,
    })

    const newBalance = (member.creditoAcumulado || 0) + doc.monto

    await req.payload.update({
      collection: 'members',
      id: memberId,
      data: { creditoAcumulado: newBalance },
      req,
      overrideAccess: true,
    })

    return { ...doc, creditoApplied: true }
  }

  // === REVERSE CREDIT ===
  if (
    doc.autorizarCredito === false &&
    previousDoc.autorizarCredito === true &&
    doc.creditoApplied === true
  ) {
    const member = await req.payload.findByID({
      collection: 'members',
      id: memberId,
      req,
      overrideAccess: true,
    })

    const currentBalance = member.creditoAcumulado || 0

    if (currentBalance < doc.monto) {
      req.payload.logger.error(
        `[creditoAcumulado] Insufficient balance: cannot subtract ${doc.monto} from member ${memberId} (balance: ${currentBalance}). Skipping reversal.`,
      )
      return doc
    }

    await req.payload.update({
      collection: 'appointments' as any,
      id: doc.id,
      data: { creditoApplied: false } as any,
      req,
      overrideAccess: true,
    })

    const newBalance = currentBalance - doc.monto

    await req.payload.update({
      collection: 'members',
      id: memberId,
      data: { creditoAcumulado: newBalance },
      req,
      overrideAccess: true,
    })

    return { ...doc, creditoApplied: false }
  }

  return doc
}
