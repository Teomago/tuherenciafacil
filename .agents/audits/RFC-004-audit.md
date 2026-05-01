# Audit — RFC-004: App Shell & UI Primitives

**Auditor:** Antigravity / Claude Sonnet 4.6  
**Method:** Adversarial — spec is assumed wrong until verified against repo, existing code, and design decisions.  
**Date:** 2026-04-28  
**Spec:** `.agents/specs/RFC-004-app-shell-ui-primitives.md`  
**Verdict:** CONDITIONAL PASS — 0 blocking, 2 high, 4 medium, 2 low. All findings resolved in Teo review. Ready for Decision (Phase 3).

---

## Audit Inputs

Files read and verified against:

- `.agents/specs/RFC-004-app-shell-ui-primitives.md` (the spec under audit)
- `.agents/context/PROJECT_STATE.md` (current reconciled state)
- `.agents/context/BACKLOG.md` (open items)
- `.agents/AGENTS.md` (pipeline rules)
- `docs/design/SCREEN_MAP.md` (target UX / route map)
- `src/app/[locale]/(app)/layout.tsx` (live layout — 32 lines, no auth guard)
- `src/app/[locale]/(app)/app/page.tsx` (live entry — auth guard exists here at page level)
- `src/styles/frontend/theme.css` (existing Tailwind v4 `@theme` tokens)
- `src/styles/admin/theme.css` (admin theme for comparison)
- `package.json` dependency audit (radix-ui, tailwindcss v4, playwright, cva, lucide-react, next-intl)
- `src/payload/collections/succession/*.ts` (backend baseline, not re-specified)

---

## Severity Legend

| Severity     | ID prefix | Meaning                                                                       |
| ------------ | --------- | ----------------------------------------------------------------------------- |
| **BLOCKING** | `B-N`     | Decision file cannot be drafted safely until resolved                         |
| **HIGH**     | `H-N`     | Likely runtime bug, security gap, data integrity issue, or executor ambiguity |
| **MEDIUM**   | `M-N`     | Wrong output, weak verification, or maintainability risk                      |
| **LOW**      | `L-N`     | Cosmetic or future-proofing issue                                             |

---

## Section 1 — Auth Guard Architecture

### HIGH H-1: `layout.tsx` renders `<html>` — auth redirect will break nested layout pattern

**Spec says:** Move auth guard from `app/page.tsx` to `(app)/layout.tsx` (Section 7.1).

**Current code:** `src/app/[locale]/(app)/layout.tsx` renders a full `<html><body>` tree. This is the root layout for the `(app)` route group. If auth is placed here, it works for the current single-page case. However, `SCREEN_MAP.md` shows `src/app/[locale]/(app)/` will house multiple nested layouts including `caso/[id]/layout.tsx`. The `<html><body>` in the `(app)/layout.tsx` means it's currently acting as a full root layout (not just a shell layout).

**Problem:** In Next.js App Router, you can only have **one `<html><body>` per request**. The existing `(app)/layout.tsx` renders `<html><body>`, which means it _is_ the root layout for that route group — but there is no separate `src/app/layout.tsx`. This is valid but unusual. When the spec adds nested layouts (e.g., `caso/[id]/layout.tsx`), those must NOT render `<html><body>` again. If the executor misreads the pattern, they may create duplicate `<html>` tags.

**Required clarification for decision file:** The decision must explicitly state:

1. `(app)/layout.tsx` retains `<html><body>` (it is the root layout for this group).
2. All child layouts (`caso/[id]/layout.tsx`, etc.) must not render `<html><body>` — they wrap only their slot content.
3. The auth guard (`payload.auth()` + redirects) goes **directly inside** `(app)/layout.tsx`'s server component body, before the JSX return.

### HIGH H-2: Auth guard does not address `users` (admin-only) attempting to access `/app`

**Spec says (Section 5):** Four states: cliente, abogado, inactive abogado, unauthenticated. Redirects cover unauthenticated → login, inactive abogado → pending-activation.

**Problem:** The `users` collection (Payload admin users) is separate from `members`. A Payload admin (`users` collection) technically has a valid Payload session. If an admin user hits `/app`, `payload.auth()` will return a `users` record, not a `members` record. The spec's check `user.role === 'abogado'` will fail silently (admin users have `roles: string[]`, not a `role` field), and the admin will land in the app without a valid member profile. The existing `app/page.tsx` handles this via the `isMemberUser(user)` type guard, but the spec does not mention this guard must be preserved in `layout.tsx`.

