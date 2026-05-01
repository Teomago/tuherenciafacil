# RFC-004 Decision — App Shell & UI Primitives

**Status:** Approved by Teo — execution authorized (2026-04-28)
**Date:** 2026-04-28
**Executor:** Cursor executor after Teo approval only
**Spec:** `.agents/specs/RFC-004-app-shell-ui-primitives.md`
**Audit:** `.agents/audits/RFC-004-audit.md`

---

## 0. Authority and Scope Lock

This decision is the only execution contract for RFC-004 once approved.

**Intent:** RFC-004 builds the authenticated App Shell for tuHerenciaFácil — centralized auth guard, role-aware navigation, atomic UI primitives (via shadcn/ui), and stubbed dashboard/cases routes. It does NOT implement any funnel screens (RFC-005) or case workspace editing (RFC-007+).

**In scope:**
- `AuthGuard` server component (centralized auth, replaces page-level guard)
- `UserProvider` client component + `useUser()` hook
- `(app)/layout.tsx` — providers composition
- `Sidebar` (desktop) + `Drawer` (mobile) — role-aware navigation
- `Header` component — user identity, locale placeholder
- Route stubs: `/dashboard`, `/casos`, `/caso/[id]` (layout only)
- Move `pending-activation` outside guarded `(app)` group to avoid redirect loops (`src/app/[locale]/pending-activation/page.tsx`)
- `forbidden.tsx` — error boundary for `/notaria` access
- shadcn/ui primitives: Button, Card, Badge, NavigationMenu
- TanStack Query usage pattern (query keys, staleTime config, HydrationBoundary on dashboard stub)
- `playwright.config.ts` + 5 Playwright smoke scenarios
- `es.json` updates for `App.Sidebar.*`, `App.Header.*`, `App.Dashboard.Stubs.*`
- Vitest unit tests for role-conditional render logic

**Out of scope:**
- Onboarding/pre-payment funnels (RFC-005)
- Case workspace data editing (RFC-007+)
- Chat UI, real-time WebSockets (RFC-009+)
- Wompi payment integration (DEC-005)
- APPT-001 slot capacity auto-update (backlog)
- Full Playwright CI pipeline (deferred — Teo runs locally)

**Execution guard:** If implementation requires behavior outside this scope, stop and escalate to Teo.

---

## 1. Mandatory Skills (executor must load before coding)

In order:
1. `using-superpowers` — establishes skill discovery
2. `find-docs` — required before any non-trivial framework/API decision (use Context7 for Next.js, shadcn/ui, TanStack Query, Payload)
3. `executing-plans` — execution entrypoint for written decision plans
4. `single-flow-task-execution` — task-by-task execution discipline + review gates inside the same session
5. `test-driven-development` — red-green cycle per task
6. `frontend-design` — **mandatory** for all UI/UX work in this RFC and all future frontend RFCs
7. `verification-before-completion` — mandatory before any success claim / merge readiness statement

Conditional (load when triggered):
- `systematic-debugging` — mandatory on first failing test / unexpected runtime behavior
- `requesting-code-review` — after implementation and baseline checks, before closure handoff
- `finishing-a-development-branch` — after all tasks/tests/review are complete, to close the cycle cleanly

Context7 and MemPalace are available for library lookups and session continuity.

### 1.1 Skill usage checkpoints (RFC-004)

| Stage | Required skills |
|---|---|
| Before Task 0 | `using-superpowers` → `find-docs` → `executing-plans` |
| During each implementation task | `single-flow-task-execution` + `test-driven-development` + `frontend-design` (for UI-facing code) |
| On any blocker/failure | `systematic-debugging` (then return to TDD cycle) |
| Before "done" claims | `verification-before-completion` |
| Pre-closure handoff | `requesting-code-review` → `finishing-a-development-branch` |

### 1.2 Frontend-design adaptation rules (project constraints)

