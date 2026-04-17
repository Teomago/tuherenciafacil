import type { CollectionAfterChangeHook } from 'payload'

export const handleCreditoAcumulado: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
  context,
}) => {
  // C-2: Re-entrancy guard — this hook writes back to the appointments collection
  // (setting creditoApplied). That write triggers afterChange again. We break the
  // cycle by tagging our own writes with context.skipHooks and exiting here.
  if (context?.skipHooks) return doc

  if (operation === 'create' || !previousDoc) return doc

  const autorizarChanged = doc.autorizarCredito !== previousDoc.autorizarCredito
  if (!autorizarChanged) return doc

  const memberId = typeof doc.member === 'object' ? doc.member.id : doc.member
  if (!memberId) {
    req.payload.logger.error('[creditoAcumulado] No member ID on appointment doc')
    return doc
  }

  // C-3: Monto guard — a zero or missing monto produces a meaningless credit
  // operation and would silently corrupt the member's balance with NaN or zero.
  if (!doc.monto || doc.monto <= 0) {
    req.payload.logger.error(
      `[creditoAcumulado] Invalid monto (${doc.monto}) on appointment ${doc.id} — skipping credit operation`,
    )
    return doc
  }

  // === APPLY CREDIT ===
  if (doc.autorizarCredito === true && doc.status === 'realizada' && !doc.creditoApplied) {
    await req.payload.update({
      collection: 'appointments' as any,
      id: doc.id,
      data: { creditoApplied: true } as any,
      req,
      overrideAccess: true,
      context: { skipHooks: true }, // C-2: prevent re-entrancy
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
      context: { skipHooks: true }, // C-2: prevent re-entrancy
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
