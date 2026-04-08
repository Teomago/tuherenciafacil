# RFC-002 — Members Cleanup and Route Restructuring (Refined)

## Objective
Cleanup the `Members` collection by removing legacy fields inherited from the previous project base, restructure the application routes to align with the new design documentation (DEC-007), and align the authentication logic to prevent system breakage.

## Current state
- `Members` collection contains `tier` (free/premium) and `currency` (USD/EUR/etc) fields that are no longer applicable.
- `src/app/[locale]/(frontend)/actions/auth.ts` contains logic to determine and save these legacy fields during registration.
- Route group `(herencia)` with sub-route `herencia/` is used for the main application, but the design specifies `(app)` with `app/`.
- `next-intl` is configured with `en` as default and prefix-always, but "prefix-free Spanish (default)" is required.

## Proposed Changes

### 1. Members Collection Cleanup
Remove legacy fields that are not part of the **tuHerenciaFácil** domain model to prepare for the new fields in RFC-003.

**File:** `src/payload/collections/settings/Members/index.ts`
- Remove the `tier` field definition.
- Remove the `currency` field definition.
- Update `preferredLocale` default value from `en` to `es`.
- Update `auth.forgotPassword.generateEmailHTML` and `generateEmailSubject` to prioritize `es` and use the brand name "tuHerenciaFácil".

### 2. Authentication Actions Refactor
Synchronize the registration logic with the cleaned-up `Members` collection.

**File:** `src/app/[locale]/(frontend)/actions/auth.ts`
- **Remove** the `tier` determination logic (`let tier: 'free' | 'premium' = 'free'`).
- **Remove** the `currency` determination logic (`const currency = ...`).
- **Update** the `payload.create` call: Remove `tier` and `currency` from the `data` object to match the new schema.
- Keep `invitationCode` logic for now as it may be used for marketing tracking, but ensure it doesn't try to set the `tier` field.

### 3. Route Restructuring
Rename route groups and pages to match `SCREEN_MAP.md` and `DEC-007`.

**Moves:**
- `src/app/[locale]/(herencia)` → `src/app/[locale]/(app)`
- `src/app/[locale]/(herencia)/herencia/page.tsx` → `src/app/[locale]/(app)/app/page.tsx`

**File:** `src/app/[locale]/(auth-split)/login/LoginForm.tsx`
- Update the `router.push` call from `/${locale}/herencia` to `/${locale}/app`.

### 4. i18n & Middleware Configuration
Switch to prefix-free Spanish as the default locale and primary language.

**File:** `src/i18n/routing.ts`
- Set `locales: ['es', 'en']` (prioritize Spanish).
- Set `defaultLocale: 'es'`.
- Add `localePrefix: 'as-needed'`.

**File:** `src/proxy.ts` (Middleware)
- Update `intlMiddleware` configuration to match `routing.ts` (`defaultLocale: 'es'`, `localePrefix: 'as-needed'`).

**File:** `src/i18n.ts`
- Update fallback `locale` to `es` in `getRequestConfig`.

### 5. Translation Namespace Update
Rename the "Herencia" namespace to "App" to reflect the new route structure and purpose.

**Files:**
- `src/messages/es.json`
- `src/messages/en.json`
- Action: Rename the top-level key `"Herencia"` to `"App"`.

**File:** `src/app/[locale]/(app)/app/page.tsx` (formerly `herencia/page.tsx`)
- Update any `useTranslations` hooks to use the `"App"` namespace instead of `"Herencia"`.

## Implementation Detail

### Field-by-field implementation detail for collections
- `Members`:
  - `firstName`, `secondName`, `lastName`, `secondLastName`: Keep.
  - `tier`: **Delete**.
  - `currency`: **Delete**.
  - `preferredLocale`: Keep, change `defaultValue` to `'es'`.

### API endpoint specifications
- No new endpoints.

### Access control rules
- No changes to existing rules in this phase.

### Hooks and triggers
- No new hooks.

## Success Criteria (verifiable)
- [ ] `pnpm build` passes.
- [ ] Visiting `/` (root) renders the Spanish marketing/welcome page without `/es` in the URL.
- [ ] Visiting `/en` still works for English.
- [ ] Login successfully redirects to `/app`.
- [ ] Registering a new user via `registerMember` action succeeds without attempting to write to deleted fields.
- [ ] `Members` collection in Payload Admin (`/admin`) no longer shows `tier` or `currency`.

## Out of Scope
- Adding new `Members` fields (`role`, `cedula`, `telefono`, `creditoAcumulado`) — deferred to RFC-003.
- Implementing the 11 new collections — deferred to RFC-003.
- Database migration execution (handled by Phase 4 Executor).
