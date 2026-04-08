# PROJECT_STATE

## Last updated: 2026-04-06

## Stack (current)

- **Framework:** Next.js 16.2.1 + Payload CMS 3.80 + React 19 + TypeScript
- **Database:** Neon (PostgreSQL) — migrated from Supabase
- **ORM:** Drizzle ORM
- **Storage:** Cloudflare R2 — migrated from Supabase S3
- **Email:** Brevo adapter (SMTP2GO planned post-launch — do NOT switch yet)
- **Deploy:** Vercel

## Completed cycles

### spec-001 — Initial Scope and Setup
- **Closed:** 2026-03-25
- **Output:** `.agents/migration/eterhub_scope.md` — exhaustive audit of eterhub codebase

### RFC-001 — Selective Migration
- **Closed:** 2026-03-25
- **Key results:**
  - ~300+ files copied from eterhub, Miru/finance perimeter excluded
  - payload.config.ts moved to src/payload/
  - Auth simplified to Users-only (Members removed, isMember removed)
  - (herencia) route group created with /[locale]/herencia/page.tsx
  - LoginForm redirects to /{locale}/herencia
  - Miru i18n namespace removed, Herencia + Welcome namespaces added
  - Welcome page localized (EN/ES) with LanguageSwitcher
  - middleware.ts migrated to proxy.ts (Next.js 16 codemod)
  - Tailwind v4 configured, payload-sidebar-plugin removed
  - Initial DB migration created and applied

### Design Finalization — 2026-04-06
- **Output:** Full design docs committed. No code changed.
- **Key results:**
  - DEC-002 (poder gate), DEC-003 (intestada+mutuo acuerdo), DEC-004 (tiers) approved
  - DEC-007 (URL structure), DEC-008 (Elite schema), DEC-009 (créditos) resolved
  - 11 collections fully specified in `docs/design/COLLECTIONS.md`
  - 21 screens / 14 page.tsx mapped in `docs/design/SCREEN_MAP.md`
  - Visual /docs pages updated to reflect final design
  - CLAUDE.md and GEMINI.md created

## Current state

- `pnpm build` passes, `pnpm dev` starts clean
- Frontend: marketing site loads at `/` in Spanish (prefix-free), `/en` in English
- Auth: login/register/forgot-password/reset-password routes present
- Route: `/app` active — redirects from login, shows welcome + logout
- Admin: `/admin` loads Payload CMS panel
- No Miru/finance routes, collections, or branding remain
- Members collection: clean — no `tier` or `currency` fields
- i18n: prefix-free Spanish default, `as-needed` locale prefix
- DB: `push: true` in dev (Drizzle auto-syncs), `push: false` in production
- **No succession collections exist yet** — data layer not implemented
- **No app screens exist yet beyond /app stub** — /app/* routes not implemented

### RFC-002 completed — 2026-04-07
- Members: removed `tier`, `currency` fields; `preferredLocale` defaults to `es`
- Route group: `(herencia)` → `(app)`, route `/herencia` → `/app`
- Login redirects to `/app`; logout clears `payload-token` cookie correctly
- i18n: `routing.ts` + `proxy.ts` unified to prefix-free Spanish, `i18n.ts` fallback `es`
- Translations: `"Herencia"` namespace → `"App"` in es.json + en.json
- Miru/Heionhub branding removed from LoginForm, auth layouts, frontend layout
- DB: switched from `push: false` to `push: process.env.NODE_ENV !== 'production'`
- Agent pipeline: added Phase 3 (decision draft), Phase 5 (QA), Phase 6 (closure)
- CLAUDE.md + GEMINI.md: added migration rules section, translation requirements
- BACKLOG: added INFRA-001 (dev/prod Neon branch split, post-RFC-008)

## What needs to happen next

1. **Collections layer:** All 11 Payload collections — RFC-003
2. **Pre-pago screens:** 5 screens with payment stubs — RFC-004
3. **Client app screens:** 7 screens — RFC-005
4. **Lawyer app screens:** Lawyer view + notaría — RFC-006
5. **Phase engine:** advance-phase endpoint + gates — RFC-007
6. **Wompi integration:** Blocked on DEC-005 — RFC-008
