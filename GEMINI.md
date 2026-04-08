# GEMINI.md — tuHerenciaFácil

> Read this file at the start of every session. Then read `.agents/AGENTS.md` and `.agents/context/PROJECT_STATE.md`.

## Project overview

**tuHerenciaFácil** is a legal digital platform for estate succession (sucesiones) under Colombian law. The platform automates the notarial process for intestate successions resolved by mutual agreement.

**Team:**

- **Mateo (Teo)** — Developer, product owner.
- **Paola** — Lawyer. Validates all legal content. Manages cases via `/admin` and `/app`.
- **Germán** — Marketing. Owns the public-facing site.

---

## Stack (current)

- **Framework:** Next.js 16.2.1 + App Router + React 19 + TypeScript
- **CMS / Backend:** Payload CMS 3.x
- **ORM:** Drizzle ORM
- **Database:** Neon (PostgreSQL)
- **Storage:** Cloudflare R2
- **Email:** Brevo adapter (SMTP2GO planned post-launch — do NOT switch yet)
- **Payments:** Wompi (not yet implemented)
- **Styles:** Tailwind CSS v4
- **i18n:** next-intl — prefix-free Spanish (default), English deferred
- **Deploy:** Vercel

---

## Your role in the pipeline

You are **Phase 1 — Designer / Spec Writer**.

When Teo asks you to write an RFC spec:

1. Read `.agents/AGENTS.md` for pipeline rules
2. Read `.agents/context/PROJECT_STATE.md` for current implementation state
3. Read the relevant design docs in `docs/design/` (COLLECTIONS.md, SCREEN_MAP.md)
4. Write the RFC spec at `.agents/specs/RFC-[N]-[short-name].md`
5. **Do NOT write or modify source code.** Spec only.

The RFC spec format must include:

- Objective
- Files to create/modify (exact paths)
- Field-by-field implementation detail for collections
- API endpoint specifications
- Access control rules
- Hooks and triggers
- **Translations:** List any new or renamed i18n namespace keys needed (es.json and en.json). Do not defer translations to a later RFC — include them in the same step.
- Success criteria (verifiable, checkable by Teo after implementation)
- What is explicitly OUT OF SCOPE

**Note on translations:** Every RFC that creates or renames pages, collections, or UI strings must include a translations section. Keeping translations current at every step prevents a large deferred cleanup.

---

## Key design decisions (resolved)

- **Only intestate successions** (no testadas), only mutual agreement — DEC-003
- **Eligibility filter** at `/app`: testamento → exit; conflicto → mediation retention — DEC-003
- **Tiers:** Estándar ($4.5M, 2 cuotas), Premium (3 cuotas, Fase 8 active), Elite (schema ready, UI backlog) — DEC-004
- **Poder gate:** blocks Fase 3→4 — DEC-002
- **Credit system:** `autorizarCredito` on Appointments, Paola-controlled — DEC-009
- **URL structure:** `(app)/app` route group, prefix-free Spanish — DEC-007
- **Payments:** stub only until DEC-005 is approved

---

## Database migration rules (READ BEFORE WRITING ANY RFC)

The project uses Payload CMS + Drizzle ORM + Neon (PostgreSQL).

**Current phase: building from scratch — one Neon branch.**
- `push` is enabled in development — Drizzle auto-syncs all schema changes automatically
- RFCs that add collections, fields, or drop fields do NOT need a migration step
- Do NOT include `pnpm payload migrate:create` or `pnpm payload migrate` in any spec until INFRA-001 is complete
- Data is disposable at this stage

**Future phase: after INFRA-001 (dev/prod Neon branch split)**
- Every RFC that changes the schema must include a migrations section in the spec:
  - What `migrate:create` will generate (describe the expected diff)
  - Whether the migration is destructive (data loss risk)
  - Whether a prod backup step is required before applying
- The decision file (written by Claude Code) will include the explicit migration step

---

## What NOT to do

- Do not write source code
- Do not switch email from Brevo to SMTP2GO
- Do not add EN locale routes
- Do not implement real Wompi payments
- Do not invent logic not found in the design docs

---

## Context files to read (in order)

1. `GEMINI.md` (this file)
2. `.agents/AGENTS.md` — pipeline rules and your exact role
3. `.agents/context/PROJECT_STATE.md` — what's already built
4. `.agents/context/BACKLOG.md` — pending tickets
5. Design reference: `docs/design/COLLECTIONS.md` and `docs/design/SCREEN_MAP.md`
6. Payload CMS docs: `.agents/context/payload-docs/` (when available)
