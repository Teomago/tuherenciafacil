# CLAUDE.md — tuHerenciaFácil

> Read this file at the start of every session. Then read `.agents/AGENTS.md` and `.agents/context/PROJECT_STATE.md`.

## Project overview

**tuHerenciaFácil** is a legal digital platform for estate succession (sucesiones) under Colombian law. The platform automates the notarial process for intestate successions resolved by mutual agreement.

**Team:**
- **Mateo (Teo)** — Developer, product owner. Your primary collaborator.
- **Paola** — Lawyer. Validates all legal content. Manages cases via `/admin`.
- **Germán** — Marketing. Owns the public-facing site and Portal de Transparencia.

---

## Stack (current)

- **Framework:** Next.js 16.2.1 + App Router + React 19 + TypeScript
- **CMS / Backend:** Payload CMS 3.x (collections, access control, hooks, custom endpoints)
- **ORM:** Drizzle ORM
- **Database:** Neon (PostgreSQL) — pooler port 6543, direct port 5432
- **Storage:** Cloudflare R2 (documents, PDFs)
- **Email:** Brevo adapter (SMTP2GO planned post-launch — do NOT switch yet)
- **Payments:** Wompi (not yet implemented — DEC-005 pending)
- **Styles:** Tailwind CSS v4
- **i18n:** next-intl — prefix-free Spanish (default), English deferred
- **Deploy:** Vercel

---

## Agent pipeline (READ THIS)

All implementation goes through `.agents/AGENTS.md`. The pipeline is:

1. **Gemini CLI** — writes RFC spec in `.agents/specs/`
2. **Claude Code (you)** — audits the spec, writes report in `.agents/audits/`
3. **Teo** — reviews audit, writes immutable decision in `.agents/decisions/`
4. **Executor (Antigravity or Claude Code)** — implements from the decision file only
5. **Claude Code (you)** — closes cycle after QA approval

**ZERO code without a decision file in `.agents/decisions/`.** If there's no decision file, do not write implementation code — write the audit instead.

---

## Key design decisions (resolved)

- **Only intestate successions** (no testadas), only mutual agreement (no contencioso) — DEC-003
- **Eligibility filter** at `/app` entry: testamento → exit; conflicto → mediation retention — DEC-003
- **Tiers:** Estándar ($4.5M, 2 cuotas), Premium (3 cuotas, Fase 8 activa), Elite (schema ready, UI backlog) — DEC-004
- **Poder gate:** blocks Fase 3→4 advance until poder is physically received — DEC-002
- **Credit system:** `autorizarCredito` on Appointments — Paola-controlled, never automatic — DEC-009
- **URL structure:** `(app)/app` route group, prefix-free Spanish — DEC-007
- **Elite:** schema implemented in v1, UI deferred — DEC-008
- **Payments (Wompi):** not implemented yet, stub for now — DEC-005 pending

---

## What NOT to do

- Do not switch email from Brevo to SMTP2GO (not yet paid for)
- Do not add EN locale routes (deferred)
- Do not implement Wompi real payments until DEC-005 is approved
- Do not modify files outside the decision file scope
- Do not add features beyond what is explicitly requested
- Do not add comments, docstrings, or type annotations to code you didn't change
- Do not create new files unless absolutely required

---

## Escalate to Teo when

- 2+ failed attempts on the same task
- Any change touching auth, middleware, or Payload config
- Dependency conflicts not resolvable from package.json
- The decision file is ambiguous or missing logic
- Security, RBAC, or legal data integrity is involved

---

## Context files to read (in order)

1. `CLAUDE.md` (this file)
2. `.agents/AGENTS.md` — pipeline rules
3. `.agents/context/PROJECT_STATE.md` — current implementation state
4. `.agents/context/BACKLOG.md` — pending tickets
5. Active RFC decision: `.agents/decisions/RFC-[N]-decision.md` (if exists)
6. Design reference: `docs/design/COLLECTIONS.md` and `docs/design/SCREEN_MAP.md`
