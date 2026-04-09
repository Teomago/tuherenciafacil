# AGENTS.md — Multi-Agent Engineering Pipeline

> RULE ZERO: Read this file before starting any session.

## Shared Engineering Standards (Superpowers)

All agents (Gemini and Claude) MUST adhere to the following standards stored in `.agents/skills/`. Read these files before starting any phase:

1.  **Planning (`planning.md`):** Every implementation plan must be granular, bite-sized, and free of placeholders.
2.  **TDD (`tdd.md`):** No production code without a failing test first. Red-Green-Refactor is mandatory.
3.  **Debugging (`debugging.md`):** No fixes without root cause investigation. Follow the 4-phase process.
4.  **Verification (`verification.md`):** No completion claims without fresh, evidence-based verification.
5.  **Brainstorming (`brainstorming.md`):** No implementation until a design is approved.
6.  **Documentation (`docs.md`):** Use `ctx7` for up-to-date library information.

---

## Roles and Workflow

1.  **Gemini (Designer — Phase 1):**
    - Reads `BACKLOG.md` and `PROJECT_STATE.md`.
    - Follows `brainstorming.md` to refine the feature with Teo.
    - Writes the technical RFC at `.agents/specs/RFC-[N]-[short-name].md`.
    - Does NOT touch source code.

2.  **Claude Code (Auditor — Phase 2):**
    - Reads the active spec in `specs/` and `PROJECT_STATE.md`.
    - Audits the spec against the `tdd.md` and `planning.md` standards.
    - Writes the risk report at `.agents/audits/RFC-[N]-audit.md`.
    - Focuses strictly on: security, Payload RBAC, and architectural bottlenecks.
    - Does NOT touch source code.

3.  **Teo + Claude Code (Decision Draft — Phase 3):**
    - Teo reviews the audit and shares comments.
    - Claude Code drafts `.agents/decisions/RFC-[N]-decision.md`.
    - **CRITICAL:** The decision file MUST be a valid **Implementation Plan** following the `planning.md` format (including TDD test code).
    - Teo approves the final decision file.

4.  **Executor — Gemini or Claude Code (Phase 4):**
    - Reads strictly `.agents/decisions/RFC-[N]-decision.md` and follows it step-by-step.
    - MUST follow the `tdd.md` cycle for every task.
    - After implementation, STOPS and waits for manual QA approval.

5.  **QA Verification (Phase 5):**
    - Teo runs through the success criteria checklist.
    - Follows `verification.md` to ensure evidence-based results.
    - Teo confirms QA passed to Claude Code.

6.  **Cycle Closure (Phase 6):**
    - Executed by Claude Code. Updates `PROJECT_STATE.md`, archives specs, and commits.

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
