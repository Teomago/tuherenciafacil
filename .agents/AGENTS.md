# AGENTS.md — Multi-Agent Engineering Pipeline

> **RULE ZERO:** Read this file before starting any session.

## Absolute rule — before any action

1. **Read `.agents/standards/NO-ERROR-SUPPRESSION.md`.** It is not optional.
2. **Bootloader:** Activate/Load the `using-superpowers` skill immediately. This establishes the protocol for task tracking and skill discovery for the session.

---

## Canonical RFC pipeline (single bulletproof path)

Every feature or material change that requires an RFC follows **one** sequence. No shortcuts on audits or verification.

```text
Spec → Audit prep → Spec audit (adversarial) → Decision (Teo-approved) → Execute (TDD) → Testing & evidence → Execution audit (post-implementation) → [pass: Closure] | [fail: New executor + fix loop → re-test → re-audit] → Closure
```

**Artifacts (in order):**

1. `.agents/specs/RFC-XXX-….md` — specification
2. *(Optional internal)* hostile checklist from audit prep (can live in spec appendix or `.agents/audits/…` draft notes)
3. `.agents/audits/RFC-XXX-audit.md` — adversarial audit of the **spec** (and readiness for TDD)
4. `.agents/decisions/RFC-XXX-decision.md` — **only** execution contract after Teo approval
5. Implementation in repo (scope = decision file only)
6. Evidence packet: commands run, exit codes, relevant output (paste or log reference)
7. `.agents/audits/RFC-XXX-execution-review.md` *(or equivalent section in audit file)* — adversarial review of **implementation vs decision**
8. Updated `.agents/context/PROJECT_STATE.md`, `.agents/context/ROADMAP.md` when applicable; MemPalace diary + mine per existing protocol

**Execution-audit failure → executor swap**

- If the execution audit **fails**, the **original executor does not** own the fix loop alone.
- A **different** executor (different session/agent) addresses **only** the numbered findings from the execution audit, within scope Teo confirms.
- **Default:** one swap round; if still blocked → **escalate to Teo** (ambiguous decision, wrong assumption, or RFC split needed).

---

## Audit format standard (mandatory for phases 2b and 6)

All audit files (`.agents/audits/RFC-XXX-audit.md` and `.agents/audits/RFC-XXX-execution-review.md`) **must** follow this structure. No ad-hoc formats.

**Method:** Adversarial — the spec (or implementation) is assumed **wrong** until verified against source code, decisions, and library docs.

**Severity legend (use exactly these labels):**

| Severity | ID prefix | Meaning |
|---|---|---|
| **BLOCKING** | `B-N` | Decision file cannot be drafted safely (spec audit) or merge cannot proceed (execution audit) until resolved |
| **HIGH** | `H-N` | Likely runtime bug, security gap, data integrity issue, or executor ambiguity |
| **MEDIUM** | `M-N` | Wrong output, weak verification, or maintainability risk |
| **LOW** | `L-N` | Cosmetic or future-proofing issue |

**Required sections (in order):**

1. **Header** — Auditor, method, date, spec/decision reference, verdict (`PASS`, `BLOCKED`, or `CONDITIONAL PASS — N issues`)
2. **Audit Inputs** — Every file, decision, doc, and external source consulted (Context7 queries, MemPalace searches)
3. **Severity Legend** — The table above, copied verbatim
4. **Domain Sections** — Findings organized by domain area (e.g., "Section 1 — Cases", "Section 2 — Heirs"). Each finding has:
   - ID and severity in the heading (e.g., `### BLOCKING B-1: …` or `### HIGH H-3: …`)
   - "Spec says" / "Current code" / "Problem" / "Required fix for decision file"
5. **Summary Table** — All findings in one table: `| ID | Severity | Area | Issue |`
6. **Recommended Path Forward** — Ordered list of what must happen before the next phase
7. **Teo Feedback Resolution Addendum** — Added after Teo reviews; documents each resolution with the finding ID

**Verdict rules:**

