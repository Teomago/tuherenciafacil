# PROJECT_STATE

## Last updated: 2026-04-28 (reconciled: codebase + RFC artifacts + MemPalace gap noted)

> **Single source of truth for implementation status.** Design intent lives in `docs/design/` (may lag the repo — see reconciliation below). **New** RFC specs/audits/decisions land in `.agents/specs/`, `.agents/audits/`, `.agents/decisions/`; **closed** RFC artifacts live under `.agents/archive/{specs,audits,decisions}/`. In-app team docs (UI) live under `src/app/docs/`.

> **MemPalace:** Semantic search can still return **older** snapshots (e.g. “RFC-003.3 next”, pre-archive paths). When MemPalace and this file disagree, **treat this file + git tree as canonical**, then refresh the palace (diary + your indexing workflow) in the same cycle.

---

## Documentation map (where to look)

| Location | Purpose |
|----------|---------|
| **`docs/design/`** | Canonical product/design: `COLLECTIONS.md`, `SCREEN_MAP.md`, diagrams — **what** the product should be. |
| **`src/app/docs/`** | Internal **web** documentation (password-gated) for the team — **explains** the product in the browser. |
| **`.agents/`** | **How** we build: RFCs, audits, **decisions** (mandatory before code), pipeline rules; **`.agents/archive/`** holds closed RFC specs/audits/decisions. |
| **`.agents/context/ROADMAP.md`** | Chronological execution guide for executors (phases, RFC IDs). |
| **`CURSOR.md`**, **`CLAUDE.md`**, **`GEMINI.md`** | Per-tool entry points; pipeline rules remain **`.agents/AGENTS.md`**. |

---

## RFC artifacts vs implementation (quick index)

| RFC | Spec | Audit | Decision | Repo status |
|-----|------|-------|----------|-------------|
| 003.1 | `.agents/archive/specs/RFC-003.1-core-identity-maintenance.md` | `.agents/archive/audits/RFC-003.1-audit.md` | `.agents/archive/decisions/RFC-003.1-decision.md` | Implemented |
| 003.2 | `.agents/archive/specs/RFC-003.2-intake-heirs-assets.md` | `.agents/archive/audits/RFC-003.2-audit.md` | `.agents/archive/decisions/RFC-003.2-decision.md` | Implemented |
| 003.3 | `.agents/archive/specs/RFC-003.3-workflow-engine.md` | `.agents/archive/audits/RFC-003.3-audit.md` | `.agents/archive/decisions/RFC-003.3-decision.md` | Implemented |
| 003.4 | `.agents/archive/specs/RFC-003.4-admin-data-integrity.md` | `.agents/archive/audits/RFC-003.4-audit.md` (+ execution review) | `.agents/archive/decisions/RFC-003.4-decision.md` | Implemented |
| **004** | *(pending — Gemini Phase 1)* | — | — | **Next** |

---

## Reconciliation notes (2026-04-28)

| Source | Role | Drift risk |
|--------|------|------------|
| **`src/payload/collections/index.ts`** | Canonical list of registered Payload collections | Low |
| **`docs/design/COLLECTIONS.md`** | Domain definition + future collections | **High** — summary table still shows many rows as “CREAR”; backend for core succession collections is already in the repo. Use this file for field semantics, not “implemented/not” status. |
| **`docs/design/SCREEN_MAP.md`** | Target UX / route map | **Medium** — was written before `(app)/app` stub; updated note should match `src/app/[locale]/(app)/`. |
| **MemPalace `tuherenciafacil` wing** | Cross-session memory | **High** until re-indexed — may echo old `PROJECT_STATE` or roadmap ordering. |

---

## Stack (verified from `package.json`)

