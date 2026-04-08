# AGENTS.md — Multi-Agent Engineering Pipeline

> RULE ZERO: Read this file before starting any session.

## Roles and Workflow

1. **Gemini (Designer — Phase 1):**
   Reads `BACKLOG.md` and `PROJECT_STATE.md`.
   Writes the technical RFC at `.agents/specs/RFC-[N]-[short-name].md`.
   Does NOT touch source code.

2. **Claude Code (Auditor — Phase 2):**
   Reads the active spec in `specs/` and `PROJECT_STATE.md`.
   Writes the risk report at `.agents/audits/RFC-[N]-audit.md`.
   Focuses strictly on: security, Payload RBAC, database mutation
   vulnerabilities, and architectural bottlenecks.
   Does NOT touch source code.

3. **Teo + Claude Code (Decision Draft — Phase 3):**
   Teo reviews the audit and shares his comments and directions.
   Claude Code drafts `.agents/decisions/RFC-[N]-decision.md` based on:
   - The original RFC spec
   - The audit gaps and findings
   - Teo's explicit comments and resolutions
   Claude Code also suggests the best executor (Gemini or Claude Code) with
   technical reasoning (complexity, scope, file access needs).
   Teo makes the final call on the executor and approves the decision file.
   The decision file is immutable once approved — no changes after this point.

4. **Executor — Antigravity or Claude Code (Phase 4):**
   Reads strictly `.agents/decisions/RFC-[N]-decision.md`
   and `.agents/context/PROJECT_STATE.md`.
   Writes the code. Does NOT read `BACKLOG.md` to avoid context pollution.
   After implementation, STOPS and waits for manual QA approval from Teo.

5. **QA Verification (Phase 5):**
   Teo runs through the success criteria checklist in the decision file.
   Each criterion must be manually verified before cycle closure is approved.
   Teo confirms QA passed to Claude Code.

6. **Cycle Closure (post-QA approval — Phase 6):**
   Executed by Claude Code after Teo confirms QA passed:
   1. Update `.agents/context/PROJECT_STATE.md` with what changed.
   2. Move `.agents/specs/RFC-[N]-*.md` → `.agents/archive/specs/`.
   3. Delete `.agents/audits/RFC-[N]-audit.md`.
   4. Delete `.agents/decisions/RFC-[N]-decision.md`.
   5. Commit: `chore: close cycle RFC-[N]`.

---

## Strict Operating Rules

- **Zero code without orders:** Strictly forbidden to modify source code
  without an explicit instruction file in `.agents/decisions/`.
- **Single executor:** Do not operate simultaneously with another agent
  in the same cycle.
- **No improvisation:** Execute exactly what the decision file says.
  If something is not in the decision file, stop and escalate.

---

## Escalation to Claude Chat

Stop IDE execution and escalate to Claude Chat when:

- 2+ failed attempts on the same task.
- Any change touching auth, middleware, or Payload config.
- Dependency conflicts not resolvable from package.json alone.
- The executor would need to invent logic not specified in the decision file.
- Decisions involve security, vulnerabilities, or core legal data logic.

---

## BACKLOG ticket format

Every item in BACKLOG.md must follow this structure:

```
## [TICKET-ID] — Short name
**Priority:** high | medium | low
**Type:** feature | bug | refactor | migration
**Description:** what must exist when this is done
**Success criterion:** verifiable condition
**Dependencies:** what must be completed first
```

---

## Project context

- **Name:** tuherenciafacil
- **Description:** Legal digital platform for estate succession processes
  under Colombian law. A partner lawyer validates all legal content.
- **Stack:** Next.js 16.2.1 App Router + React 19 + TypeScript + Payload CMS 3.x
  - Drizzle ORM + Neon (PostgreSQL) + Cloudflare R2 + Tailwind CSS v4 +
    next-intl (ES default, EN deferred) + Brevo + Vercel
- **Source base:** eterhub (selective copy — not a full migration)
- **Primary language:** Spanish (ES). English (EN) present but deferred.
- **Initialization success criterion:** User logs in → sees clean welcome
  screen "Bienvenido [user]" → initialization complete. No Miru. No finance.