**Required fix for decision file:** The auth guard in `layout.tsx` must:

```typescript
if (!user || !isMemberUser(user)) redirect(`/${locale}/login`)
```

The `isMemberUser` type guard must be used **before** any `.role` access. This pattern exists in the current code and must not be lost in the refactor.

---

## Section 2 — Role-Aware Navigation

### MEDIUM M-1: `/notaria` access denial is described as "403 page" but the correct pattern is `redirect` or `notFound()`

**Spec says (Section 5):** Clients are "Redirected from `/app/notaria`." Section 11 says "403 Forbidden: Custom error page for clients attempting to access `/notaria`."

**Problem:** These two descriptions are contradictory. A redirect silently moves the user; a 403 error page shows an explicit denial. Furthermore, `SCREEN_MAP.md` (line 34) says: "`/app/caso/[id]/notaria` — devuelve 403 al cliente." The correct Next.js implementation for this is not a redirect but rather returning `notFound()` or throwing an explicit error in `caso/[id]/notaria/page.tsx`, or using Next.js's `forbidden()` (introduced in v15). Since the project uses Next.js 16.2.3, `forbidden()` is available.

**Required fix for decision file:** Decision must specify the exact access control pattern for `/notaria`:

- Is it a redirect to dashboard? (Poorer UX — user doesn't know why they were moved)
- Is it a `forbidden()` call with a custom `forbidden.tsx` error boundary? (Correct and explicit)
- The `caso/[id]/layout.tsx` should check role and call `forbidden()` for clients accessing notaría.

### MEDIUM M-2: `UserProvider` pattern is underspecified — potential client/server boundary confusion

**Spec says (Section 7.1, step 4):** "Provide `user` context to children via a custom `UserProvider` or React `use` hook pattern."

**Problem:** The spec offers two alternatives without picking one. In Next.js App Router:

- `UserProvider` (client component wrapping children) requires the user data to be serialized and passed from the server. This is the correct pattern for making user data available in client components.
- The `React.use()` hook pattern works for consuming promises in Server Components but does NOT propagate to Client Components.

**The risk:** If the executor chooses the wrong pattern, client components (Sidebar, Header with logout button) won't have access to `user` data, or will redundantly call `payload.auth()` on the client side (which is not how Payload's browser auth works).

**Required fix for decision file:** Specify exactly:

1. `layout.tsx` (Server Component) fetches user via `payload.auth()`.
2. User is passed as a prop to a `UserProvider` client component that wraps children.
3. Client components access user via a `useUser()` hook from this provider.
4. No `payload.auth()` calls from the client side.

---

## Section 3 — Technical Modernity (Tailwind v4 + Radix UI)

### MEDIUM M-3: `cva` is listed as a Button primitive but no integration with the existing `@theme` token system is specified

**Spec says (Section 8):** Button uses `cva` and `lucide-react`. Card uses `bg-card`, `border`.

**Current state:** `src/styles/frontend/theme.css` already defines a comprehensive `@theme` block with semantic tokens (`--color-primary`, `--color-card`, `--color-background`, etc.) aligned with shadcn/ui conventions. `class-variance-authority` (version `^0.7.1`) is already installed. `radix-ui` (the meta-package, v1.4.3) is installed.

**Problem:** The spec says to build Button/Card/Badge from scratch using `cva` + Radix UI. But the existing theme system was clearly designed to support a shadcn/ui-style component approach. Building ad-hoc `cva` variants that don't reference the existing `--color-primary`, `--color-card` tokens correctly risks: (a) inconsistent tokens between the shell and future RFC-005+ components, (b) duplicating work that shadcn/ui CLI would generate correctly.

**The real question the spec avoids:** Is this project using shadcn/ui components or building primitives manually? The installed dependencies (`radix-ui`, `class-variance-authority`, `tailwind-merge`, existing `@theme` structure) strongly indicate shadcn/ui was the intended approach.

**Required clarification for decision file:** State explicitly:

- **Option A:** Use shadcn/ui CLI to scaffold Button, Card, Badge, and NavigationMenu into `src/components/ui/`. This is the fastest path consistent with existing deps.
- **Option B:** Build primitives manually using `cva` + Radix UI, mapping to the existing `@theme` tokens. More control, more work.
  Decision must pick one. Executor cannot make this call.

### LOW L-1: Color palette from `SCREEN_MAP.md` is not referenced in the spec