`frontend-design` is mandatory, but this RFC must stay aligned with project/legal UX constraints:
- Keep the existing brand token system (`globals.css` + `theme.css`) and DEC-003 readability rules.
- Do not replace global typography strategy blindly; prioritize accessibility and consistency with current app shell.
- Use distinctive UI craft in composition, hierarchy, spacing, and interaction quality — without breaking established tokens, i18n, or role/access behavior.
- Any major visual direction change outside this decision scope requires Teo approval before implementation.

---

## 2. Canonical Decisions

### 2.1 AuthGuard component hierarchy

```
(app)/layout.tsx   ← Server Component. Renders <html><body>. Mounts providers only.
  └── AuthGuard    ← async Server Component. Runs per-request. Auth logic lives here.
        └── UserProvider (client='use client')
              └── AppShell (client)
                    └── {children}
```

`AuthGuard` exact logic:
```typescript
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from '@/lib/payload/getPayload'
import { isMemberUser } from '@/lib/auth/typeGuards'

export async function AuthGuard({
  children,
  locale,
}: {
  children: React.ReactNode
  locale: string
}) {
  const payload = await getPayload()
  const { user } = await payload.auth({ headers: await headers() })

  if (!user || !isMemberUser(user)) redirect(`/${locale}/login`)
  if (user.role === 'abogado' && user.isActive === false)
    redirect(`/${locale}/pending-activation`)

  return <UserProvider user={user}>{children}</UserProvider>
}
```

`pending-activation` must live outside the guarded `(app)` route group so the inactive-lawyer redirect cannot self-loop.

**Critical rules for child layouts:**
- `caso/[id]/layout.tsx` and all other nested layouts must NOT render `<html>` or `<body>`.
- No `payload.auth()` calls in child layouts — user comes from `useUser()`.

### 2.2 UserProvider pattern

```typescript
// src/providers/UserProvider.tsx
'use client'
import { createContext, useContext } from 'react'
import type { Member } from '@/payload-types'

const UserContext = createContext<Member | null>(null)

export function UserProvider({ user, children }: { user: Member; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useUser(): Member {
  const user = useContext(UserContext)
  if (!user) throw new Error('useUser must be used within UserProvider')
  return user
}
```

No `payload.auth()` from the client side. Ever.

### 2.3 `/notaria` access control

`caso/[id]/notaria/page.tsx` must enforce access on the server:
```typescript
import { headers } from 'next/headers'
import { forbidden, redirect } from 'next/navigation'
import { getPayload } from '@/lib/payload/getPayload'
import { isMemberUser } from '@/lib/auth/typeGuards'

export default async function NotariaPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale } = await params
  const payload = await getPayload()
  const { user } = await payload.auth({ headers: await headers() })

  if (!user || !isMemberUser(user)) redirect(`/${locale}/login`)
  if (user.role !== 'abogado') forbidden()

  return <div>{/* notaria workspace content */}</div>
}
```

A `forbidden.tsx` file in `src/app/[locale]/(app)/` provides the error UI (see Task 4).

`useUser()` is for client shell components only; do not use it for the server-side `forbidden()` gate.

### 2.4 shadcn/ui CLI — version check FIRST

Before any scaffold command, executor runs:
```bash
pnpm list tailwindcss class-variance-authority
pnpm dlx shadcn@latest --version
```

Executor must confirm:
- `tailwindcss ^4.x` (not v3 — `@theme` directive is v4-only)
- `class-variance-authority ^0.7.x`
- `radix-ui ^1.4.x` present

Then scaffold:
```bash
pnpm dlx shadcn@latest add button card badge navigation-menu
```

If shadcn CLI reports Tailwind version conflicts, stop and escalate to Teo — do not downgrade tailwind.

### 2.5 Design tokens — use existing system

`globals.css` already defines all tokens. The executor uses only Tailwind's semantic scale — **no arbitrary values** (e.g., no `p-[13px]`, `h-[52px]`). Use `p-3`, `p-4`, `h-12`, etc. This enforces visual rhythm.

**Brand tokens already registered:**
- `--brand-corporate: 205 100% 14%` → `#002845` — primary text, headers
- `--brand-tech: 195 49% 44%` → `#3A8DA8` — button backgrounds, icons (not body text on white)
- `--brand-accent: 25 100% 62%` → `#FF8C3C` — alerts, urgency badges

