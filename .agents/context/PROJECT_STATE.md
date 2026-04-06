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
- Frontend: marketing site loads, Welcome page renders in EN/ES
- Auth: login/register/forgot-password/reset-password routes present
- Route: /[locale]/herencia active, redirects from login
- Admin: /admin loads Payload CMS panel
- No Miru/finance routes or collections remain
- **No succession collections exist yet** — data layer not implemented
- **No app screens exist yet** — /app/* routes not implemented

## What needs to happen next (pre-implementation)

1. **Members cleanup:** Remove old `tier` (free/premium) and `currency` fields inherited from Miru/Eterhub — RFC-002
2. **Route rename:** `(herencia)/herencia` → `(app)/app` with prefix-free next-intl config — RFC-002
3. **Collections layer:** All 11 Payload collections — RFC-003
4. **Pre-pago screens:** 5 screens with payment stubs — RFC-004
5. **Client app screens:** 7 screens — RFC-005
6. **Lawyer app screens:** Lawyer view + notaría — RFC-006
7. **Phase engine:** advance-phase endpoint + gates — RFC-007
8. **Wompi integration:** Blocked on DEC-005 — RFC-008
