# Phase 6: Execution Audit — RFC-004

**Auditor:** Gemini CLI (Auditor)  
**Method:** Adversarial Execution Review  
**Date:** 2026-04-29  
**Decision Reference:** `.agents/decisions/RFC-004-decision.md`  
**Verdict:** CONDITIONAL PASS — Gemini reported 2 findings; Cursor verification added 1 contract gap (**M-2**) between decision Task 6 and implemented Playwright coverage.

---

## Audit Inputs
- `src/components/auth/AuthGuard.tsx`
- `src/app/[locale]/(app)/layout.tsx`
- `src/components/shell/Sidebar.tsx`
- `src/components/shell/AppShell.tsx`
- `src/app/[locale]/(app)/caso/[id]/notaria/page.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/badge.tsx`
- `src/styles/frontend/theme.css` and `globals.css`
- `playwright.config.ts`
- Cursor Execution Log & MemPalace Diary (`codex-5.3` session `2026-04-28/29`)

---

## Severity Legend

| Severity | ID prefix | Meaning |
|---|---|---|
| **BLOCKING** | `B-N` | Decision file cannot be drafted safely (spec audit) or merge cannot proceed (execution audit) until resolved |
| **HIGH** | `H-N` | Likely runtime bug, security gap, data integrity issue, or executor ambiguity |
| **MEDIUM** | `M-N` | Wrong output, weak verification, or maintainability risk |
| **LOW** | `L-N` | Cosmetic or future-proofing issue |

---

## Domain Sections

### Section 1 — Security & AuthGuard

**ID:** `L-1`  
**Severity:** LOW  
**Spec says:** `AuthGuard` handles role redirection and session validation on the server.  
**Current code:** In `src/components/auth/AuthGuard.tsx`, the logic checks `!isMemberUser(user)` inside `resolveAuthGuardAction` and then checks it again directly in the component body after handling the action redirects.  
**Problem:** Redundant conditional check that slightly reduces readability.  
**Required fix for decision file:** Remove the redundant `if (!isMemberUser(user))` check in the component body since `resolveAuthGuardAction` already handles it by returning `'redirect_login'`.

### Section 2 — Accessibility & Frontend Design

**ID:** `M-1`  
**Severity:** MEDIUM  
**Spec says:** Accessibility constraint: `#3A8DA8` fails WCAG AA as body text on white. Axe critical=0 is enforced.  
**Current code:** Cursor noted in the execution logs: `axe.critical=0 enforced;serious/moderate remain login.scope.out`.  
**Problem:** While out of scope for RFC-004's exact components, the login page is the gateway to the app shell and currently has serious/moderate Axe violations. This violates the overarching "Adult-friendly" design principle established in `DEC-003`.  
**Required fix for decision file:** Create a targeted backlog ticket or minor fix PR to address the Axe violations on `/[locale]/login/page.tsx` to ensure the entire authentication funnel is accessible.

---

## Summary Table

| ID | Severity | Area | Issue |
|---|---|---|---|
| `L-1` | LOW | AuthGuard | Redundant role check logic in `AuthGuard.tsx`. |
| `M-1` | MEDIUM | Accessibility | Moderate/serious Axe violations remain on the login page (out of scope, but impacts funnel). |
| `M-2` | MEDIUM | Verification | Decision Task 6 lists five authenticated smoke scenarios; `shell.smoke.spec.ts` only covers unauthenticated redirects + login Axe (critical-only). See Independent verification section. |

---

## Recommended Path Forward

1. **Address L-1 (Optional):** The executor (Cursor) can quickly clean up the redundant conditional in `AuthGuard.tsx` before final merge to keep the security file pristine.
2. **Address M-1 (Mandatory Backlog):** Add a task to the `BACKLOG.md` to resolve the Axe violations on the login page. Since it was strictly out of scope for RFC-004, it does not block this specific RFC from closing, but it must not be forgotten.
3. **Address M-2 (Closure honesty):** Either extend Playwright with the five decision scenarios (seed + member login) or record in BACKLOG / PROJECT_STATE that authenticated shell smoke is deferred — so Phase 6 does not over-claim coverage.
4. **Proceed to Phase 8:** Administrator (Teo) can proceed with the visual review on 375px/1280px viewports. If the visual review passes, update `PROJECT_STATE.md` and close the cycle.

---

## Independent verification (Cursor) — same execution, 2026-04-29

Cross-checked against `.agents/decisions/RFC-004-decision.md` and the current tree.

### Gemini findings — accuracy

| ID | Verdict |
|----|---------|
| **L-1** | **Accurate.** After `resolveAuthGuardAction(user)` returns `'allow'`, `user` is narrowed for humans but TypeScript still types `user` as the broad Payload auth union, so the extra `if (!isMemberUser(user))` is redundant at runtime and exists mainly for the type checker / defensive copy. Safe to remove only if `UserProvider` still receives a value typed as `Member` (e.g. narrow once with a guard variable or assertion aligned with project rules — no `as any`). |
| **M-1** | **Accurate.** `tests/e2e/shell.smoke.spec.ts` only asserts **critical** Axe violations on `/es/login`; serious/moderate remain. Login is the funnel entry; tracking as backlog (DEC-003 readability/accessibility) matches pipeline discipline. |

### Gap to add for a complete execution audit (recommended)

**ID:** `M-2`  
**Severity:** MEDIUM  
**Area:** Verification vs decision contract  
**Finding:** Decision §4 Task 6 and §7 success criteria describe **five** Playwright smoke scenarios, including **authenticated** flows (active abogado on `/caso/.../notaria`, inactive abogado → pending-activation, cliente → forbidden, layout persistence). Current `tests/e2e/shell.smoke.spec.ts` implements only **unauthenticated** redirect checks (dashboard, casos, notaria, pending-activation) plus **critical-only** Axe on login.  
**Impact:** RFC-004 closure documentation should state either (a) authenticated E2E deferred to RFC-005+ with a BACKLOG ticket, or (b) extend `shell.smoke.spec.ts` with seed + login helpers per decision.  
**Recommendation:** Add a BACKLOG line or amend PROJECT_STATE so Phase 6 reviewers do not assume all five scenarios are automated.

### Command reference for Teo / auditors

| Command | What it runs |
|---------|----------------|
| `pnpm exec tsc --noEmit` | Full TypeScript check |
| `pnpm exec vitest run tests/unit/shell/` | RFC-004 unit tests only (`AuthGuard`, `Sidebar` nav contract) |
| `pnpm run test:int` | Full Vitest config: `tests/unit/**/*.spec.ts` + `tests/int/**/*.int.spec.ts` (needs DB/network per env) |
| `pnpm exec playwright test tests/e2e/shell.smoke.spec.ts --config=playwright.config.ts` | Shell smoke (unauthenticated + login Axe critical-only); starts dev server via `webServer` if needed |
| `pnpm exec playwright test --config=playwright.config.ts` | All e2e specs under `tests/e2e/` (includes admin/frontend legacy specs) |
| `pnpm dev` | Manual **§7 Visual Review Gate** (375px + 1280px) |

---
## Teo Feedback Resolution Addendum
*(Pending Teo's review)*

### Resolution log

| ID | Resolution |
|----|------------|
| L-1 | *(optional)* Remove redundant guard in `AuthGuard.tsx` once `Member` narrowing is handled in a type-safe way. |
| M-1 | BACKLOG: login page WCAG / Axe serious+moderate (funnel). |
| M-2 | BACKLOG or immediate follow-up: authenticated Playwright scenarios per decision §4 Task 6 — or explicitly mark as out of scope for RFC-004 closure. |