**Accessibility constraint:** `#3A8DA8` fails WCAG AA as body text on white (3.4:1). Use it only for buttons with white text (large text AA passes), icons, and decorative accents. Use `#002845` (`--foreground`) for all body text.

### 2.6 Spatial proportion rules (frontend-design skill enforcement)

All shell components must follow these ratios:
- **Sidebar width:** `w-64` (16rem) desktop — matches `--content-max-width` proportions
- **Header height:** `h-16` (4rem) — matches `--header-height: 4rem` design token
- **Touch targets (minimum):** `min-h-[44px]` for all buttons, links, and inputs
- **Icon-to-text ratio:** 20px icon with 16px text, 24px icon with 18px+ text
- **Spacing:** Use 4px base grid (`p-1`=4px, `p-2`=8px, `p-4`=16px, `p-6`=24px). No mixing of arbitrary and scale values.

### 2.7 TanStack Query canonical usage

`QueryProvider` is already mounted in `(app)/layout.tsx`. Do not re-mount it.

**Query key taxonomy (canonical — all future RFCs must follow):**
```typescript
['cases', memberId]              // member's case list
['case', caseId]                 // single case + phase
['case', caseId, 'documents']   // document checklist
['case', caseId, 'heirs']       // heirs
['case', caseId, 'payments']    // payments
['appointments', memberId]       // appointments
```

**staleTime by data type:**
- Case phase/status: `30_000` (30s)
- Document checklist: `60_000` (1min)
- Notification counter: `10_000` (10s)
- Payment history: `120_000` (2min)

**Dashboard stub pattern (server prefetch → client hydrate):**
```tsx
// dashboard/page.tsx (Server Component)
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

export default async function DashboardPage() {
  const queryClient = new QueryClient()
  const member = // from AuthGuard via prop or cookie
  await queryClient.prefetchQuery({
    queryKey: ['cases', member.id],
    queryFn: () => fetchActiveCases(member.id),
  })
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient memberId={member.id} />
    </HydrationBoundary>
  )
}
```

**Mutation pattern (RFC-005+ must follow):**
```typescript
useMutation({
  mutationFn: async (data) => { /* PATCH /api/... */ },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['case', caseId] }),
})
```

No `refetchInterval` in RFC-004. `refetchOnWindowFocus: true` (default) provides "fresh on tab return" behavior.

---

## 3. Files by Task

| Task | Files |
|---|---|
| 0 | Version check only — no file changes |
| 1 | `src/providers/UserProvider.tsx` (new), `src/components/auth/AuthGuard.tsx` (new), `src/app/[locale]/(app)/layout.tsx` (update) |
| 2 | `src/components/ui/button.tsx` (shadcn), `src/components/ui/card.tsx` (shadcn), `src/components/ui/badge.tsx` (shadcn), `src/components/ui/navigation-menu.tsx` (shadcn) |
| 3 | `src/components/shell/Sidebar.tsx` (new), `src/components/shell/MobileDrawer.tsx` (new), `src/components/shell/Header.tsx` (new), `src/components/shell/AppShell.tsx` (new) |
| 4 | `src/app/[locale]/(app)/app/page.tsx` (update — remove auth guard, redirect to dashboard), `src/app/[locale]/(app)/dashboard/page.tsx` (new stub), `src/app/[locale]/(app)/casos/page.tsx` (new stub), `src/app/[locale]/(app)/caso/[id]/layout.tsx` (new shell layout + case tabs), `src/app/[locale]/(app)/forbidden.tsx` (new), `src/app/[locale]/pending-activation/page.tsx` (moved from `(app)` group) |
| 5 | `src/messages/es.json` (add `App.Sidebar.*`, `App.CaseTabs.*`, `App.Header.*`, `App.Dashboard.Stubs.*`) |
| 6 | `playwright.config.ts` (new), `tests/e2e/shell.smoke.spec.ts` (new), `tests/unit/shell/Sidebar.spec.tsx` (new), `tests/unit/shell/AuthGuard.spec.ts` (new) |

