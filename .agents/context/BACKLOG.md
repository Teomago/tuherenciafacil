## INFRA-001 — Separate dev and production Neon branches

**Priority:** low
**Type:** infrastructure
**Description:** Currently only one Neon branch exists used for both development
and production. Once the full app is implemented and deployed, create separate
Neon branches: one for production (current) and one for development/staging.
Each branch gets its own DATABASE_URL. Update Vercel environment variables
accordingly (preview deployments → dev branch, main deployments → prod branch).
**Success criterion:** `pnpm dev` connects to dev Neon branch; Vercel production
connects to prod branch. Migrations run against dev first, then promoted to prod.
**Dependencies:** Full app implementation complete (post RFC-008)

---

## GOV-001 — Audit logs and override accountability

**Priority:** medium
**Type:** security / governance
**Description:** Define and implement an audit logging model for sensitive back-office actions before production hardening. Scope must be designed before implementation: who performed the action, role at the time, target collection/document, before/after values for sensitive fields, reason for super-admin overrides, request metadata where safe, and retention policy. Initial high-value events include payment ledger changes, document approval/rejection, phase advancement, super-admin overrides, member role/activation changes, and legal workflow gate bypass attempts.
**Success criterion:** A documented audit-log scope matrix exists and the implemented audit log records sensitive actions with actor, timestamp, target, action, and override reason when applicable. Normal admin/lawyer actions and super-admin break-glass actions are distinguishable in `/admin` or an equivalent internal review surface.
**Dependencies:** RFC-003.3 workflow/payment/document model stabilized; required before production hardening.

---

## WARN-001 — next-themes script tag warning

**Priority:** low
**Type:** bug (third-party)
**Description:** next-themes v0.4.6 injects a <script> tag that React 19
warns about. Non-blocking, theme works correctly.
**Success criterion:** warning disappears after next-themes releases
React 19 compatible version
**Dependencies:** none — monitor next-themes releases