- Any **BLOCKING** item → verdict is `BLOCKED`
- Only **HIGH/MEDIUM/LOW** items → verdict is `CONDITIONAL PASS`
- All items resolved in Teo review → append "Ready for Decision (Phase 3)" or "Ready for Merge (Phase 8)"
- Zero findings → verdict is `PASS` (rare — adversarial audits almost always find something)

---

## Phase-by-phase ownership

| Phase | Name | Owner role | Primary tool | Primary model / mode | Required skills (in order) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Specification | Designer | **Gemini CLI** | Auto Gemini 3 **or** manual `gemini 3.1 pro-preview` | `brainstorming` → `writing-plans` → `find-docs` |
| **2a** | Audit preparation | Designer / Auditor prep | **Gemini CLI** | Same as phase 1, or `gemini 3 flash-preview` for shorter RFCs | `writing-plans` |
| **2b** | Specification audit | Auditor | **Antigravity** | **Claude Sonnet 4.6 (Thinking)** | `writing-plans` → `receiving-code-review` (adversarial mindset) |
| **3** | Decision | **Teo** + assistant | **Antigravity** | **Claude Sonnet 4.6 (Thinking)** (or **Opus 4.6** for high-risk decisions) | `writing-plans` |
| **4** | Execution | Executor | **Cursor** | Composer/Agent default coding model | `executing-plans` → `test-driven-development` |
| **5** | Testing & evidence | QA | **Antigravity** *or* **local terminal** | **Claude Sonnet 4.6 (Thinking)** *or* **Gemini 3 Flash** (runner) + **Gemini CLI** to format logs | `verification-before-completion` |
| **5b** | Evidence formatting *(optional sub-step)* | QA | **Gemini CLI** | `gemini 3 flash-preview` **or** `gemini 2.5 flash` | — |
| **6** | Execution audit | Reviewer | **Antigravity** | **Claude Opus 4.6 (Thinking)** *if quota allows*; else **Sonnet** | `receiving-code-review` → `systematic-debugging` |
| **7** | Remediation *(if phase 6 fails)* | **New** executor | **Cursor** | ≥ phase 4 strength; **not** the same session as phase 4 | `test-driven-development` → `verification-before-completion` |
| **8** | Cycle closure | Admin | **Antigravity** *or* **Gemini CLI** | **Gemini 3 Flash** / **Sonnet** (light) for drafts | `finishing-a-development-branch` → `verification-before-completion` |

**Teo** is the human gate for phase **3** and for **scope** on phase **7**. Agents propose; Teo approves or rejects.

---

## Fallback matrix (when primary tool or quota is unavailable)

| Phase | If primary is blocked | First fallback | Second fallback |
| :--- | :--- | :--- | :--- |
| **1** | Gemini CLI capped | `gemini 2.5 pro` (manual) | Narrow spec in **Cursor** (short context only) |
| **2a** | Gemini CLI unavailable | **Cursor** checklist from spec | Defer until CLI available |
| **2b** | Antigravity Claude exhausted | **Antigravity** **Gemini 3.1 pro High** + **mandatory checklist** from phase 2a | **Cursor** adversarial audit (**narrow** file list + checklist) |
| **3** | Antigravity Claude exhausted | **Antigravity** **Gemini 3.1 pro High** as drafting fallback — Teo must verify every task | **Cursor** strong model as emergency fallback — Teo must finalize |
| **4** | — | Escalate to Teo after **2** failed attempts on same task | — |
| **5** | Antigravity unavailable | Run commands locally; paste outputs into evidence doc | **Cursor** terminal-driven runs |
| **5b** | Gemini CLI unavailable | Format evidence manually in markdown | — |
| **6** | Opus unavailable | **Sonnet 4.6 (Thinking)** | **Gemini 3.1 pro High** + checklist **or** **Cursor** strong model (diff-only review) |
| **7** | — | Teo splits RFC or clarifies decision | — |
| **8** | Antigravity unavailable | **Gemini CLI** flash-tier for draft text | **Cursor** minimal edit of context files |