---

## 4. Implementation Tasks

If any test fails unexpectedly or behavior diverges from this contract, pause implementation and load `systematic-debugging` before attempting fixes.

### Task 0 — Pre-implementation version verification

**Skill gate:** `using-superpowers` → `find-docs` → `executing-plans`.

**No code changes.** Run and record output:

```bash
pnpm list tailwindcss class-variance-authority radix-ui
pnpm dlx shadcn@latest --version
node -e "const p = require('./package.json'); console.log(p.dependencies['@tanstack/react-query'])"
```

Confirm: Tailwind v4, cva ^0.7, radix-ui ^1.4, React Query ^5. If any version is unexpected, stop and report to Teo.

---

### Task 1 — UserProvider + AuthGuard + layout composition

**Skill gate:** `single-flow-task-execution` + `test-driven-development`.

**Step 1 — RED tests:**

Create `tests/unit/shell/AuthGuard.spec.ts`:
- Test that a call with no user results in redirect to `/login`.
- Test that a Payload admin user (not `isMemberUser`) results in redirect to `/login`.
- Test that an inactive abogado results in redirect to `/pending-activation`.
- Test that a valid cliente passes through.
- Test that a valid active abogado passes through.

**Step 2 — Implementation:**

Create `src/providers/UserProvider.tsx` — exact code from Section 2.2.

Create `src/components/auth/AuthGuard.tsx` — exact code from Section 2.1 (imports `UserProvider`).

Update `src/app/[locale]/(app)/layout.tsx`:
- Keep `<html><body>`, `ThemeProvider`, `NextIntlClientProvider`, `QueryProvider`.
- Add `AuthGuard` wrapping `{children}` inside the provider stack.
- Remove nothing else — no provider deletions.

**Step 3 — GREEN:** Tests pass. Run `pnpm exec tsc --noEmit`.

---

### Task 2 — shadcn/ui primitives scaffold

**Skill gate:** `single-flow-task-execution` + `find-docs` + `test-driven-development`.

**Step 1:** Run version check from Task 0.

**Step 2:** Run scaffolds:
```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add navigation-menu
```

**Step 3 — Customization after scaffold:**

For `button.tsx`:
- Ensure `min-h-[44px]` is part of the base variant (accessibility — touch target).
- `size: 'default'` must result in a ≥ 44px height button.

For `badge.tsx`:
- Add variants: `success` (green), `warning` (orange/`--brand-accent`), `error` (destructive).

**Step 4:** Run `pnpm exec tsc --noEmit` after scaffold. Fix any type errors — do not suppress.

---

### Task 3 — Shell components (AppShell, Sidebar, Header, MobileDrawer)

**Skill gate:** `single-flow-task-execution` + `test-driven-development` + `frontend-design`.

**Step 1 — RED tests:**

Create `tests/unit/shell/Sidebar.spec.tsx`:
- Test: `Sidebar` renders "Dashboard", "Casos" for both roles.
- Test: `Sidebar` does not include case-scoped links like `/caso/[id]/notaria`.

**Step 2 — Implementation:**

**`AppShell.tsx`** (`'use client'`):
- Manages sidebar open/closed state for mobile.
- Renders `Sidebar` (desktop, hidden on mobile), `MobileDrawer` (mobile sheet), `Header`, and a `<main>` content area.
- Uses CSS Grid or Flex layout: sidebar fixed-width on desktop, content fills rest.

**`Sidebar.tsx`** (`'use client'`):
```typescript
// Global shell nav only (case-scoped links live in caso/[id] layout tabs)
const navItems = [
  { href: '/dashboard', label: t('App.Sidebar.dashboard'), icon: LayoutDashboard },
  { href: '/casos', label: t('App.Sidebar.casos'), icon: FolderOpen },
]
```

Layout constraints:
- Width: `w-64` (16rem) on desktop
- Background: `bg-card border-r border-border`
- Nav links: `min-h-[44px] flex items-center gap-3 px-4 rounded-md`
- Active state: `bg-primary/10 text-primary font-medium`

