# CURSOR.md — tuHerenciaFácil (Cursor / Composer)

> Read this at the **start of every Cursor session** that touches code or architecture.  
> Then read **`.agents/AGENTS.md`**, **`.agents/context/PROJECT_STATE.md`**, and the **active decision** in `.agents/decisions/` if you are implementing.

**Product language:** Spanish for users. **Agent coordination language:** English in `.agents/` and this file — so Gemini CLI, Claude Code, and Cursor share one canonical reading.

---

## 1. Where instructions live (unambiguous map)

| File | Purpose |
|------|---------|
| **`CURSOR.md`** (this file) | Cursor-specific: skill discovery, MemPalace, Context7, honest beta cadence. |
| **`.agents/AGENTS.md`** | **Authoritative** 6-phase pipeline + strict rules. |
| **`.agents/standards/NO-ERROR-SUPPRESSION.md`** | Non-negotiable quality bar. |
| **`CLAUDE.md`** | Same project context for **Claude Code** (parallel to this file). |
| **`GEMINI.md`** | Same project context for **Gemini CLI** (Phase 1 spec writer). |
| **`ANTIGRAVITY.md`** | Antigravity-specific entrypoint aligned to the same pipeline and skills. |
| **`AGENTS.md` (repo root)** | **Generic Payload CMS patterns** (template). **Not** the RFC pipeline. For pipeline rules, use **`.agents/AGENTS.md`**. |

---

## 2. Tool stack — use in this order of priority

### 2.1 Always first: process before code

1. **Superpowers “using-superpowers”** — If any skill might apply (>1% chance), read/follow it before acting. In Cursor, skills live under your skills path; open the relevant `SKILL.md` with the **Read** tool when the hook lists them.
2. **`.agents/AGENTS.md`** — Phase you are in (spec / audit / decision / execute / QA / close). **Zero production code** without an approved file in `.agents/decisions/`.
3. **Brainstorming** — Before new product behavior or non-trivial UI flows.
4. **Writing-plans** — Decisions and RFC-backed execution plans must be granular and testable.

### 2.2 While building

| Situation | Tool / skill |
|-----------|----------------|
| Bug or failing tests | **systematic-debugging** |
| New behavior / bugfix in app logic | **test-driven-development** (when team policy says TDD) |
| UI / components users see | **frontend-design** (distinctive, production-grade; avoid generic AI UI) |
| Library APIs (Next, Payload, React, etc.) | **Context7** MCP (`query-docs`, `resolve-library-id`) — use when docs would reduce guesswork |
| Anything about people, past sessions, “what did we decide?” | **MemPalace** MCP — `mempalace_status`, then `mempalace_search` (and `mempalace_kg_query` if you use the KG). **Search before strong claims.** |

### 2.3 Before “done”

- **verification-before-completion** — Run the commands in the decision file (or `pnpm build`, `pnpm test:int`, etc.) and report evidence — no success claims without output.

---

## 3. MemPalace — when to run what

| When | Action |
|------|--------|
| **Session start (heavy context)** | `mempalace_status` → optional `mempalace_search` for the feature you are touching. |
| **After Phase 6 closure** (merge to main, `PROJECT_STATE` updated) | CLI: **`mempalace mine .`** from repo root where `mempalace.yaml` lives (wing from yaml; add `--wing tuherenciafacil` if needed). |
| **After a big RFC lands** (many files) | Same — `mempalace mine .`, or dry-run first: `mempalace mine . --dry-run`. |
| **End of important session** | `mempalace_diary_write` (short AAAK line: what merged, what failed, next step). |
| **One-off canonical fact** | `mempalace_add_drawer` (`wing`, `room`, verbatim `content`) or KG tools if you maintain temporal facts there. |

**CLI vs MCP:** Bulk index = **`mempalace mine`** (terminal). Targeted write = **MCP** `mempalace_add_drawer` / `mempalace_diary_write`. There is no MCP command literally named `mempalace:mine`. **This repo** includes **`mempalace.yaml`** at the root; if you clone fresh, run **`mempalace init .`** once from the repo root, then **`mempalace mine .`** (wing is read from `mempalace.yaml`) or **`mempalace mine . --wing tuherenciafacil`** to set the wing explicitly. If the standalone CLI is not on your `PATH`, the same commands work as `python3 -m mempalace init .` / `python3 -m mempalace mine ...`.

**Common mistake:** **`mempalace mine tuherenciafacil`** does *not* mean “use wing `tuherenciafacil`”. The first argument is a **path** to the tree to index. From inside this repo that resolves to `./tuherenciafacil/`, which is usually the wrong folder or empty → **Files: 0**. Always **`cd` to the repo root** (where `mempalace.yaml` lives) and run **`mempalace mine .`**.

