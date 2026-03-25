# Spec 001 — Initial Scope and Setup

## Context

tuherenciafacil is a new Next.js 15 + Payload CMS 3.x project.
eterhub is the source base (selective copy — not a full migration).
You have full read access to both codebases.
Spend as many tokens as needed. This audit is the foundation for all future work.
Accuracy is more important than brevity.

---

## TASK 1 — Write AGENTS.md

Write .agents/AGENTS.md with the following content exactly:

### Project

- Name: tuherenciafacil
- Description: Legal digital platform for estate succession processes
  under Colombian law. Helps users manage documents, involved parties,
  asset declarations, and legal steps. A partner lawyer validates all
  legal content.
- Stack: Next.js 15 App Router + React 19 + TypeScript + Payload CMS 3.x
  - Drizzle ORM + Supabase (PostgreSQL + S3) + Tailwind CSS v4 +
    next-intl (EN/ES) + Brevo + Upstash Redis (deferred) + Vercel
- Source base: eterhub (selective copy — not a full migration)

### Pipeline roles

- Gemini Fast/Pro: codebase scanning, spec drafting, volume work → writes to specs/
- Claude Chat: architecture decisions, critical auditing, complex debugging, internet access
- Claude Code: spec auditing by reading .agents/, high-risk code execution → writes to audits/
- Antigravity: visual execution, i18n, UI, forms, volume visual work
- Haiku: simple mechanical tasks

### Pipeline rules

1. No agent touches code without an approved file in decisions/
2. One executor per cycle
3. On cycle close:
   - Update context/PROJECT_STATE.md
   - Move executed spec to archive/specs/
   - Delete used audits/ and decisions/ files

### What to copy from eterhub

- src/payload/ — entire folder (all collections, blocks, plugins, adapters, hooks within payload)
- src/modules/ — entire folder (reusable UI components mapped to CMS blocks, re-styleable per project)
- src/i18n/ — full i18n setup (EN/ES — EN stays for future use, ES is primary)
- src/hooks/ — all hooks (audit individually, exclude finance hooks)
- src/app/ — selectively (see exclusions below)
- Providers: TanStack Query provider, Next provider, any global providers in src/
- Adapters: Brevo adapter and any other service adapters in src/

### What to EXCLUDE from eterhub

- src/app/[locale]/app/ — entire Miru finance dashboard (do not copy any file from here)
- src/payload/collections/finance/ — all finance collections
- Any hook exclusively related to finance/Miru features
- Payload-managed folders: do NOT copy folders that Payload CMS owns and overwrites on updates.
  Flag these explicitly in the scope.

### Initialization success criterion

User logs in → sees clean welcome screen "Bienvenido [user]" → initialization is complete.
No finance dashboard. No Miru.

---

## TASK 2 — Deep scope of eterhub codebase

Produce .agents/migration/eterhub_scope.md

This document must be exhaustive. Read every relevant file. Do not summarize — list every file.

---

### 2.1 — Top-level src/ structure

List every folder inside eterhub/src/ with a one-line description of its purpose.
Flag which ones are Payload-managed (auto-generated or overwritten on Payload updates).

---

### 2.2 — Miru/finance perimeter — what is connected to Miru and what is not

Before any copy flags, identify the full Miru surface:

- Every file, collection, hook, component, route, or adapter that is exclusively or partially
  connected to Miru/finance logic.
- Be exhaustive. Scan every folder.
- Output a flat list: file path | Miru connection (full | partial | none)
- For partial connections: describe what part is Miru and what part is reusable.
  This section is the source of truth for all EXCLUDE flags below.

---

### 2.3 — src/payload/ — Full inventory

For every file and subfolder inside src/payload/:

- Full relative path
- Type: collection | block | plugin | adapter | hook | config | util | other
- One-line description of what it does
- Miru connection: yes | no | partial (reference 2.2)
- Flag: COPY | EXCLUDE | REVIEW

Group by subfolder. List every single file.

---

### 2.4 — src/modules/ — Full inventory

For every module/component inside src/modules/:

- Full relative path
- Which CMS block it corresponds to (if applicable)
- What it renders (one line)
- Any external dependencies it imports that need to exist in tuherenciafacil
- Miru connection: yes | no | partial
- Flag: COPY | EXCLUDE | REVIEW

---

### 2.5 — src/i18n/ — Full inventory

- List all files (config, message files, middleware hooks related to i18n)
- For each locale file (en, es): list the top-level keys present
- Identify any i18n keys that are Miru/finance-specific (flag for exclusion or emptying)
- Flag: COPY | EXCLUDE | REVIEW per file

---

### 2.6 — src/hooks/ — Full inventory

For every hook:

- Full relative path
- What it does (one line)
- Whether it depends on finance/Miru logic
- Flag: COPY | EXCLUDE | REVIEW

---

### 2.7 — src/app/ — Route and layout map

Map the full routing tree of eterhub/src/app/:

- List every route segment and layout file
- For each: is it marketing-facing | auth-facing | app (Miru)?
- Identify which routes/layouts must be COPY | EXCLUDE | REVIEW
- Flag all Payload-managed files inside src/app/ (e.g. api/[...nextjs]/ or similar)

---

### 2.8 — Providers and global wrappers

- List all providers (TanStack Query, Next, theme, etc.)
- File paths and what they wrap
- Miru connection: yes | no | partial
- Flag: COPY | EXCLUDE | REVIEW

---

### 2.9 — Adapters and service integrations

For each external service adapter found:

- Service name (Brevo, Supabase, Redis, etc.)
- File path(s)
- What it does
-