**`Header.tsx`** (`'use client'`):
- Displays `user.firstName` (from `useUser()`)
- Role badge using `Badge` component (variant: `success` for abogado, default for cliente)
- Locale switcher placeholder (renders but does not toggle languages in RFC-004)
- Hamburger button for mobile drawer (min 44px)

**`MobileDrawer.tsx`** (`'use client'`):
- Uses Radix UI `Dialog` or `Sheet` (from shadcn `sheet` primitive).
- Contains same nav items as `Sidebar`.
- Opens via `Header` hamburger button.
- Accessible: `aria-label`, focus trap, keyboard dismiss.

**Step 3 — GREEN:** Sidebar unit tests pass. Run `pnpm exec tsc --noEmit`.

---

### Task 4 — Route stubs + forbidden page

**Skill gate:** `single-flow-task-execution` + `frontend-design`.

**Step 1 — Implementation (stub routes + access boundaries):**

Update `src/app/[locale]/(app)/app/page.tsx`:
- Remove the existing auth guard (now in `AuthGuard`).
- Redirect to `/${locale}/dashboard` — this page becomes a pure redirector.

Create `src/app/[locale]/(app)/dashboard/page.tsx`:
- Server Component.
- Fetches active cases count via Payload Local API.
- Wraps client component in `HydrationBoundary` (see Section 2.7 pattern).
- Shows: welcome message (`t('App.Dashboard.Stubs.welcome', { name: user.firstName })`), active cases count card (read-only), CTA "Ver mis casos".
- No form inputs, no mutations in RFC-004.

Create `src/app/[locale]/(app)/casos/page.tsx`:
- Stub only. Shows: "Mis casos" heading, empty state "No tienes casos activos. ¿Comenzamos?" with CTA.
- Data fetching deferred to RFC-005.

Create `src/app/[locale]/(app)/caso/[id]/layout.tsx`:
- **Must NOT render `<html>` or `<body>`.**
- Adds case-level breadcrumb or tab navigation shell (layout only — no data).
- `Notaría` tab/link is case-scoped (`/caso/[id]/notaria`) and only rendered for `abogado`.
- Returns `<>{children}</>` with optional nav wrapper.

Create `src/app/[locale]/(app)/forbidden.tsx`:
```tsx
export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-md w-full text-center p-8">
        <h1 className="text-2xl font-semibold text-foreground">
          {t('App.Errors.forbidden.title')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t('App.Errors.forbidden.description')}
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">{t('App.Errors.forbidden.cta')}</Link>
        </Button>
      </Card>
    </main>
  )
}
```

Move `pending-activation` route out of `(app)`:
- Source: `src/app/[locale]/(app)/pending-activation/page.tsx`
- Target: `src/app/[locale]/pending-activation/page.tsx`
- Keep same UI/copy; route path remains `/${locale}/pending-activation`.

---

### Task 5 — i18n keys

**Skill gate:** `single-flow-task-execution`.

Add to `src/messages/es.json` under `"App"`:

```json
"Sidebar": {
  "dashboard": "Panel",
  "casos": "Mis casos",
  "cerrarSesion": "Cerrar sesión"
},
"CaseTabs": {
  "notaria": "Proceso notarial"
},
"Header": {
  "locale": "ES",
  "roleCliente": "Cliente",
  "roleAbogado": "Abogada"
},
"Dashboard": {
  "Stubs": {
    "welcome": "Hola, {name}.",
    "activeCases": "Casos activos",
    "noCases": "¿Comenzamos?",
    "noCasesDescription": "Aún no tienes un proceso activo.",
    "noCasesCta": "Agenda tu consulta"
  }
},
"Errors": {
  "forbidden": {
    "title": "Acceso restringido",
    "description": "Esta sección es exclusiva del equipo legal. Si crees que esto es un error, contacta al soporte.",
    "cta": "Volver al panel"
  }
}
```

---

### Task 6 — Tests

**Skill gate:** `single-flow-task-execution` + `verification-before-completion`.

