# RFC Verification Skeleton (General)

> Use this for **every RFC**. Copy/adapt into the active decision file and extend with RFC-specific checks when needed.

---

## Pre-implementation checks

1. **Decision completeness**
   - Decision file for the active RFC is approved.
   - In-scope/out-of-scope section is explicit.
   - Every implementation task has at least one matching success criterion.

2. **Environment baseline**
   - Required env vars are documented.
   - External services and credentials strategy are clear for local and production.
   - Risky/destructive operations are explicitly documented before execution.

---

## Required command block (baseline)

Run in order and capture evidence:

1. `pnpm build`  
   - Expected: pass with zero TypeScript errors.

2. `pnpm exec eslint . --quiet`  
   - Expected: pass with zero lint errors.

3. `pnpm test:int`  
   - Expected: integration suite passes, or only pre-approved documented exceptions.

4. `pnpm exec vitest run tests/unit`  
   - Expected: unit suite passes.

Add RFC-specific verification scripts if created:

- `npx tsx src/scripts/verify-rfc-XXX.ts` (recommended for non-trivial RFCs)

---

## RFC-specific behavior checks (fill for active RFC)

Create sections relevant to the RFC domain (examples below). Remove non-applicable sections and add missing ones:

- **Data model checks**
- **Access control checks**
- **Hook/automation checks**
- **API route checks**
- **UI flow checks**
- **Integration checks (storage/payments/email/etc.)**

For each section, include concrete assertions:

- [ ] expected behavior
- [ ] edge/negative case behavior
- [ ] role/permission behavior

---

## Manual smoke checks

- [ ] Admin surface reflects expected collections/fields/actions.
- [ ] Unauthorized paths fail with explicit status/errors.
- [ ] Authorized paths complete without data integrity regressions.

---

## Closure evidence (required before claiming done)

Attach or summarize:

- Command outputs and pass/fail status.
- Manual smoke-check outcomes.
- Known risks, deferred items, and next RFC boundaries.
- Confirmation that `PROJECT_STATE` and `ROADMAP` were updated (if sequence/status changed).
