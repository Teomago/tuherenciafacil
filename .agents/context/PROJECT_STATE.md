# PROJECT_STATE

## Last updated: 2026-03-25

## Completed cycles

### spec-001 — Initial Scope and Setup
- **Closed:** 2026-03-25
- **Output:** `.agents/migration/eterhub_scope.md` — exhaustive audit of eterhub codebase
- **Key results:**
  - 13 src/ folders documented, 5 auto-generated files flagged
  - ~88 Miru/finance files identified for EXCLUDE
  - ~300+ files flagged COPY across payload, modules, components, lib, styles
  - 48 MISSING npm dependencies identified
  - 7-phase execution order written with 10 risks documented
  - Two Welcome screens identified (CMS init + post-login herencia)

### RFC-001 — Selective Migration
- **Closed:** 2026-03-25
- **Output:** 10-phase selective migration from eterhub executed
- **Key results:**
  - ~300+ files copied from eterhub, Miru/finance perimeter excluded
  - payload.config.ts moved to src/payload/, titleSuffix updated
  - Finance collections and ImportSettings global removed
  - Auth simplified to Users-only (Members removed, isMember removed)
  - (herencia) route group created with /[locale]/herencia/page.tsx
  - LoginForm redirects to /{locale}/herencia
  - Miru i18n namespace removed, Herencia + Welcome namespaces added
  - Welcome page fully localized (EN/ES) with LanguageSwitcher
  - middleware.ts migrated to proxy.ts (Next.js 16 codemod)
  - postcss.config.mjs created for Tailwind v4
  - payload-sidebar-plugin removed (lucide-react incompatibility)
  - Deprecated eslint/typescript keys removed from next.config.mjs
  - Initial DB migration created and applied to Supabase
  - Upstash rate limiting commented out (middleware + auth actions)
  - Sentry removed from global-error.tsx

## Current state

- Next.js 16.2.1 + Payload CMS 3.80 + React 19
- Supabase connected (pooler on port 6543, direct on port 5432)
- `pnpm build` passes, `pnpm dev` starts clean
- Frontend: marketing site loads, Welcome page renders in EN/ES
- Auth: login/register/forgot-password/reset-password routes present
- Herencia: /[locale]/herencia route active, redirects from login
- Admin: /admin loads Payload CMS panel
- No Miru/finance routes or collections remain
