# RFC-004 — App shell and UI primitives

**Status:** Draft (Phase 1: Specification)  
**Date:** 2026-04-28  
**Author:** Gemini CLI (Designer)  
**References:**  
- `.agents/context/PROJECT_STATE.md` (Canonical status)  
- `src/payload/collections/index.ts` (Backend baseline)  
- `.agents/context/ROADMAP.md` (Sequence lock)  
- `docs/design/SCREEN_MAP.md` (Target UX)  
- `docs/design/COLLECTIONS.md` (Domain semantics)  
- `GEMINI.md` (Pipeline & global constraints)

---

## 1. Executive Summary
- **Centralized Auth Guard:** Move page-level session checks to the `(app)/layout.tsx` for consistent protection.
- **Role-Aware Navigation:** Implement a Sidebar/Header navigation that adapts between `cliente` and `abogado` roles.
- **UI Primitives:** Define the atomic component library (Buttons, Cards, Inputs, Status Badges) using Tailwind v4 and Radix UI.
- **Dashboard Stubs:** Scaffold the high-level dashboard routes for both roles with read-only data integration from existing collections.
- **Mobile-First Design:** Ensure the shell is responsive, following the "adult-friendly" accessibility principles (DEC-003).

---

## 2. Problem Statement
The current application structure has a single entry point at `/[locale]/app` with page-level auth guards. As we move into Phase 5+ (Funnels and Workspaces), we need a cohesive App Shell that handles navigation, global state, and role-based access control without code duplication. The backend for core succession data is implemented (RFC-003.1–003.4), but there is no consistent UI layer to display it to the end users.

---

## 3. Goals
- **Unified Layout:** A robust sidebar/header system that persists across all `/app/*` routes.
- **Security:** Zero-access to `/app` without a valid `member` session; automated redirection for inactive lawyers.
- **Atomic Components:** A shared library of UI primitives to accelerate RFC-005+ development.
- **User Identity:** Header component displaying the current member's name and role-specific actions.

---

## 4. Non-Goals
- Full implementation of Onboarding/Pre-payment funnels (RFC-005).
- Case workspace data editing or multi-step intake forms (RFC-007).
- Real-time communication/Chat UI implementation (RFC-009).
- Automated slot capacity updates (APPT-001) or Wompi integration (DEC-005).

---

## 5. Roles & Access
The shell must interpret the `member.role` field from Payload auth:
- **`cliente`:** Access to `/app/dashboard`, `/app/casos`, and `/app/caso/[id]/*`. Redirected from `/app/notaria`.
- **`abogado`:** Access to `/app/dashboard`, `/app/casos`, and `/app/caso/[id]/*` (including `/notaria`).
- **Inactive Abogado:** Locked to `/[locale]/pending-activation`.
- **Unauthenticated:** Redirected to `/[locale]/login`.

---

## 6. Route Map (App Group)

The following routes reside under `src/app/[locale]/(app)/`.

| Segment | Purpose | Access | State (RFC-004) |
|---------|---------|--------|-----------------|
| `/[locale]/app` | Root redirector / Welcome | All | Updated (Logic-only) |
| `/dashboard` | Main operational panel | All | **Scaffolded** (Stub) |
| `/casos` | Case listing | All | **Scaffolded** (Stub) |
| `/caso/[id]` | Case workspace root | All | **Layout-only** |
| `/pending-activation` | Inactive lawyer gate | Inactive Abogado | Existing (Styled) |

---

## 7. Layouts & Shell Architecture

### 7.1 Centralized Auth Guard
Auth logic moves from `app/page.tsx` to `(app)/layout.tsx`.
- **Logic:**
  1. Fetch `user` from `payload.auth({ headers })`.
  2. If `!user`, redirect to `/${locale}/login`.
  3. If `user.role === 'abogado' && !user.isActive`, redirect to `/${locale}/pending-activation` (unless already on that route).
  4. Provide `user` context to children via a custom `UserProvider` or React `use` hook pattern.