**Playwright config:**

Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 12'] } },
  ],
  // Requires: pnpm dev running locally
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
})
```

**Smoke scenarios** in `tests/e2e/shell.smoke.spec.ts`:

1. **Unauthenticated → login redirect:**
   - Navigate to `/es/dashboard` without session.
   - Assert redirect to `/es/login`.

2. **Active abogado → enters app:**
   - Seed active abogado member via Payload Local API fixture.
   - Log in, navigate to `/es/dashboard`.
   - Navigate to `/es/caso/test-id/notaria`.
   - Assert forbidden page is NOT rendered.

3. **Inactive abogado → pending-activation:**
   - Seed abogado with `isActive: false`.
   - Log in, assert redirect to `/es/pending-activation`.

4. **Cliente on `/notaria` → forbidden:**
   - Seed cliente member, log in.
   - Navigate to `/es/caso/test-id/notaria`.
   - Assert forbidden page renders (title "Acceso restringido").

5. **Layout persistence (desktop):**
   - Log in as cliente.
   - Navigate to `/es/dashboard`, assert sidebar visible.
   - Click "Mis casos", assert sidebar still visible (layout persists).

**Axe accessibility check** — add to smoke spec:
```typescript
import AxeBuilder from '@axe-core/playwright'
// In test: dashboard page
const results = await new AxeBuilder({ page }).analyze()
expect(results.violations).toEqual([])
```

**Vitest unit tests** in `tests/unit/shell/Sidebar.spec.tsx` — see Task 3 RED tests above.

---

## 5. Verification Baseline

Run after all tasks complete:

```bash
# TypeScript
pnpm exec tsc --noEmit

# Lint
pnpm exec eslint . --quiet

# Generate import map (after new components registered)
pnpm exec payload generate:importmap

# Unit tests
pnpm exec vitest run tests/unit

# Build
pnpm build

# E2E (run locally — Teo executes)
pnpm exec playwright test
```

All must pass with zero errors. Warnings acceptable only if pre-existing.

---

## 6. No-Suppression Checklist

Per `.agents/standards/NO-ERROR-SUPPRESSION.md`:
- No new `@ts-ignore`
- No new `@ts-expect-error`
- No new `as any` or `as unknown as T`
- If shadcn/ui generated files have type issues with Tailwind v4, fix them — do not suppress
- Escalate to Teo after two failed attempts on the same error

---

## 7. Teo Visual Review Gate (mandatory before RFC closure)

After Playwright smoke tests pass, Teo reviews the running shell at `pnpm dev` on:
- **375px viewport** (iPhone SE — mobile) — MobileDrawer, touch targets, typography
- **1280px viewport** (desktop) — Sidebar, Header, Dashboard stub, proportions

Teo signs off on:
- [ ] Proportions feel correct — no element looks oversized or cramped
- [ ] Visual hierarchy is clear — title > subtitle > body progression
- [ ] Touch targets are comfortable at mobile size
- [ ] Brand colors applied correctly (`#002845` for text, `#3A8DA8` for buttons/accents)
- [ ] Dark mode renders correctly (toggle via ThemeProvider)

The RFC is not closed until Teo's visual sign-off is recorded in the execution audit.

---

## 8. Success Criteria

- [ ] `pnpm exec tsc --noEmit` passes
- [ ] `pnpm exec vitest run tests/unit` passes (Sidebar global-nav tests + server notaria guard tests included)
- [ ] `pnpm build` completes with no errors
- [ ] `pnpm exec playwright test` — all 5 smoke scenarios pass locally
- [ ] Teo visual review — proportions, scale, brand colors approved on 375px + 1280px
- [ ] `es.json` contains all `App.Sidebar.*`, `App.Header.*`, `App.Dashboard.Stubs.*`, `App.Errors.forbidden.*` keys
- [ ] `forbidden.tsx` renders correctly for cliente attempting to access `/notaria`
- [ ] `UserProvider`/`useUser()` is used in all client shell components (no direct Payload calls from client)

---

## 9. Deferred Items