---

## Antigravity quota rule (“one Claude-heavy pass per window”)

**Reality:** In Antigravity, **Claude Sonnet 4.6** and **Claude Opus 4.6** typically **share one usage pool** per reset window (~5 hours). Treat that pool as **scarce**.

**Rule:** In each Antigravity window, plan **at most one** of:

- **A)** Phase **2b** (spec audit) on **Sonnet**, **or**
- **B)** Phase **6** (execution audit) on **Opus** (preferred for high-risk) **or Sonnet**.

The **other** Claude-heavy phase in the same window must use a **fallback** from the matrix above (e.g. **Gemini 3.1 pro High** with checklist, or **defer** to next window).

**High-risk RFC** (auth, Payload config, payments, legal data integrity, access control): prefer spending the window on **phase 6 (Opus)** if phase 2b was already satisfied by Sonnet earlier or by Gemini High + checklist.

---

## Gemini CLI — primary duties and hard boundaries

**Use Gemini CLI as primary for multiple phases** to balance cost and to reserve **Cursor** for decision precision and implementation.

| Duty | Phase | Typical models | Notes |
| :--- | :--- | :--- | :--- |
| Draft specification | **1** | Auto Gemini 3, `gemini 3.1 pro-preview` | Broad structure, links to `docs/design/`, open questions |
| Hostile **audit prep checklist** | **2a** | Same, or `gemini 3 flash-preview` for tight RFCs | Outputs questions/gaps for **2b**; **not** a substitute for adversarial audit |
| Optional **decision scaffold** | **3a** *(optional)* | `gemini 3.1 pro-preview` | Headings + task IDs + empty verification section only — **Teo + Antigravity** must finalize |
| **Evidence packet formatting** | **5b** | `gemini 3 flash-preview`, `gemini 2.5 flash` | Turn raw logs into structured QA evidence |
| **Closure drafts** | **8** | `gemini 3 flash-preview`, `gemini 2.5 flash` | `PROJECT_STATE` / `ROADMAP` / diary **drafts** — Teo reviews before commit |

**Gemini CLI must NOT own (alone):**

- Final **spec audit** verdict (phase **2b**)
- Final **execution audit** verdict (phase **6**)
- Final **decision** approval (phase **3**)
- **Implementation** (phase **4**)

Reason: Gemini can under-weight or soften errors; adversarial phases stay **Claude-biased** or **Cursor** with a strict checklist.

**Gemini CLI model guide**

| Model | Use for | Avoid for |
| :--- | :--- | :--- |
| Auto Gemini 3 / **3.1 pro-preview** | Spec, audit-prep, optional decision scaffold | Cheap-only closure when nuance matters |
| **3 flash-preview** | Checklist extraction, evidence formatting, light closure | Sole reviewer on security |
| **2.5 pro** | Spec if 3.x capped | — |
| **2.5 flash** / **flash-lite** | Pure formatting, tables from existing text | Audits, access-control review |

---

## Antigravity — model guide

| Model | Use for | Avoid for |
| :--- | :--- | :--- |
| **Claude Opus 4.6 (Thinking)** | Phase **6** execution audit on **high-risk** changes | Burning Opus + Sonnet both in same window for two heavy passes |
| **Claude Sonnet 4.6 (Thinking)** | Phase **2b** spec audit; test orchestration; general review | Final word on highest-risk audit if Opus is available and quota allows |
| **Gemini 3.1 pro High** | Second opinion when Claude pool exhausted; **always** pair with phase **2a** checklist | Unguarded “soft” audit without checklist |
| **Gemini 3.1 pro Low** | Lighter variant of High | — |
| **Gemini 3 Flash** | Phase **5** runner/summarizer; cheap closure drafts | Sole security audit |
| **GPT-OSS 120B (Medium)** | Brainstorming, non-binding ideas | Payload access control, payments, final audits |

---

## Cursor — model guide

