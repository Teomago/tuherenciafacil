# ROADMAP — tuHerenciaFácil Implementation Plan

> Canonical execution sequence for this repository. Use with `.agents/context/PROJECT_STATE.md`. **Approved decisions:** active drafts in `.agents/decisions/`; **closed RFCs** (003.1–003.4, etc.) in `.agents/archive/decisions/` with matching specs/audits under `.agents/archive/specs/` and `.agents/archive/audits/`.

---

## Sequence lock (effective 2026-04-24)

The project uses the repo-current baseline:

1. **RFC-003.1** — implemented  
2. **RFC-003.2** — implemented  
3. **RFC-003.3** — implemented  
4. **RFC-003.4** — implemented (admin data integrity + scheduling primitives)  
5. **RFC-004** — next (app shell/primitives)  
6. **RFC-005** — onboarding/pre-payment UX  
7. **RFC-006+** — continue by phase below

Do not renumber active RFCs without a dedicated planning decision that updates both this file and `PROJECT_STATE`.

---

## Technical strategy (persistent)

- **Architecture:** Next.js 16 + Payload CMS 3.x in one codebase (marketing + app + admin).
- **Development mode:** logic-first implementation, then UX polish.
- **Security model:** layered access checks (auth -> role -> ownership).
- **Schema mode (pre-INFRA-001):** `push: true`; avoid manual migration churn unless required.

---

## Completed foundation (reference)

### RFC-003.1 — Core identity and succession shell (done)
- Members refinement, Cases, Appointments, credit hook baseline.

### RFC-003.2 — Intake, heirs, assets (done)
- `case-intakes`, `heirs`, `assets`, and intake conversion endpoint.

### Post-RFC-003.2 stabilization (done)
- Build/deploy/access/env/delete-integrity fixes on `main`.
- These are baseline assumptions for future RFCs, not a separate roadmap branch.

---

## Completed executable phase

### RFC-003.3 — Workflow engine and legal operations data (implemented)
**Objective (delivered):** complete core workflow domain before major UI funnel work.

**Delivered scope:**
1. Documents domain (`documents`) with private storage and signed download flow.
2. Checklist generation/update engine with manual required/optional support.
3. Full `notary-process` backend schema for phases 4-8.
4. Phase gates and controlled advancement endpoint.
5. Provider-agnostic `payments` foundation with manual/offline records.

**Deferred by design:**
- App shell visual/layout work (`RFC-004`).
- Full onboarding funnel screens (`RFC-005`).
- Wompi automation flows beyond provider-agnostic data model (DEC-005 follow-up).

### RFC-003.4 — Admin data integrity and lawyer UX polish (implemented)
**Objective (delivered):** harden admin/lawyer workflows before client-facing booking UI and app shell.

**Delivered scope (summary):** relationship `filterOptions` and server-side validation on Cases/Heirs; case-scoped document pickers on DocumentChecklist and NotaryProcess; testamento guard on intake conversion; `availability-slots` collection and Appointments reschedule rules. Spec/audit/decision archived under `.agents/archive/`.

---

## Next executable phase

### RFC-004 — App shell and UI primitives
- `/app` layout guardrails, role-aware navigation, reusable UI primitives, base dashboard shell.

---

## Subsequent phases (after RFC-004)

### RFC-005 — Onboarding and pre-payment flow
- Welcome eligibility flow, consultation path, intake UI journey, payment-step UX wiring.

### RFC-006 — Client dashboard and timeline
- Case progress visualization and next-action guidance.

### RFC-007 — Case workspace (heirs, assets, documents, payments views)
- Client-facing data entry/management screens connected to existing collections.

### RFC-008 — Lawyer operations and phase execution
- Lawyer dashboard/actions, notary operations, controlled phase advancement endpoints.

### RFC-009 — Communication and automation
- Chat channels, notification hooks, and messaging automation.

### RFC-010 — Public transparency and final QA
- Public case lookup boundary and end-to-end hardening.

---

## Roadmap maintenance protocol

- When an RFC closes, update this roadmap and `PROJECT_STATE` in the same cycle.
- Record numbering or scope changes explicitly; never rely on chat memory alone.
- Keep decision-file IDs and roadmap labels synchronized to avoid executor ambiguity.