**Spec says (Section 8):** Typography uses `Inter`, Card uses `bg-card`, `border` — generic shadcn tokens.

**Design doc (`SCREEN_MAP.md`, lines 587-611):** Defines specific brand tokens: corporate blue `#002845`, tech blue `#3A8DA8`, accent orange `#FF8C3C`. The `frontend/theme.css` already registers `--color-brand-corporate`, `--color-brand-tech`, `--color-brand-accent` — but the hex values are via `hsl(var(--brand-corporate))` which means they need to be defined in `globals.css`.

**Problem:** The spec doesn't tell the executor to register the brand hex values in `globals.css` (the `--brand-*` CSS vars). If this step is missed, `color-brand-*` tokens will resolve to `hsl(undefined)` and components will be colorless.

**The spec also notes:** "Pendiente: Confirmar naranja (#FF8C3C) con diseñador." The decision should not block execution on an unresolved design decision. The executor should use the provisional values.

**Required for decision file:** Include the three `--brand-*` HSL definitions that must be added to `globals.css`, or explicitly tell executor to add them using the hex values from SCREEN_MAP.md as-is.

---

## Section 4 — Accessibility (DEC-003)

### MEDIUM M-4: "Adult-friendly" DEC-003 requirement is acknowledged but not testable

**Spec says (Section 8):** Typography: 16px minimum. Section 14 (Success Criteria): "Accessibility: Audit with Axe (lighthouse) shows >90 for App Shell pages."

**Problem 1 — Lighthouse >90 is not the right metric for DEC-003.** DEC-003 requires large touch targets, high-contrast text, and a minimum 16px body font — these are WCAG 2.1 AA requirements. A Lighthouse accessibility score >90 is a reasonable proxy, but it's not in `package.json` scripts and "run Lighthouse" is not a verifiable CI step. The executor cannot automate this.

**Problem 2 — Touch target size is not specified.** WCAG 2.5.8 (level AA in WCAG 2.2) requires touch targets of at least 24×24 CSS pixels. DEC-003 says "large touch targets." The spec does not give the executor a concrete minimum (e.g., 44px height for buttons, the Apple HIG standard, or 48px, the Material Design standard).

**Problem 3 — High-contrast tokens are not validated.** The brand colors (`#002845` on white, `#3A8DA8` on white) need contrast ratio checks. `#3A8DA8` on white is approximately 3.4:1 — this **fails** WCAG AA (4.5:1 for normal text, 3:1 for large text). If the executor uses `color-brand-tech` as button text color on a white background, it will fail accessibility.

**Required for decision file:**

1. Specify minimum touch target: 44px height minimum for all interactive elements.
2. Specify a `pnpm exec axe-core` or `@axe-core/playwright` check as the verifiable test, not a manual Lighthouse run.
3. Flag `#3A8DA8` as unsuitable for text on white — use `#002845` (corporate, ~12:1 contrast) for text, `#3A8DA8` only for decorative elements or large text (≥18.66px bold or ≥24px regular).

---

## Section 5 — Testability & Success Criteria

### MEDIUM M-5: Integration tests use Playwright but no test setup or fixture strategy is specified

**Spec says (Section 12.1):** Playwright integration tests for auth redirects, inactive lawyer guard, layout persistence.

**Current state:** `@playwright/test ^1.58.2` and `playwright ^1.58.2` are installed. No Playwright config exists in the repo (verified by absence of `playwright.config.ts`).

**Problem:** Running Playwright E2E tests requires a running Next.js server (or a start URL), browser installation, and a test database with seeded member accounts. None of this is specified. The executor will either skip E2E tests entirely or write tests that can't run in CI.

**Required for decision file:** Either:

- Scope integration tests to unit-level only (Vitest testing component render logic), and defer Playwright E2E to a dedicated RFC.
- **Or** specify: (a) `playwright.config.ts` must be created with `baseURL: 'http://localhost:3000'`, (b) tests run against `pnpm dev` with a seeded test DB, (c) a fixture function creates a test member session using Payload's Local API.

### LOW L-2: Success criteria are not specific enough for the executor to know "done"

**Spec says (Section 14):**

```
- [ ] Navigation sidebar adapts based on member.role.
- [ ] /[locale]/app correctly guards all children routes.
- [ ] A set of reusable UI primitives (Button, Card, Badge) is used throughout the shell.
- [ ] Mobile/Desktop navigation is fully functional.
- [ ] es.json contains all necessary translations for the shell.
```