- **Framework:** Next.js 16.2.3 + App Router + React 19.2.5 + TypeScript 5.7.3  
- **CMS:** Payload CMS 3.84.1  
- **ORM:** Drizzle ORM  
- **Database:** Neon (PostgreSQL) — use **direct** connection (port 5432) for tests when DDL/schema pull runs; see `vitest.setup.ts` (`DATABASE_URI_DIRECT`).  
- **Storage:** Cloudflare R2 (S3 adapter)  
- **Email:** Brevo  
- **Deploy:** Vercel  

---

## RFC-003 split (collections layer)

RFC-003 was split into delivery slices (003.4 is an additional hardening slice after 003.3):

| Slice | Scope (summary) | Decision file (archived) | Status |
|-------|-----------------|--------------------------|--------|
| **RFC-003.1** | Members refinement, **Cases**, **Appointments**, credit hook (`creditoAcumulado` / `autorizarCredito`) | `.agents/archive/decisions/RFC-003.1-decision.md` | **Implemented** in `src/payload/collections/` + hooks/tests |
| **RFC-003.2** | **CaseIntake**, **Heirs**, **Assets**, intake → case conversion (`convertIntake` endpoint) | `.agents/archive/decisions/RFC-003.2-decision.md` | **Implemented** — collections registered; `POST` **`/api/succession/convert-intake`** (Payload custom route; path configured in `payload.config.ts`) |
| **RFC-003.3** | **Documents** (uploads/R2), **DocumentChecklist** engine, **NotaryProcess**, phase engine hooks, **Payments** + Wompi (DEC-005) | `.agents/archive/decisions/RFC-003.3-decision.md` | **Implemented** (S3 config, checkpoints, validation, tests passed out of sandbox) |
| **RFC-003.4** | Admin data integrity (`filterOptions` + hooks), case-scoped document pickers, intake testamento guard, **availability-slots** + appointment reschedule rules | `.agents/archive/decisions/RFC-003.4-decision.md` | **Implemented** (collections/hooks/tests; see archive spec/audit) |

**Design doc note:** `docs/design/COLLECTIONS.md` still lists several collections as “CREAR” for the **full** v1 vision. After RFC-003.3, treat that table as partially stale and update “Estado” in a dedicated docs pass.

---

## Canonical RFC sequence (frozen baseline)

This project is currently locked to the **repo-current numbering**:

1. **RFC-003.1** — implemented  
2. **RFC-003.2** — implemented  
3. **RFC-003.3** — implemented (data/workflow domain)  
4. **RFC-003.4** — implemented (admin integrity + scheduling primitives)  
5. **RFC-004** — next (app shell + primitives)  
6. **RFC-005** — onboarding/pre-payment screens  

If a meeting introduces a renamed/shifted RFC chain, record it in a dedicated planning decision first. Do not silently change numbering in execution files.

---

## Stabilization since RFC-003.2

Post-`RFC-003.2` work on `main` was stabilization, not a new RFC cycle:

- Build/deploy hardening for Next/Vercel module compatibility (`ERR_REQUIRE_ESM` path).
- URL normalization and config cleanup (`NEXT_PUBLIC_SERVER_URL`, single Next config baseline).
- Access-control hardening for admin/staff and members management paths.
- Members deletion safety hook to clear succession references before delete, avoiding PostgreSQL transaction abort cascades.

These fixes are considered **platform hardening** and should be referenced by future RFCs as baseline assumptions.

---

## Implemented Payload collections (current)

**Content:** `articles`, `media`, `pages`  
**Settings:** `members` (auth product users), `users` (admin), `invitation-codes`  
**System:** `tags`  
**Succession:** `cases`, `appointments`, `availability-slots`, `case-intakes`, `heirs`, `assets`, `documents`, `document-checklists`, `notary-process`, `payments`  

**Not yet implemented** (per design / RFC-004+): e.g. `chat-messages` — see `docs/design/COLLECTIONS.md` and `ROADMAP.md`.

---

## App routes (high level)

