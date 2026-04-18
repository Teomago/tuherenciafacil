# PROJECT_STATE

## Last updated: 2026-04-18

> **Single source of truth for implementation status.** Design intent lives in `docs/design/`; execution contracts live in `.agents/specs/`, `.agents/audits/`, `.agents/decisions/`. In-app team docs (UI) live under `src/app/docs/`.

---

## Documentation map (where to look)

| Location | Purpose |
|----------|---------|
| **`docs/design/`** | Canonical product/design: `COLLECTIONS.md`, `SCREEN_MAP.md`, diagrams — **what** the product should be. |
| **`src/app/docs/`** | Internal **web** documentation (password-gated) for the team — **explains** the product in the browser. |
| **`.agents/`** | **How** we build: RFCs, audits, **decisions** (mandatory before code), pipeline rules. |
| **`.agents/context/ROADMAP.md`** | Chronological execution guide for executors (phases, RFC IDs). |
| **`CURSOR.md`**, **`CLAUDE.md`**, **`GEMINI.md`** | Per-tool entry points; pipeline rules remain **`.agents/AGENTS.md`**. |

---

## Stack (verified from `package.json`)

- **Framework:** Next.js 16.2.3 + App Router + React 19.2.5 + TypeScript 5.7.3  
- **CMS:** Payload CMS 3.82.x  
- **ORM:** Drizzle ORM  
- **Database:** Neon (PostgreSQL) — use **direct** connection (port 5432) for tests when DDL/schema pull runs; see `vitest.setup.ts` (`DATABASE_URI_DIRECT`).  
- **Storage:** Cloudflare R2 (S3 adapter)  
- **Email:** Brevo  
- **Deploy:** Vercel  

---

## RFC-003 split (collections layer)

RFC-003 was split into three delivery slices:

| Slice | Scope (summary) | Decision file | Status |
|-------|-----------------|---------------|--------|
| **RFC-003.1** | Members refinement, **Cases**, **Appointments**, credit hook (`creditoAcumulado` / `autorizarCredito`) | `.agents/decisions/RFC-003.1-decision.md` | **Implemented** in `src/payload/collections/` + hooks/tests |
| **RFC-003.2** | **CaseIntake**, **Heirs**, **Assets**, intake → case conversion (`convertIntake` endpoint) | `.agents/decisions/RFC-003.2-decision.md` | **Implemented** — collections registered; `POST` **`/api/succession/convert-intake`** (Payload custom route; path configured in `payload.config.ts`) |
| **RFC-003.3** | **Documents** (uploads/R2), **DocumentChecklist** engine, **NotaryProcess**, phase engine hooks, **Payments** + Wompi (DEC-005) | *Decision file not created in repo yet — see `ROADMAP.md` Phase 4* | **Not started** (next major data milestone) |

**Design doc note:** `docs/design/COLLECTIONS.md` still lists several collections as “CREAR” for the **full** v1 vision. After RFC-003.2, treat that table as **partially** delivered — update that file in a future doc pass so “Estado” reflects RFC-003.1 / .2 / .3.

---

## Implemented Payload collections (current)

**Content:** `articles`, `media`, `pages`  
**Settings:** `members` (auth product users), `users` (admin), `invitation-codes`  
**System:** `tags`  
**Succession:** `cases`, `appointments`, `case-intakes`, `heirs`, `assets`  

**Not yet implemented** (per design / RFC-003.3+): e.g. `document-checklists`, dedicated `documents` collection (beyond `media`), `notary-process`, `payments`, `chat-messages` — see `docs/design/COLLECTIONS.md` and `ROADMAP.md`.

---

## App routes (high level)

- Marketing + CMS-driven pages: `/[locale]/[[...segments]]`  
- **Client app stub:** `/[locale]/app` — welcome + logout; inactive lawyers → `/[locale]/pending-activation`  
- Auth: login, register, forgot/reset password  
- **Admin:** `/admin`  
- **Internal docs (UI):** `/docs` (see `src/app/docs/`)  

**Not yet implemented:** full `/app/*` funnel from `SCREEN_MAP.md` (consulta, intake UI, dashboard, etc.) — tracked in later RFCs (e.g. RFC-004+ per `ROADMAP.md`).

---

## Tooling health (last verification session)

| Command | Result |
|---------|--------|
| `pnpm build` | **Passes** |
| `pnpm exec eslint . --quiet` | **Passes** (zero errors; full lint may still report **warnings**, e.g. `no-explicit-any` in legacy/tests) |
| `pnpm test:int` | **Requires** valid `DATABASE_URI` / `DATABASE_URI_DIRECT` and stable DB; suite uses **serial** file execution (`vitest.config.mts`: `fileParallelism: false`, extended hooks). Cleanup in int tests is **scoped** to fixture data (no global “delete all appointments”). Last run: **27 passed** (7 files). |
| `pnpm exec vitest run tests/unit` | **Passes** |

---

## Completed cycles (recent)

- **RFC-001 / RFC-002 / design finalization** — see archived specs and older bullets in git history.  
- **RFC-003.1** — Members / Cases / Appointments + credit behavior (see succession folders + unit/int tests).  
- **RFC-003.2** — CaseIntake, Heirs, Assets + convert-intake handler.  

---

## What needs to happen next (priority)

1. **RFC-003.3** — Spec + audit + **decision** file, then implementation: documents, checklist engine, notary tracking, phase engine, payments (Wompi gated on DEC-005).  
2. **App shell / UI** — `ROADMAP.md` Phase 2 (RFC-004) — layout, primitives, `/app/dashboard` shell.  
3. **Onboarding funnel UI** — RFC-005 screens when data layer supports them.  
4. **PROJECT_STATE hygiene** — update this file at **Phase 6** of every merged RFC (or weekly during sprints).  
5. **INFRA-001** — separate Neon dev/prod branches when approaching production hardening (`BACKLOG.md`).  

---

## Multi-tool agents

Work may run in **Cursor**, **Gemini CLI**, or **Google Antigravity**. Shared rules: **`.agents/AGENTS.md`**, **`.cursor/rules/multi-agent-tooling.mdc`**, **`CURSOR.md`**. **Gemini** is back in the pipeline for Phase 1 specs when you enable it — same repo, same decisions folder.