**Problem:** None of these are verifiable by code. "Sidebar adapts" — tested how? "Guards all children routes" — how many routes, which ones? "Mobile/Desktop navigation fully functional" — what does this mean concretely?

**Recommended for decision file:** Rewrite as verifiable checkboxes, e.g.:

- `[ ]` `pnpm exec tsc --noEmit` passes.
- `[ ]` `pnpm exec vitest run tests/unit` passes (unit test: Sidebar renders 'Notaría' only for abogado role).
- `[ ]` `pnpm build` completes with no errors.
- `[ ]` Routes `/dashboard` and `/casos` return 302 → `/login` when `Authorization` header is absent (curl/playwright check).
- `[ ]` `es.json` contains keys `App.Sidebar.*`, `App.Header.*`, `App.Dashboard.Stubs.*`.

---

## Section 6 — Backend Integration & "No Re-specification" Rule

### Passing: Backend Already Exists rule is respected

Section 9.1 correctly lists all implemented collections and states they "must not be re-specified or modified." No new collection fields or backend logic are proposed. ✅

### Passing: Route map is consistent with SCREEN_MAP.md

Routes in Section 6 (`/dashboard`, `/casos`, `/caso/[id]`) match `SCREEN_MAP.md` lines 52-60. The `caso/[id]/layout.tsx` is correctly noted as "Layout-only" scope. ✅

### Passing: Stack choices are consistent with installed deps

- Tailwind v4 (`@theme` directive): Already in use at `src/styles/frontend/theme.css`. ✅
- `class-variance-authority`: Already installed. ✅
- `radix-ui` (meta-package v1.4.3): Already installed. ✅
- `lucide-react v1.6.0`: Already installed. ✅
- `next-intl v4.9.0`: Already installed and in use. ✅
- No new dependency additions required by this spec — good. ✅

---

## Summary Table

| ID  | Severity | Area             | Issue                                                                                                                             |
| --- | -------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| H-1 | HIGH     | Auth Guard       | `layout.tsx` renders `<html><body>` — nested layouts must not duplicate; decision must specify the structural contract explicitly |
| H-2 | HIGH     | Auth Guard       | Guard doesn't filter `users` (admin) vs `members` — `isMemberUser()` type guard must be preserved in refactor                     |
| M-1 | MEDIUM   | Role Navigation  | `/notaria` access denial: spec contradicts itself (redirect vs 403); must pick `forbidden()`                                      |
| M-2 | MEDIUM   | UserProvider     | Two incompatible patterns offered (`UserProvider` vs `React.use()`); executor must be told which one                              |
| M-3 | MEDIUM   | UI Primitives    | Spec doesn't choose between shadcn/ui CLI and manual `cva` build — executor cannot make this decision                             |
| M-4 | MEDIUM   | Accessibility    | DEC-003 requirements not testably specified: no touch target size, `#3A8DA8` may fail WCAG AA for text                            |
| M-5 | MEDIUM   | Testing          | Playwright E2E tests proposed but no `playwright.config.ts`, no fixture strategy, no test DB setup                                |
| L-1 | LOW      | Design Tokens    | Brand hex values from SCREEN_MAP.md not wired into `globals.css` — missing step for executor                                      |
| L-2 | LOW      | Success Criteria | Acceptance criteria are not verifiable/measurable as written                                                                      |

---

## Recommended Path Forward

1. **H-1 (required for decision):** Clarify the `(app)/layout.tsx` structural contract. Confirm it is the root layout for the group. Specify that child layouts do not render `<html><body>`. State exactly where the auth guard goes.
2. **H-2 (required for decision):** Add `isMemberUser()` guard to the layout auth logic spec. This is a copy of what exists in `app/page.tsx` — it must not be dropped.
3. **M-1:** Pick `forbidden()` for `/notaria`. Add a `forbidden.tsx` to the `(app)` group for the error UI.
4. **M-2:** Pick `UserProvider` pattern. Write the exact interface in the decision (server fetches → passes to client Provider → `useUser()` hook).
5. **M-3:** Teo must decide: shadcn/ui CLI or manual primitives. Recommendation: use shadcn/ui CLI for Button, Card, Badge — it integrates correctly with the existing `@theme` tokens and is 10× faster to execute.
6. **M-4:** Add to decision: 44px minimum touch target for buttons, `@axe-core/playwright` as the accessibility verification step, and flag `#3A8DA8` as decorative-only.
7. **M-5:** Either scope testing to Vitest unit tests only (defer Playwright to a later RFC), or add explicit Playwright setup instructions to the decision.
8. **L-1 + L-2:** Include in decision: brand HSL values for `globals.css`, rewrite success criteria as verifiable commands.