- Marketing + CMS-driven pages: `/[locale]/[[...segments]]`  
- **Client app (member):** route group `src/app/[locale]/(app)/` — entry screen at **`/[locale]/app`** (`app/page.tsx`); inactive lawyers → **`/[locale]/pending-activation`**.  
- Auth: login, register, forgot/reset password (see `[locale]/(auth)/` and related)  
- **Admin:** `/admin`  
- **Internal docs (UI):** `/docs` (see `src/app/docs/`)  

**Not yet implemented:** nested routes under `/app` from `SCREEN_MAP.md` (consulta, dashboard, caso/[id], etc.) — **RFC-004** (shell) then **RFC-005+** (funnels and workspace).

---

## Tooling health (last verification session)

| Command | Result |
|---------|--------|
| `pnpm build` | **Passes** |
| `pnpm exec eslint . --quiet` | **Passes** (zero errors; full lint may still report **warnings**, e.g. `no-explicit-any` in legacy/tests) |
| `pnpm test:int` | **Passes in non-sandboxed/network-enabled runs** with valid `DATABASE_URI` / `DATABASE_URI_DIRECT`; this suite depends on live Neon connectivity and can fail in sandboxed environments due to DNS/network restrictions. |
| `pnpm exec vitest run tests/unit` | **Passes** |

---

## Completed cycles (recent)

- **RFC-001 / RFC-002 / design finalization** — see archived specs and older bullets in git history.  
- **RFC-003.1** — Members / Cases / Appointments + credit behavior (see succession folders + unit/int tests).  
- **RFC-003.2** — CaseIntake, Heirs, Assets + convert-intake handler.  
- **RFC-003.3** — Documents (S3), DocumentChecklists, NotaryProcess, Payments foundation, and advancePhase endpoint. Verification tests 100% passed.  
- **RFC-003.4** — Relationship filtering and server-side validation on Cases/Heirs, case-scoped document pickers, convert-intake testamento guard, availability slots and reschedule rules. See `.agents/archive/decisions/RFC-003.4-decision.md`.

---

## What needs to happen next (priority)

1. **RFC-004** — app shell/UI primitives (`/app/dashboard` scaffold, role-aware layout, core design tokens).  
2. **RFC-005** — onboarding/pre-payment funnel screens (domain contracts stable post RFC-003.3/003.4).  
3. **PROJECT_STATE hygiene** — update this file at **Phase 6** of every merged RFC (or weekly during sprints).  
4. **INFRA-001** — separate Neon dev/prod branches when approaching production hardening (`BACKLOG.md`).  

---

## RFC-003.3 closure notes

- Implemented collections: `documents`, `document-checklists`, `notary-process`, `payments`.
- Implemented guarded phase advancement endpoint: `POST /api/cases/:id/advance-phase`.
- Applied phase-gate completion semantics:
  - `estandar` closes at phase 7 after signature requirements.
  - `premium` / `elite` can advance to phase 8 and close once `registro.status === 'registrado'`.
- Verification script exists at `src/scripts/verify-rfc-003.3.ts`.

---

## MemPalace sync protocol (mandatory)

- **Before drafting each RFC decision:** run `mempalace_status` and focused `mempalace_search`.
- **After scope is approved (pre-implementation):** write one canonical `mempalace_diary_write` entry documenting scope and executor.
- **After merge/closure:** update `PROJECT_STATE.md` first, then write diary and run repository memory mining so indexed drawers align with **archive paths** and current RFC sequence.
- **If search still shows superseded facts** (old “next RFC”, old `.agents/decisions/RFC-003.3-*` paths): trust **git + `PROJECT_STATE.md`**; refresh indexing per your MemPalace workflow.

---

## Multi-tool agents

Work may run in **Cursor**, **Gemini CLI**, or **Google Antigravity**. Shared rules: **`.agents/AGENTS.md`**, **`.cursor/rules/multi-agent-tooling.mdc`**, **`CURSOR.md`**. **Gemini** is back in the pipeline for Phase 1 specs when you enable it — same repo, same decisions folder.
