## SITE-001 — “Under construction” / maintenance mode (chrome-less splash)

**Priority:** medium  
**Type:** product / CMS / frontend  
**Description:** Support a future **maintenance or pre-launch** state where visitors see a simple, credible message (optional rich text), optional hero image from **media**, and **no site chrome** (no `Header` / `Footer`). Today, `(frontend)/layout.tsx` shows header and footer whenever **any** page has `isHome: true`; there is no way to publish a home `Page` while hiding chrome. Preferred direction from architecture review: a **global** (e.g. on `general-settings` or dedicated `site-settings`) with fields such as `siteMode: live | maintenance`, localized `maintenanceMessage`, optional `maintenanceImage`, and layout logic that branches before rendering `Header`/`Footer`. Alternative: a narrow field on **pages** (e.g. `hideSiteChrome` when `isHome`) plus decision-file scope. **Out of scope for this ticket:** a new collection solely for “construction” unless product explicitly requires editorial workflows separate from globals.  
**Success criterion:** With mode set to maintenance, `/[locale]` renders the configured message (and image if present) full-viewport or centered per spec; header and footer are omitted; SEO basics (title/meta, noindex if required) are defined in the decision file. With mode live, behavior matches current marketing site. Covered by unit or integration tests for layout branching.  
**Dependencies:** None for backlog placement; implementation should follow a mini-RFC or decision slice (touches layout + possibly globals). Reference: `src/app/[locale]/(frontend)/layout.tsx` (`hasHomePage` chrome gate).

---

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

---

## APPT-001 — Slot capacity auto-update

**Priority:** medium  
**Type:** feature  
**Description:** When an appointment is booked against an `availability-slot`, automatically update the slot's `status` to `full` when the number of linked appointments reaches `maxAppointments`. Implement as an `afterChange` hook on the `appointments` collection that counts appointments linked to the same slot and updates the slot status accordingly. Should also handle the reverse (set back to `open` if an appointment is cancelled or rescheduled to a different slot).  
**Success criterion:** Creating an appointment that fills a slot's capacity automatically sets the slot `status` to `full`. Cancelling or rescheduling frees the slot back to `open`. Covered by integration tests.  
**Dependencies:** RFC-003.4 implemented (availability-slots + appointments scheduling). Required before client-facing booking UI (RFC-004/005).