**Exit 139 / Python “segfault” (no traceback):** Usually **ChromaDB’s on-disk HNSW index**, not Python itself — e.g. Chroma upgraded while the palace on disk was built with another version, or a mine was interrupted. MemPalace **≥ 3.3.2** quarantines stale HNSW segments on open ([upstream discussion](https://github.com/MemPalace/mempalace/issues/1132)). **Do this periodically:** upgrade MemPalace and Chroma together, then retry `mine .`:

```bash
python3 -m pip install -U mempalace chromadb
python3 -m pip show mempalace chromadb   # confirm versions
```

Then **`mempalace mine .`** from repo root (first open may rebuild the index). If it still crashes, **`mempalace repair`** (see `mempalace repair --help`) or check [MemPalace issues](https://github.com/MemPalace/mempalace/issues) for your exact version pair. **Python:** `python3 --version`; system **3.9.x** works for many setups but maintaining a **3.11+ venv** for MemPalace keeps you aligned with current wheels — optional hygiene, rarely the primary fix.

---

## 4. Gemini CLI vs Cursor (pipeline roles)

Your pipeline assigns **roles to tools**:

| Phase | Primary owner in your design |
|------|-------------------------------|
| 1 Spec | **Gemini CLI** → `.agents/specs/` |
| 2 Audit | **Claude Code** → `.agents/audits/` |
| 3 Decision | **Teo + auditor** → `.agents/decisions/` |
| 4 Execute | **Gemini or Claude** from decision only |
| 5 QA | **Teo** + verification standard |
| 6 Close | **Administrator** → `PROJECT_STATE.md`, archive, commit |

**Cursor (Composer)** is not named on every line of `CLAUDE.md`, but it should behave like **“Claude Code / Executor”** unless Teo assigns you Phase 1. Default: **Executor + QA assist + doc updates** — still gated by **`.agents/decisions/`**.

---

## 5. Honest pipeline assessment (beta this week)

**What is genuinely strong**

- **Written gates** (RFC → audit → decision) reduce improvisation and keep legal/product intent traceable.
- **Superpowers + TDD + verification** are the right *shape* for a regulated-ish product.
- **MemPalace + mine** is the right idea for long-horizon memory — *if* you run mine after merges and diary after sessions.

**What hurts you in practice**

1. **Six phases is slow for a 1-week beta** if you run the full ceremony for every tweak. For beta, use **timeboxed “mini-RFCs”**: one decision file per beta slice with explicit **IN SCOPE / OUT OF SCOPE** and a **single verification block**.
2. **`PROJECT_STATE.md` drifts** — agents trust the wrong truth. **Update it when you merge**, not “later”.
3. **Standards vs codebase** — `NO-ERROR-SUPPRESSION` forbids patterns still present in tests/hooks. Either budget time to **remove** them or document **narrow exceptions** in the **decision file** for that RFC only.
4. **Two “AGENTS” concepts** — root `AGENTS.md` is Payload template; pipeline is `.agents/AGENTS.md`. Easy to load the wrong mental model. This file and the banner on root `AGENTS.md` exist to fix that.
5. **Parallel `getPayload()` int tests** — flaky CI/local; fix isolation **before** you rely on tests for beta sign-off.

**Recommendation for this week**

- Ship beta behind **one written decision** per slice (even 1–2 pages).  
- Run **`pnpm build`** every merge; run **`pnpm test:int`** when touching Payload/auth/money.  
- **`mempalace mine .`** after each merge to main (or nightly).  
- **`mempalace_diary_write`** when you switch major context (so Gemini CLI and Cursor do not argue with stale narrative).

---

## 6. Context read order (Cursor session)

1. `CURSOR.md` (this file)  
2. `.agents/AGENTS.md`  
3. `.agents/standards/NO-ERROR-SUPPRESSION.md`  
4. `.agents/context/PROJECT_STATE.md`  
5. `.agents/context/BACKLOG.md`  
6. Active `.agents/decisions/RFC-*-decision.md` (if executing)  
7. `docs/design/COLLECTIONS.md` + `docs/design/SCREEN_MAP.md` when touching schema or routes  
8. `CLAUDE.md` for stack details and migration rules (keep in sync with `package.json`)

---

## 7. Context7 (when needed)

Use the Context7 MCP for **library-grounded** answers: resolve library id → `query-docs` with topic (e.g. “Payload 3 access control”, “Next.js 16 proxy”). Do not use it for **your** business rules — those live in `docs/decisions/`, `.agents/decisions/`, and MemPalace search.

---

## 8. Cursor UI: “Composer” vs what you see

Older tutorials used **“Composer”** for the **multi-file AI sidebar**. In **current Cursor docs**, that experience is **Agent**: open the side panel with **⌘I** (Mac), use **⇧Tab** to cycle **Agent / Ask / Plan / Debug**, and **⌘E** to toggle Agent layout. **Composer 2** is often a **model choice** (agentic Cursor model), not a hidden second app.

If you want the separate **Agents Window**, use the command palette: **Open Agents Window**. Official overview: [Cursor Agent docs](https://cursor.com/docs/agent/overview.md) and [keyboard shortcuts](https://cursor.com/docs/reference/keyboard-shortcuts.md).

---

## 9. Gemini CLI, Antigravity, and skills

This repo is edited from **Cursor**, **Gemini CLI**, and possibly **Google Antigravity**. Rules live in **`.cursor/rules/multi-agent-tooling.mdc`** (always read for multi-tool context). **Gemini CLI vs Antigravity:** see Google’s comparison: [Choosing Antigravity or Gemini CLI](https://cloud.google.com/blog/topics/developers-practitioners/choosing-antigravity-or-gemini-cli). Both support **MCP** and **Agent Skills** per Google; you still **reconfigure** skills and MCP per product — they are not auto-magic imports from Cursor.
