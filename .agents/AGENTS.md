# AGENTS.md — Multi-Agent Engineering Pipeline

> RULE ZERO: Read this file before starting any session.

## Shared Engineering Standards (Superpowers)

All agents (Gemini, Claude, or any future AI) MUST adhere to the following standards. These are globally available as skills. Invoke them using `activate_skill` before starting any phase:

1.  **Planning (`writing-plans`):** Every implementation plan must be granular, bite-sized, and free of placeholders.
2.  **TDD (`test-driven-development`):** No production code without a failing test first. Red-Green-Refactor is mandatory.
3.  **Debugging (`systematic-debugging`):** No fixes without root cause investigation. Follow the 4-phase process.
4.  **Verification (`verification-before-completion`):** No completion claims without fresh, evidence-based verification.
5.  **Brainstorming (`brainstorming`):** No implementation until a design is approved.
6.  **Documentation (`find-docs`):** Use the `find-docs` skill for up-to-date library information.

---

## Roles and Workflow (Agent-Agnostic)

The pipeline is divided into 6 phases, each with a clear responsibility. Any capable agent can take any role as directed by Teo.

1.  **Phase 1: Specification (Role: Designer)**
    - Reads `BACKLOG.md` and `PROJECT_STATE.md`.
    - Follows `brainstorming.md` to refine the feature with Teo.
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
    - **Decision Content:** MUST be a valid **Implementation Plan** following the `planning.md` format (including TDD test code).
    - **Teo:** Provides final approval.

4.  **Phase 4: Execution (Role: Executor)**
    - Follows strictly the steps in `.agents/decisions/RFC-[N]-decision.md`.
    - MUST follow the `tdd.md` cycle for every task.
    - After implementation, STOPS and waits for Phase 5.

5.  **Phase 5: QA Verification (Role: QA + Teo)**
    - QA Agent runs the success criteria checklist.
    - Follows `verification.md` to ensure evidence-based results.
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
