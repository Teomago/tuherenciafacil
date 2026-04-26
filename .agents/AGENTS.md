# AGENTS.md — Multi-Agent Engineering Pipeline

> **RULE ZERO:** Read this file before starting any session.

## Absolute rule — before any action

**Read `.agents/standards/NO-ERROR-SUPPRESSION.md` now. It is not optional.**

No agent may use `@ts-ignore`, `@ts-expect-error`, `as any`, `eslint-disable`, commented-out tests, or semantic placeholders to green a build. If you cannot resolve an error in **two** serious attempts → escalate to **Teo** with the **exact** error text. **Suppressing an error is not a fix.**

**Agent entry points:** **Cursor / Composer** → `CURSOR.md`. **Claude Code** → `CLAUDE.md`. **Gemini CLI** → `GEMINI.md`. **Google Antigravity** → `ANTIGRAVITY.md`. Pipeline rules are always **this file** (`.agents/AGENTS.md`).

## Shared engineering standards (Superpowers + tools)

All agents (Gemini, Claude, Cursor, or any future tool) MUST follow these standards. They ship as **skills** in your environment:

- **Gemini CLI:** use `activate_skill` when the harness supports it.
- **Cursor:** open the matching `SKILL.md` with the **Read** tool (or your editor’s skill picker) **before** the phase that needs it — same discipline, different invocation.
- **Antigravity:** use native skills in `.agents/skills/` and keep skill names aligned with this file.

1.  **Planning (`writing-plans`):** Every implementation plan must be granular, bite-sized, and free of placeholders.
2.  **TDD (`test-driven-development`):** No production code without a failing test first. Red-Green-Refactor is mandatory.
3.  **Debugging (`systematic-debugging`):** No fixes without root-cause investigation. Follow the 4-phase process.
4.  **Verification (`verification-before-completion`):** No completion claims without fresh, evidence-based verification.
5.  **Brainstorming (`brainstorming`):** No implementation until a design is approved.
6.  **Library docs:** Use the **Context7** MCP (`resolve-library-id`, `query-docs`) for Next.js / Payload / React APIs when the decision file does not already pin the answer. Use **`find-docs`** if your skill set maps that name to the same workflow.
7.  **UI quality:** Use **frontend-design** when building or substantially changing user-facing UI.
8.  **Memory:** Use **MemPalace** (`mempalace_status`, `mempalace_search`) before asserting project history, decisions, or people — storage is not memory; **search first** (see `CURSOR.md` § MemPalace).

---

## Cross-agent execution protocol (mandatory)

These rules apply to **all agents**, regardless of company/model origin.

1. **Single source policy:** process-critical rules are anchored in this file. Context docs are extensions, not replacements.
2. **Verification gate:** no RFC may be declared complete without evidence-based verification.
   - Baseline template: `.agents/context/RFC-VERIFICATION-SKELETON.md`
   - Each RFC must include this baseline plus RFC-specific checks.
3. **Scope lock:** each decision file must include explicit **in-scope/out-of-scope** boundaries.
4. **No scope bleed:** if execution requires behavior outside decision scope, stop and escalate to Teo.
5. **MemPalace checkpoints are required:**
   - Before drafting an RFC decision: `mempalace_status` + focused `mempalace_search`.
   - After scope approval, before implementation: one canonical `mempalace_diary_write` entry.
   - After RFC merge/closure: update context docs, then write diary + run repository mining.

### Required process attachments

- `.agents/context/RFC-VERIFICATION-SKELETON.md`
- `.agents/context/MEMPALACE_RFC_PROTOCOL.md`
- `.agents/context/ROADMAP_PROJECT_STATE_SYNC_CHECKLIST.md`

---

## Roles and Workflow (Agent-Agnostic)

The pipeline is divided into 6 phases, each with a clear responsibility. Any capable agent can take any role as directed by Teo.

1.  **Phase 1: Specification (Role: Designer)**
    - Reads `BACKLOG.md` and `PROJECT_STATE.md`.
    - Follows the `brainstorming` skill to refine the feature with Teo.
    - Writes the technical RFC at `.agents/specs/RFC-[N]-[short-name].md`.
    - Does NOT touch source code.

2.  **Phase 2: Audit (Role: Auditor)**
    - Reads the active RFC and `PROJECT_STATE.md`.
    - Audits the RFC against TDD, Planning, and security standards.
    - Writes the risk report at `.agents/audits/RFC-[N]-audit.md`.
    - **Teo's Feedback:** Teo reviews the audit and adds comments (accept/reject/modify).

3.  **Phase 3: Decision (Role: Auditor + Designer + Teo)**
    - **Auditor:** Drafts `.agents/decisions/RFC-[N]-decision.md` integrating Teo's feedback.
    - **Designer:** Performs a "soft review" of the decision file to ensure it doesn't break the original design intent.
    - **Decision Content:** MUST be a valid **Implementation Plan** following the `writing-plans` format (including TDD test code).
    - **Teo:** Provides final approval.

4.  **Phase 4: Execution (Role: Executor)**
    - Follows strictly the steps in `.agents/decisions/RFC-[N]-decision.md`.
    - MUST follow the `test-driven-development` cycle for every task.
    - After implementation, STOPS and waits for Phase 5.

5.  **Phase 5: QA Verification (Role: QA + Teo)**
    - QA Agent runs the success criteria checklist.
    - Follows the `verification-before-completion` skill to ensure evidence-based results.
    - Teo confirms QA passed.

6.  **Phase 6: Cycle Closure (Role: Administrator)**
    - Updates `PROJECT_STATE.md`, archives specs, and commits changes.

---

## Strict Operating Rules

- **Zero code without orders:** Forbidden to modify source code without an explicit instruction file in `.agents/decisions/`.
- **Single executor per task:** Do not operate simultaneously with another agent in the same cycle on the same files.
- **No improvisation:** Execute exactly what the decision file says. If something is missing, stop and escalate.

### Code integrity rule — NON-NEGOTIABLE

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

## Escalation Protocol

Stop execution and escalate to Teo when:
- 2+ failed attempts on the same task.
- Any change touching core auth, sensitive data, or legal logic.
- The executor needs to invent logic not specified in the decision file.

---

## BACKLOG ticket format

Every item in `BACKLOG.md` must follow this structure:
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
- **Description:** Legal digital platform for estate succession processes under Colombian law.
- **Stack:** Next.js 16.2.1 App Router + React 19 + TypeScript + Payload CMS 3.x
- **Primary language:** Spanish (ES).