---

_Stop here. Waiting for Teo's feedback before drafting Phase 3 (Decision)._

---

## Teo Feedback Resolution Addendum

**Date:** 2026-04-28  
**Status:** All findings resolved — Ready for Decision (Phase 3)

---

### H-1 — Layout structural contract ✅ APPROVED

**Resolution:** Adopt the `AuthGuard` server component pattern:

```
(app)/layout.tsx (Server, renders <html><body>, providers only)
  └── AuthGuard (async Server Component — runs per-request)
        └── UserProvider (Client Component)
              └── children
```

`AuthGuard` runs `payload.auth({ headers })`, executes all redirect logic, then passes the validated `member` as a prop to `UserProvider`. All child layouts (`caso/[id]/layout.tsx`, etc.) are shell layouts only — no `<html><body>`, no auth logic.

---

### H-2 — `isMemberUser()` guard preservation ✅ APPROVED

**Resolution:** `AuthGuard` must use the `isMemberUser()` type guard before any `.role` access. If `payload.auth()` returns a `users` record (Payload admin), the guard treats it as unauthenticated and redirects to login:

```typescript
const { user } = await payload.auth({ headers: await headers() })
if (!user || !isMemberUser(user)) redirect(`/${locale}/login`)
if (user.role === 'abogado' && user.isActive === false) redirect(`/${locale}/pending-activation`)
```

This is identical to the current `app/page.tsx` logic and must not be simplified or removed in the refactor.

---

### M-1 — `/notaria` access denial ✅ APPROVED

**Resolution:** Use `forbidden()` from Next.js (available in v15+/16.x). `caso/[id]/notaria/page.tsx` checks role and calls `forbidden()` for `cliente`. A `forbidden.tsx` file in the `(app)` route group provides the error UI: "No tienes acceso a esta sección" consistent with the shell design.

---

### M-2 — UserProvider pattern ✅ APPROVED

**Resolution:** `UserProvider` pattern (server → client). Exact interface for the decision:

- `AuthGuard` (Server) fetches user, passes as prop to `<UserProvider user={member}>`
- `UserProvider` (`'use client'`) wraps children in a React context
- Client components access user via `useUser()` hook exported from the same file
- No `payload.auth()` calls from the client side

---

### M-3 — shadcn/ui CLI ✅ APPROVED + Version verification step added

**Resolution:** Use shadcn/ui CLI. Teo's reasoning: consistency with existing CMS blocks pattern. The decision will include a **mandatory pre-implementation version check step** before any UI library work:

```bash
# Verify versions before scaffold
npx shadcn@latest --version
pnpm list tailwindcss @radix-ui/react-* class-variance-authority
```

Executor must confirm:

- `tailwindcss ^4.x` (not v3 — `@theme` directive is v4-only)
- `radix-ui` meta-package or individual `@radix-ui/react-*` packages present
- `class-variance-authority ^0.7.x` present
- shadcn/ui CLI version compatible with the installed Tailwind version

Then scaffold: `pnpm dlx shadcn@latest add button card badge navigation-menu`

---

### L-1 — Brand tokens ✅ RESOLVED (already wired)

**Resolution:** `globals.css` already defines all three brand HSL values (`--brand-corporate`, `--brand-tech`, `--brand-accent`) and `theme.css` registers them as `--color-brand-*`. Executor verifies only — no changes needed.

---

### M-4 — Accessibility + Proportions + Visual Testing ✅ APPROVED

**Resolution (expanded per Teo):**

**Accessibility rules for the decision:**

- Minimum 44px height on all interactive elements (buttons, links, form inputs)
- Body font minimum 16px (already in Inter + base styles)
- `#3A8DA8` (tech blue) is allowed for: button backgrounds with white text (AA for large text), decorative icons, subtle accents. **Not** as body text color on light backgrounds.
- `#002845` (corporate blue) is the primary text color — ~12:1 contrast, AAA-level.
- Accessibility verification: `@axe-core/playwright` run as part of the Playwright smoke suite

**Proportions and visual scale (new — per Teo):**

