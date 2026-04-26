# MemPalace RFC Protocol (Mandatory)

This protocol standardizes memory synchronization across Cursor, Claude Code, Gemini CLI, and future agents.

---

## 1) Before drafting an RFC decision

1. Run `mempalace_status`.
2. Run focused `mempalace_search` for:
   - latest RFC status,
   - post-fix assumptions,
   - naming/numbering decisions.
3. Do not assert project-history facts without search evidence.

## 2) After scope alignment, before implementation

Write one canonical `mempalace_diary_write` entry with:

- RFC ID and title,
- in-scope/out-of-scope summary,
- designated executor,
- expected verification commands (from `.agents/context/RFC-VERIFICATION-SKELETON.md` + RFC-specific additions).

## 3) After RFC merge/closure

1. Update `.agents/context/PROJECT_STATE.md`.
2. Update `.agents/context/ROADMAP.md` if sequence/status changed.
3. Write closure diary entry (`mempalace_diary_write`) with:
   - what shipped,
   - what was deferred,
   - next RFC entry point.
4. Run repository memory mining so indexed context matches merged state.

## 4) Guardrails

- Memory is a safeguard, not source-of-truth override.
- If MemPalace and repository docs disagree, fix docs and diary in the same closure cycle.
- Never skip closure memory updates after a merged RFC cycle.
- `.agents/AGENTS.md` remains the policy anchor; this file is an attached execution protocol.
