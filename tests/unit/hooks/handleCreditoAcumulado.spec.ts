import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleCreditoAcumulado } from '@/payload/collections/succession/Appointments/hooks/handleCreditoAcumulado'

// Minimal factory for the Payload req mock
function makeReq(overrides: Record<string, unknown> = {}) {
  return {
    payload: {
      update: vi.fn().mockResolvedValue({}),
      findByID: vi.fn().mockResolvedValue({ creditoAcumulado: 500_000 }),
      logger: { error: vi.fn() },
    },
    context: {},
    ...overrides,
  } as any
}

// Minimal Appointment doc factory
function makeDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: 'appt-1',
    member: 'member-1',
    monto: 200_000,
    status: 'realizada',
    autorizarCredito: true,
    creditoApplied: false,
    ...overrides,
  }
}

describe('handleCreditoAcumulado hook', () => {
  // ── C-2: Re-entrancy guard ─────────────────────────────────────────────────

  it('C-2: skips all DB writes when context.skipHooks is true (re-entrancy guard)', async () => {
    const req = makeReq({ context: { skipHooks: true } })
    const doc = makeDoc()
    const previousDoc = makeDoc({ autorizarCredito: false })

    const result = await handleCreditoAcumulado({
      doc,
      previousDoc,
      req,
      operation: 'update',
      collection: {} as any,
      context: { skipHooks: true },
    } as any)

    expect(result).toBe(doc)
    expect(req.payload.update).not.toHaveBeenCalled()
    expect(req.payload.findByID).not.toHaveBeenCalled()
  })

  // ── C-3: monto validation ──────────────────────────────────────────────────

  it('C-3: does not apply credit when monto is zero', async () => {
    const req = makeReq()
    const doc = makeDoc({ monto: 0 })
    const previousDoc = makeDoc({ autorizarCredito: false, monto: 0 })

    const result = await handleCreditoAcumulado({
      doc,
      previousDoc,
      req,
      operation: 'update',
      collection: {} as any,
      context: {},
    } as any)

    expect(req.payload.update).not.toHaveBeenCalled()
    expect(result).toEqual(doc)
  })

  it('C-3: does not apply credit when monto is undefined', async () => {
    const req = makeReq()
    const doc = makeDoc({ monto: undefined })
    const previousDoc = makeDoc({ autorizarCredito: false, monto: undefined })

    const result = await handleCreditoAcumulado({
      doc,
      previousDoc,
      req,
      operation: 'update',
      collection: {} as any,
      context: {},
    } as any)

    expect(req.payload.update).not.toHaveBeenCalled()
    expect(result).toEqual(doc)
  })

  it('C-3: does not reverse credit when monto is zero', async () => {
    const req = makeReq()
    const doc = makeDoc({ autorizarCredito: false, creditoApplied: true, monto: 0 })
    const previousDoc = makeDoc({ autorizarCredito: true, creditoApplied: true, monto: 0 })

    await handleCreditoAcumulado({
      doc,
      previousDoc,
      req,
      operation: 'update',
      collection: {} as any,
      context: {},
    } as any)

    expect(req.payload.update).not.toHaveBeenCalled()
  })

  // ── Sanity: correct path still works ──────────────────────────────────────

  it('applies credit correctly with valid monto (regression guard)', async () => {
    const req = makeReq()
    const doc = makeDoc()
    const previousDoc = makeDoc({ autorizarCredito: false, creditoApplied: false })

    await handleCreditoAcumulado({
      doc,
      previousDoc,
      req,
      operation: 'update',
      collection: {} as any,
      context: {},
    } as any)

    // Should write creditoApplied and update member balance
    expect(req.payload.update).toHaveBeenCalledTimes(2)
    const memberUpdate = req.payload.update.mock.calls[1][0]
    expect(memberUpdate.collection).toBe('members')
    expect(memberUpdate.data.creditoAcumulado).toBe(700_000) // 500_000 + 200_000
  })
})
