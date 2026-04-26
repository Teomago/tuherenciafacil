# ANTIGRAVITY.md — tuHerenciaFácil

> Read this file at the start of every Antigravity session. Then read `.agents/AGENTS.md` and `.agents/context/PROJECT_STATE.md`.

## Purpose

This file maps Antigravity behavior to the same canonical pipeline used by Cursor and Gemini CLI, so all agents follow identical execution rules.

## Required read order

1. `ANTIGRAVITY.md` (this file)
2. `.agents/AGENTS.md`
3. `.agents/standards/NO-ERROR-SUPPRESSION.md`
4. `.agents/context/PROJECT_STATE.md`
5. `.agents/context/BACKLOG.md`
6. Active decision file in `.agents/decisions/` before implementation

## Pipeline contract

- Follow the 6-phase flow in `.agents/AGENTS.md`.
- Never implement production code without an approved decision file.
- Keep scope locked to the active RFC decision.
- Use evidence-based verification before claiming completion.

## Skills and MCP

- Use native skills from `.agents/skills/` (same names as in `.agents/AGENTS.md`):
  - `using-superpowers`
  - `brainstorming`
  - `writing-plans`
  - `test-driven-development`
  - `systematic-debugging`
  - `verification-before-completion`
  - `find-docs` (or Context7 equivalents)
- Use Context7 MCP for library/API facts.
- Use MemPalace MCP for history and canonical memory checks:
  - `mempalace_status`
  - `mempalace_search`
  - `mempalace_diary_write` / `mempalace_add_drawer` when required by protocol

## Current sequence lock

1. RFC-003.1 — implemented
2. RFC-003.2 — implemented
3. RFC-003.3 — implemented
4. RFC-004 — next
5. RFC-005 — after RFC-004

## Non-negotiables

- No error suppression (`@ts-ignore`, `@ts-expect-error`, `as any`, eslint disables) to force green.
- No silent scope changes.
- Repo files are source of truth; MemPalace complements but does not override repository state.