- **RFC-005:** Onboarding funnel screens (`/consulta`, `/nueva-consulta`, `/pago`).
- **RFC-007+:** Case workspace — heirs, assets, documents, payments editing.
- **APPT-001:** Slot capacity auto-update (backlog).
- **WebSocket/SSE:** Real-time updates via `refetchInterval` — deferred to a dedicated RFC.
- **Full CI Playwright pipeline:** Teo runs locally for RFC-004; CI integration tracked for later.

---

## 10. Addendum — Teo Feedback Fixes (Localization + Shell Copy)

### 10.0 Scope note (executor)
Implement **only** the tasks in this addendum. Earlier RFC-004 shell scaffolding already exists in the repo; do not reimplement those sections unless a task here overlaps a touched file.

### 10.1 In scope
- Fix **EN locale `MISSING_MESSAGE`** by completing the missing `App.*` namespace keys in `src/messages/en.json`.
- Update **role badge wording** so it no longer uses literal/offensive “Cliente” and handle lawyer gender neutrally (use “Abogado/a”).
- Update **mobile drawer** title/description:
  - Include brand: “Tu Herencia Fácil”
  - Soften the description wording (no “must choose or else” feel).
- Fix **dashboard copy** so the empty-state message changes when active case count changes (0 vs >0).
- Fix **`/casos` empty/CTA copy** to avoid duplicating the dashboard CTA (“Ver mis casos”) and to reflect the active case count.
- Fix **`/pending-activation` layout** so it uses the global shell providers/styles (no nested `<html>`/`<body>`), and personalize the message with the lawyer’s name + restyle logout to match UI primitives.

### 10.2 Out of scope (explicit)
- Payload admin console warnings (source map 404, hydration `disabled={true}`) — those are vendor/tooling noise in dev.
- Implementing new app controls: logout/language/theme toggles in the authenticated shell (future RFC).
- A “gender selector” schema/UX. For now, we only implement a neutral label to unblock UX.

---

## 10.3 Implementation Tasks

### Task 10.3.1 — EN translation completeness (fix `MISSING_MESSAGE`)
**Files:**
- `src/messages/en.json`
- `src/messages/es.json`

**Step 1 — RED tests:**
1. Create `tests/unit/i18n/enMessages.spec.ts` that imports `src/messages/en.json` and asserts the presence of the following paths under `App`:
   - `App.Header.locale`, `App.Header.roleCliente`, `App.Header.roleAbogado`
   - `App.Sidebar.mobileDrawerTitle`, `App.Sidebar.mobileDrawerDescription`
   - `App.Dashboard.Stubs.welcome`, `activeCases`, `noCases`, `noCasesDescription`, `noCasesCta`
   - `App.Errors.forbidden.title`, `description`, `cta`
   - `App.CaseTabs.notaria`
2. Run:
```bash
pnpm exec vitest run tests/unit/i18n/enMessages.spec.ts
```

**Step 2 — GREEN implementation:**
- Add the missing keys (and any new keys introduced by Tasks 10.3.2–10.3.5).
- Ensure the `App` namespace structure matches what `next-intl` expects at runtime.

---

### Task 10.3.2 — Update role + mobile drawer wording (ES + EN)
**Files:**
- `src/messages/es.json`
- `src/messages/en.json`

**Required wording changes:**
- `App.Header.roleCliente`: replace “Cliente” with a less literal/offensive label (Paola-approved; default recommendation: “Titular” in ES and “Beneficiary” in EN).
- `App.Header.roleAbogado`: change “Abogada” to a neutral label “Abogado/a” (ES) and “Lawyer” (EN).
- `App.Sidebar.mobileDrawerTitle`: set to include brand + navigation word (ES example: `Tu Herencia Fácil — Navegación`).
- `App.Sidebar.mobileDrawerDescription`: soften to an invitational phrase (ES/EN).

---

### Task 10.3.3 — Personalize `/pending-activation` + fix nested layout providers
**Files:**
- `src/app/[locale]/pending-activation/layout.tsx`
- `src/app/[locale]/pending-activation/page.tsx`