- The executor must apply a **consistent spatial scale system** throughout all shell components. The decision will mandate use of Tailwind's spacing scale without arbitrary one-off values (e.g., no `p-[13px]` — use `p-3` or `p-4`). This ensures visual rhythm and harmony between elements.
- All component sizing relationships (sidebar width, header height, card padding, icon size relative to text) must follow the existing design tokens: `--header-height: 4rem`, `--gutter-inline: 1.25rem`, etc.
- Icon sizes must be proportional to adjacent text: 20px icon next to 16px text (1.25× ratio), 24px icon next to 18px text. No oversized or undersized icons relative to their context.
- The `frontend-design` skill is **mandatory** for the executor during all UI/UX implementation work in this RFC and all subsequent frontend RFCs. It must be loaded alongside `using-superpowers`, `context7`, and `mempalace`.

**Visual testing by Teo (new — per Teo):**

- A dedicated **Teo Visual Review** gate is added to the success criteria. After Playwright smoke tests pass, Teo does a manual visual review of the running shell on both mobile (375px) and desktop (1280px) viewport widths.
- Teo signs off on: proportions feel right, hierarchy is clear, touch targets are comfortable, brand colors are correctly applied.
- The RFC is not closed until Teo's visual approval is recorded in the execution audit.

---

### M-5 — Testing strategy ✅ APPROVED

**Resolution:** Hybrid approach:

1. **Vitest unit tests (CI):** Component render logic — role-conditional sidebar items, AuthGuard redirect conditions as pure functions.
2. **Playwright E2E (local, run by Teo):** `playwright.config.ts` scaffolded in the decision. 5 smoke scenarios: unauthenticated → login, active abogado → app, inactive abogado → pending-activation, cliente on `/notaria` → forbidden, layout persistence between `/dashboard` and `/casos`.
3. **Axe accessibility check:** Run via `@axe-core/playwright` as part of the Playwright suite.

---

### L-2 — Success criteria ✅ APPROVED

**Resolution:** Rewrite success criteria as verifiable commands in the decision file:

- `[ ]` `pnpm exec tsc --noEmit` passes
- `[ ]` `pnpm exec vitest run tests/unit` passes (role-conditional sidebar unit test included)
- `[ ]` `pnpm build` completes with no errors
- `[ ]` `pnpm exec playwright test` — 5 smoke scenarios pass locally
- `[ ]` Teo visual review — proportions, scale, brand colors approved on 375px + 1280px
- `[ ]` `es.json` contains all `App.Sidebar.*`, `App.Header.*`, `App.Dashboard.Stubs.*` keys

---

### TanStack Query — New addition ✅ APPROVED

**Context7 verified. Existing setup confirmed correct.**

`@tanstack/react-query ^5.95.2` is already installed. `src/providers/QueryProvider.tsx` already uses the correct `useState` + `isServer`-safe pattern with `staleTime: 60_000`. `QueryProvider` is already in `(app)/layout.tsx`.

**Decision additions (formalized from Teo review):**

1. **Data fetching split:**
   - Server Components → Payload Local API (initial render, SEO, no client overhead)
   - Client Components → `useQuery` with `HydrationBoundary` for live/mutable data

2. **Query key taxonomy (canonical, must be followed by all future RFCs):**

   ```typescript
   ;['cases', memberId][('case', caseId)][('case', caseId, 'documents')][('case', caseId, 'heirs')][ // client's case list // single case detail + phase // document checklist // heir list
     ('case', caseId, 'payments')
   ][('appointments', memberId)] // payment history // member appointments
   ```

3. **`staleTime` by data type:**
   - Case phase/status: `30_000` (30s) — important to be timely
   - Document checklist: `60_000` (1min) — Paola reviews at human pace
   - Notification counter: `10_000` (10s) — near-real-time feel
   - Payment history: `120_000` (2min) — infrequent changes

4. **Mutation pattern (all RFC-005+ mutations must follow this):**

   ```typescript
   useMutation({
     mutationFn: async (data) => {
       /* PATCH /api/... */
     },
     onSuccess: () => queryClient.invalidateQueries({ queryKey: ['case', caseId] }),
   })
   ```

5. **RFC-004 scope:** `QueryProvider` is already mounted. RFC-004 implements the dashboard stub with `useQuery` + `HydrationBoundary` for the "active cases" counter. No polling (`refetchInterval`) in this RFC — deferred to the WebSocket/SSE RFC.

6. **`refetchOnWindowFocus: true`** (TanStack default) is sufficient for "always fresh when returning to the tab" behavior without polling.