### 7.2 Component Hierarchy
- **`AppLayout` (`layout.tsx`):**
  - `UserProvider` (Client)
  - `AppShell` (Client/Server)
    - `Sidebar` (Desktop) / `Drawer` (Mobile)
    - `Header` (User profile, Notifications stub)
    - `MainContent` (Children)

---

## 8. Design Primitives (Atomic UI)

Using **Tailwind CSS v4** and **Radix UI** primitives:

| Component | Primitives / Props | Design Intent |
|-----------|---------------------|---------------|
| **Button** | `cva`, `lucide-react` | Large touch targets, clear primary/secondary distinctions. |
| **Card** | `bg-card`, `border` | Clean borders, no heavy shadows, "accessible" contrast. |
| **Badge** | `variant` (Success, Warning, Error) | For Case Phases and Document Statuses. |
| **Typography** | `Inter` | 16px minimum for body text to support older users (DEC-003). |
| **NavigationLink** | `active` state styling | Clear visual indicator of current location. |

---

## 9. Backend Integration (Read-Only)

### 9.1 Backend Already Exists
The following backend capabilities were implemented in RFC-003.1–003.4 and **must not be re-specified or modified** in this RFC:
- **Collections:** `members`, `cases`, `appointments`, `availability-slots`, `case-intakes`, `heirs`, `assets`, `documents`, `document-checklists`, `notary-process`, `payments`.
- **Logic:** Role enforcement hooks, phase-gate validation, intake guards.

### 9.2 Dashboard Stubs
RFC-004 will fetch data from these collections to populate the shell's stubs:
- **Counter stubs:** `countDocuments({ where: { responsable: { equals: member.id } } })` for the "Active Cases" metric.
- **Identity:** Display `member.firstName` in the Header.

---

## 10. i18n Strategy
- **Dictionary:** Update `es.json` with keys for `App.Sidebar.*`, `App.Header.*`, and `App.Dashboard.Stubs.*`.
- **Locale Switcher:** Placeholder in the Header (deferred actual toggle logic if multiple languages aren't ready, but UI must exist).

---

## 11. Errors & Empty States
- **No Cases:** Show "Bienvenido. ¿Comenzamos?" CTA leading to `/nueva-consulta`.
- **403 Forbidden:** Custom error page for clients attempting to access `/notaria`.
- **Not Found:** 404 page consistent with the app shell.

---

## 12. Testing & Verification

### 12.1 Testing Strategy
- **Unit (Vitest):** Test role-aware navigation component logic (should sidebar show 'Notaría' for clients?).
- **Integration (Playwright):**
  - Verify `/[locale]/app` redirects to `/login` when unauthenticated.
  - Verify `abogado` can see `/pending-activation` when `isActive` is false.
  - Verify layout persists across navigation between `/dashboard` and `/casos`.

### 12.2 Verification Checklist (`package.json`)
- [ ] `pnpm exec tsc --noEmit` passes.
- [ ] `pnpm run lint` passes (no new warnings).
- [ ] `pnpm build` completes successfully.
- [ ] Accessibility: Audit with Axe (lighthouse) shows >90 for App Shell pages.

---

## 13. Risks & Mitigations
- **Layout Shift:** Centralized auth might cause a flash of unauthenticated content. **Mitigation:** Use Suspense and server-side redirects in `layout.tsx` to ensure a "blank" or "loading" state is never seen by unauth users.
- **Responsive Complexity:** Sidebar/Drawer transitions on mobile. **Mitigation:** Use Radix `Dialog` / `Drawer` for consistent ARIA support.

---

## 14. Success Criteria
- [ ] Navigation sidebar adapts based on `member.role`.
- [ ] `/[locale]/app` correctly guards all children routes.
- [ ] A set of reusable UI primitives (Button, Card, Badge) is used throughout the shell.
- [ ] Mobile/Desktop navigation is fully functional.
- [ ] `es.json` contains all necessary translations for the shell.

---
