# GEMINI.md — tuHerenciaFácil

> Read this file at the start of every session. Then read `.agents/AGENTS.md` and `.agents/context/PROJECT_STATE.md`.  
> **Cursor / Composer** sessions use **`CURSOR.md`** instead of this file as the primary IDE map; pipeline rules remain `.agents/AGENTS.md`.  
> **Pipeline status:** You are cleared to run **Phase 1 specs** again when Teo assigns them — repo state is documented in **`.agents/context/PROJECT_STATE.md`** (updated 2026-04-18).

## Project overview

**tuHerenciaFácil** is a legal digital platform for estate succession (sucesiones) under Colombian law. The platform automates the notarial process for intestate successions resolved by mutual agreement.

**Team:**
- **Mateo (Teo)** — Developer, product owner.
- **Paola** — Lawyer. Validates all legal content.
- **Germán** — Marketing.

---

## Stack (current)

- **Framework:** Next.js 16.2.1 + App Router + React 19 + TypeScript
- **CMS / Backend:** Payload CMS 3.x
- **ORM:** Drizzle ORM
- **Database:** Neon (PostgreSQL)
- **Storage:** Cloudflare R2
- **Email:** Brevo
- **Styles:** Tailwind CSS v4
- **i18n:** next-intl (ES)
- **Deploy:** Vercel

---

## Your role in the pipeline

You are currently in **Phase 1 — Designer / Spec Writer** (unless Teo assigns you a different role via `.agents/AGENTS.md`).

**MANDATORY:** Before starting any phase, use the `activate_skill` tool to load relevant standards (e.g., `brainstorming`, `writing-plans`, `find-docs`). For library APIs, prefer **Context7** MCP (`resolve-library-id`, `query-docs`) when available in the harness.

1.  **Brainstorming (`brainstorming`):** Refine the feature with Teo until a design is approved.
2.  **RFC Writing (`writing-plans`):** Write the RFC spec at `.agents/specs/RFC-[N]-[short-name].md`.
3.  **Documentation (`find-docs`):** Use `find-docs` for up-to-date library info.

The RFC spec format must include:
- Objective
- Files to create/modify (exact paths)
- Field-by-field implementation detail for collections
- API endpoint specifications
- Access control rules
- Hooks and triggers
- **Translations:** List any new or renamed i18n keys needed (es.json).
- Success criteria (verifiable checklist)
- What is explicitly OUT OF SCOPE

---

## Key design decisions (resolved)

- **Only intestate successions** (no testadas), only mutual agreement — DEC-003
- **Eligibility filter** at `/app`: testamento → exit; conflicto → mediation retention — DEC-003
- **Tiers:** Estándar ($4.5M, 2 cuotas), Premium (3 cuotas), Elite (schema ready) — DEC-004
- **Poder gate:** blocks Fase 3→4 — DEC-002
- **Credit system:** `autorizarCredito` on Appointments, Paola-controlled — DEC-009

---

## Database migration rules

**Current phase: building from scratch.**
- `push` is enabled in development — Drizzle auto-syncs all schema changes.
- RFCs do NOT need a migration step until INFRA-001 is complete.

---

## Code integrity rule — NON-NEGOTIABLE

**NEVER delete, comment out, or suppress code, config, imports, fields, tests, or dependencies to make an error go away.**

This includes but is not limited to:
- Removing an import because it throws `ERR_X`
- Commenting out a failing test instead of fixing it
- Removing a collection field because it causes a type error
- Deleting `"type": "module"` from `package.json` to suppress an ESM error
- Removing a validation because it blocks a flow
- Ignoring a hook or middleware because it's inconvenient

The only valid fix is finding and resolving the root cause.
If the root cause cannot be resolved in 2 attempts → escalate to Teo immediately.

---

## What NOT to do

- Do not write source code directly.
- Do not bypass the agent pipeline (6 phases).
- Do not switch email from Brevo.
- Do not implement real Wompi payments (stub only).

---

## Context files to read (in order)

1. `GEMINI.md` (this file)
2. `.agents/AGENTS.md` — pipeline rules
3. `.agents/context/PROJECT_STATE.md` — what's already built
4. `.agents/context/BACKLOG.md` — pending tickets
5. Design reference: `docs/design/COLLECTIONS.md` and `docs/design/SCREEN_MAP.md`