| Use | Model tier | Notes |
| :--- | :--- | :--- |
| Phase **3** Decision | Not primary (Antigravity owns phase 3) | Cursor only as emergency fallback if Antigravity is blocked |
| Phase **4** Execution | **Default coding** model | Step up only when stuck on a **narrow** subtask |
| Overflow **2b** or **6** | **Strong** | Diff-only + explicit checklist; assume implementation is wrong until proven |
| Phase **7** Remediation | **≥** phase 4 | **Different** session than original executor |

Reserve **premium / strongest** Cursor usage for: phase **3**, phase **6** overflow, and **blocked** phase **4** subtasks — not for RFC first drafts (use **Gemini CLI**).

---

## Quick reference: who does what, when

| When | Who | What |
| :--- | :--- | :--- |
| Starting an RFC | **Gemini CLI** | Write spec (phase 1) + audit-prep checklist (phase 2a) |
| Before coding | **Antigravity Claude** | Spec audit (phase 2b) |
| Before any implementation | **Teo + Antigravity** | Lock `.agents/decisions/RFC-XXX-decision.md` (phase 3) |
| Coding | **Cursor** | Execute decision file only; TDD (phase 4) |
| After implementation | **Terminal / Antigravity** | Run verification commands; capture evidence (phase 5); optionally **Gemini CLI** formats logs (5b) |
| Before merge / done claim | **Antigravity Claude** | Execution audit (phase 6) |
| If execution audit fails | **Cursor** (new executor) | Fix list only (phase 7); re-run 5 → 6 |
| End of cycle | **Antigravity** or **Gemini CLI** | Draft closure updates; Teo commits context + MemPalace protocol (phase 8) |

---

## Shared engineering standards

1. **Planning (`writing-plans`):** Every implementation plan must be granular, bite-sized, and free of placeholders.
2. **TDD (`test-driven-development`):** No production code without a failing test first. Red-Green-Refactor is mandatory.
3. **Debugging (`systematic-debugging`):** No fixes without root-cause investigation. Follow the 4-phase process.
4. **Verification (`verification-before-completion`):** No completion claims without fresh, evidence-based verification.
5. **Memory (MemPalace):** Use `mempalace_status` + `mempalace_search` before asserting project history or decisions.
6. **Library docs:** Use **Context7** MCP (`resolve-library-id`, `query-docs`) via the `find-docs` skill for all framework/library questions.
7. **No Improvisation:** Execute exactly what the decision file says. If something is missing, stop and escalate to Teo.

---

## Execution Protocol (Cross-Agent)

1. **Single source policy:** This file is the anchor.
2. **Verification gate:** Baseline template: `.agents/context/RFC-VERIFICATION-SKELETON.md`.
3. **Scope lock:** Decision files must include explicit **in-scope/out-of-scope** boundaries.
4. **MemPalace checkpoints:**
   - Before RFC: `mempalace_status` + `mempalace_search`.
   - After scope approval: `mempalace_diary_write`.
   - After closure: Update context docs + `mempalace_diary_write` + mine repository.

---

## Code integrity rule — NON-NEGOTIABLE

**NEVER delete, comment out, or suppress code, config, imports, fields, tests, or dependencies to make an error go away.**

The only valid fix is finding and resolving the root cause. If the root cause cannot be resolved in 2 attempts → escalate to Teo immediately.

---

## Project context

- **Name:** tuherenciafacil
- **Description:** Legal digital platform for estate succession processes under Colombian law.
- **Stack:** Next.js 16.2.3 App Router + React 19.2.5 + TypeScript 5.7.3 + Payload CMS 3.84.1 *(verify in `package.json` if drift)*
- **Primary language:** Spanish (ES).

---

## Other entry points

- **Cursor / Composer:** `CURSOR.md` at repo root maps skills and MemPalace for Cursor.
- **Claude Code:** `CLAUDE.md`
- **Gemini / Antigravity:** `GEMINI.md`, `ANTIGRAVITY.md`

This file (`.agents/AGENTS.md`) remains the **canonical pipeline and tool-selection contract** for all agents.