**Step 1 — RED test (E2E):**
Update `tests/e2e/shell.smoke.spec.ts` in the “inactive abogado is redirected…” test:
- After redirect, assert the page contains the inactive lawyer’s name (seeded as `E2E` in `tests/helpers/shellE2eMembers.ts`) somewhere in the visible text.

**Step 2 — GREEN implementation:**
- Update `pending-activation/layout.tsx` to **NOT** render `<html>` or `<body>`; it must delegate to `src/app/[locale]/layout.tsx` so ThemeProvider + NextIntl messages/styles apply.
- Update `pending-activation/page.tsx`:
  - Use the authenticated user’s name in the copy.
  - Replace the logout button with the project `Button` component (matching shadcn styling).

---

### Task 10.3.4 — Dashboard: conditional empty vs populated copy (uses active count)
**Files:**
- `src/app/[locale]/(app)/dashboard/DashboardClient.tsx`
- `src/messages/es.json`
- `src/messages/en.json`

**Step 1 — RED tests (unit, jsdom):**
Create `tests/unit/dashboard/DashboardClient.copy.spec.tsx`:
1. Mock:
   - `useQuery` to return `data = 0` and `data = 1`
   - `useTranslations` to provide deterministic strings for:
     - `noCasesDescription`
     - `hasCasesDescription` (new key)
2. Assert:
   - When `activeCasesCount = 0`, the “no cases” description is rendered.
   - When `activeCasesCount > 0`, the “has cases” description is rendered (must include the count).

**Step 2 — GREEN implementation:**
- Add new translation key(s) (recommended):
  - `App.Dashboard.Stubs.hasCasesDescription`: `Tienes {count} caso(s) activo(s).` (ES)
  - EN equivalent.
- Update `DashboardClient` to branch on `activeCasesCount`.

---

### Task 10.3.5 — `/casos` page: CTA dedupe + reflect active count
**Files:**
- `src/app/[locale]/(app)/casos/page.tsx`
- `src/app/[locale]/(app)/dashboard/queries.ts` (if needed for reuse)
- `src/messages/es.json`
- `src/messages/en.json`

**Step 1 — RED test (E2E):**
Extend `tests/e2e/shell.smoke.spec.ts` with an additional scenario:
- Login as `cliente`, navigate to `/es/casos`.
- Assert the empty-state CTA is **not** “Ver mis casos” and instead is the new dedicated label (default recommendation: “Volver al panel”).

**Step 2 — GREEN implementation:**
- Fetch active cases count on the server (reuse `getActiveCasesCount`).
- Render empty-state vs populated-state copy using new `App.Cases.*` keys (so dashboard and casos do not reuse the same CTA labels).

---

### Task 10.3.6 — Seed deterministic active case for the e2e “active abogado” path
**Files:**
- `tests/helpers/shellE2eMembers.ts`

**Required:**
- Ensure the seeded `abogadoActive` has exactly 1 active `cases` record assigned (so the dashboard copy/count tests are deterministic).
- Delete any existing `cases` for those seeded member IDs before re-creating.

---

## 10.4 Verification Baseline (addendum only)
Run after implementing all addendum tasks:
```bash
pnpm exec vitest run tests/unit/i18n/enMessages.spec.ts
pnpm exec vitest run tests/unit/dashboard/DashboardClient.copy.spec.tsx
pnpm exec vitest run tests/unit
pnpm exec playwright test -- tests/e2e/shell.smoke.spec.ts
pnpm exec tsc --noEmit
pnpm build
```

---

## 10.5 Addendum Success Criteria
- EN client has no `MISSING_MESSAGE` runtime errors for shell pages.
- Mobile drawer header includes “Tu Herencia Fácil” and navigation word (ES + EN).
- `/pending-activation`:
  - uses app providers/styles (no missing theme/i18n artifacts)
  - includes the lawyer name in the text
  - logout button matches shadcn button styling.
- Dashboard description changes for `activeCasesCount = 0` vs `>0`.
- `/casos` empty CTA does not duplicate “Ver mis casos” and is consistent with navigation intent.

