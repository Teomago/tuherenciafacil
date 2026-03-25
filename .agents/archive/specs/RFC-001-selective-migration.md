# RFC-001 — Selective Migration from eterhub to tuherenciafacil

## Context

tuherenciafacil is a fresh Payload CMS 3.80 + Next.js 16.2.1 install.
eterhub is the source base. This RFC executes the selective copy defined
in .agents/migration/eterhub_scope.md.

Read .agents/AGENTS.md and .agents/context/PROJECT_STATE.md before starting.
Do NOT copy any file not listed here. Do NOT improvise logic not specified.
If a file is not found at the expected path, stop and report it.

---

## PHASE 1 — Install dependencies

Run the following in tuherenciafacil root:

```bash
pnpm add \
  @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities \
  @payloadcms/live-preview-react \
  @payloadcms/plugin-cloud-storage \
  @payloadcms/plugin-nested-docs \
  @payloadcms/plugin-seo \
  @payloadcms/storage-s3 \
  @payloadcms/translations \
  @radix-ui/react-checkbox \
  @radix-ui/react-popover \
  @radix-ui/react-visually-hidden \
  @svgr/webpack \
  @tailwindcss/postcss \
  @tailwindcss/typography \
  @tanstack/react-form \
  @tanstack/react-query \
  @tanstack/react-query-devtools \
  @tanstack/react-virtual \
  @veiag/payload-cmdk \
  axios \
  class-variance-authority \
  clsx \
  cmdk \
  dequal \
  drizzle-orm \
  embla-carousel-react \
  focus-trap-react \
  framer-motion \
  fuse.js \
  lucide-react \
  motion \
  next-intl \
  next-themes \
  nuqs \
  payload-sidebar-plugin \
  postcss \
  qs-esm \
  radix-ui \
  react-intersection-observer \
  react-remove-scroll \
  schema-dts \
  server-only \
  sonner \
  standard-slugify \
  tailwind-merge \
  tailwindcss \
  thumbhash \
  tw-animate-css \
  usehooks-ts \
  zod
```

```bash
pnpm add -D \
  @eslint/eslintrc \
  autoprefixer \
  playwright \
  playwright-core
```

Do NOT install: papaparse, react-dropzone, recharts, @types/papaparse,
@sentry/nextjs, @upstash/ratelimit, @upstash/redis.

---

## PHASE 2 — Copy src/styles/

Copy exactly these files from eterhub to tuherenciafacil, preserving paths:

- src/styles/index.css
- src/styles/admin.css
- src/styles/frontend/theme.css
- src/styles/frontend/utility-defs.css
- src/styles/frontend/globals.css
- src/styles/admin/theme.css
- src/styles/admin/utility-defs.css

---

## PHASE 3 — Copy src/lib/

Copy exactly these files:

### src/lib/utils/ (all except dateMath.ts and its test)

- src/lib/utils/APIError.ts
- src/lib/utils/assertNever.ts
- src/lib/utils/cache.ts
- src/lib/utils/canUseDOM.ts
- src/lib/utils/cn.ts
- src/lib/utils/deepMerge.ts
- src/lib/utils/extractIds.ts
- src/lib/utils/generateId.ts
- src/lib/utils/generatePreviewPath.ts
- src/lib/utils/getLinkProps.ts
- src/lib/utils/getPathSegments.ts
- src/lib/utils/getRoute.ts
- src/lib/utils/index.ts
- src/lib/utils/internalDocToHref.ts
- src/lib/utils/isBase64.ts
- src/lib/utils/isExpanded.ts
- src/lib/utils/isObject.ts
- src/lib/utils/media.ts
- src/lib/utils/resolvePathname.ts
- src/lib/utils/responsive.ts
- src/lib/utils/signedToken.ts
- src/lib/utils/truncateText.ts
- src/lib/utils/url.ts

DO NOT copy: src/lib/utils/dateMath.ts or its test file.

### src/lib/variants/ (all 5 files)

- src/lib/variants/columnsVariants.tsx
- src/lib/variants/containerVariants.tsx
- src/lib/variants/index.ts
- src/lib/variants/spaceVariants.tsx
- src/lib/variants/typographyVariants.tsx

### src/lib/metadata/ (2 files)

- src/lib/metadata/generateMeta.ts
- src/lib/metadata/index.ts

### src/lib/payload/ (2 files)

- src/lib/payload/getPayload.ts
- src/lib/payload/hooks.ts

### src/lib/auth/ (3 files — copy as-is, will be modified in Phase 9)

- src/lib/auth/assertUser.ts
- src/lib/auth/getAuthUser.ts
- src/lib/auth/typeGuards.ts

DO NOT copy: src/lib/tour-constants.ts

### src/utilities/ (1 file)

- src/utilities/brevoAdapter.ts

---

## PHASE 4 — Copy src/payload/

Copy in this order:

### src/payload/utils/ (7 files)

- src/payload/utils/access/index.ts
- src/payload/utils/access/access.ts
- src/payload/utils/access/accessField.ts
- src/payload/utils/access/types.ts
- src/payload/utils/access/constants.ts
- src/payload/utils/access/utils.ts
- src/payload/utils/visibleFor.ts

### src/payload/validators/ (5 files)

- src/payload/validators/coordinates.ts
- src/payload/validators/time.ts
- src/payload/validators/url.ts
- src/payload/validators/validateDynamicPageSafeChange.ts
- src/payload/validators/validators.translations.ts

### src/payload/hooks/ (2 files)

- src/payload/hooks/formatConcatenatedFields.ts
- src/payload/hooks/syncPathnameFromSettings.ts

### src/payload/constants/ (3 files)

- src/payload/constants/dynamicCollections.ts
- src/payload/constants/googleFonts.ts
- src/payload/constants/linkableCollections.ts

### src/payload/config/ (2 files)

- src/payload/config/livePreview.ts
- src/payload/config/livePreview.translations.ts

### src/payload/fields/ (all 90 files)

Copy entire src/payload/fields/ directory preserving all subfolders.

### src/payload/blocks/ (all except generated-block-slugs.ts)

Copy entire src/payload/blocks/ directory EXCEPT:

- DO NOT copy src/payload/blocks/generated-block-slugs.ts

### src/payload/lexical/ (12 files)

Copy entire src/payload/lexical/ directory.

### src/payload/ui/ (3 files)

- src/payload/ui/ArrayRowLabel/index.tsx
- src/payload/ui/ArrayRowLabel/types.tsx
- src/payload/ui/ArrayRowLabel/utils.ts

### src/payload/collections/content/ (15 files)

Copy entire:

- src/payload/collections/content/Articles/
- src/payload/collections/content/Media/
- src/payload/collections/content/Pages/

### src/payload/collections/settings/ (7 files)

Copy entire src/payload/collections/settings/ directory.

### src/payload/collections/system/ (2 files)

- src/payload/collections/system/Tags.ts
- src/payload/collections/system/Tags.translations.ts

DO NOT copy: src/payload/collections/finance/ (any file)

### src/payload/globals/ (11 files — exclude ImportSettings.ts)

Copy entire src/payload/globals/ directory EXCEPT:

- DO NOT copy src/payload/globals/ImportSettings.ts

### src/payload/plugins/ (4 files — exclude imageAspectRatio.ts)

- src/payload/plugins/index.ts
- src/payload/plugins/seo.ts
- src/payload/plugins/nestedDocs.ts
- src/payload/plugins/autoEnableRichTextLink.ts

DO NOT copy: src/payload/plugins/imageAspectRatio.ts

### src/payload/i18n/ (8 files — exclude auto-generated language files)

Copy entire src/payload/i18n/ directory EXCEPT:

- DO NOT copy src/payload/i18n/languages/en.ts
- DO NOT copy src/payload/i18n/languages/es.ts

### Root level (1 file)

- src/payload/extended-types.ts

DO NOT copy: src/payload/payload-types.ts (auto-generated)
DO NOT copy: src/payload/blocks/generated-block-slugs.ts (auto-generated)
DO NOT copy: src/payload/payload.config.ts (will be handled in Phase 9)
DO NOT copy: src/payload/collections/index.ts (will be handled in Phase 9)

---

## PHASE 5 — Copy src/components/

### src/components/buttons/ (5 files)

Copy entire src/components/buttons/ directory.

### src/components/display/ (10 files)

Copy entire src/components/display/ directory.

### src/components/misc/ (1 file)

- src/components/misc/Separator.tsx

### src/components/ui/ (23 files — with exclusions)

Copy entire src/components/ui/ directory EXCEPT:

- DO NOT copy src/components/ui/money-input.tsx
- DO NOT copy src/components/ui/tour.tsx

DO NOT copy: src/components/charts/ (any file)

---

## PHASE 6 — Copy src/modules/

Copy entire src/modules/ directory (all 48 files):

- src/modules/blocks/
- src/modules/layout/
- src/modules/articles/
- src/modules/listing/
- src/modules/common/
- src/modules/richText/
- src/modules/pages/

---

## PHASE 7 — Copy i18n, providers, hooks, app shell

### i18n

- src/i18n.ts
- src/i18n/routing.ts

### Messages (copy as-is, will be modified in Phase 9)

- src/messages/en.json
- src/messages/es.json

### Providers (2 files)

- src/providers/QueryProvider.tsx
- src/providers/ThemeProvider.tsx

### Hooks (1 file)

- src/hooks/use-debounce.ts

### Middleware (copy as-is, will be verified in Phase 9)

- src/middleware.ts

### App shell

- src/app/global-error.tsx
- src/app/next/healthcheck/route.ts
- src/app/next/preview/route.ts
- src/app/next/exit-preview/route.ts
- src/app/[locale]/(auth)/layout.tsx
- src/app/[locale]/(auth)/register/page.tsx
- src/app/[locale]/(auth)/forgot-password/page.tsx
- src/app/[locale]/(auth)/reset-password/page.tsx
- src/app/[locale]/(auth-split)/layout.tsx
- src/app/[locale]/(auth-split)/login/page.tsx
- src/app/[locale]/(auth-split)/login/LoginForm.tsx
- src/app/[locale]/(frontend)/layout.tsx
- src/app/[locale]/(frontend)/styles.css
- src/app/[locale]/(frontend)/[[...segments]]/page.tsx
- src/app/[locale]/(frontend)/actions/auth.ts

### next.config.mjs

Copy next.config.mjs from eterhub root to tuherenciafacil root.
Verify it contains the next-intl plugin integration:
`createNextIntlPlugin('./src/i18n.ts')`
Do not modify any other config in this file.

DO NOT copy: src/app/(payload)/ (any file — Payload-managed)
DO NOT copy: src/app/[locale]/app/ (any file — Miru)
DO NOT copy: src/app/api/cron/ (Miru cron)
DO NOT copy: src/app/my-route/ (placeholder)
DO NOT copy: src/app/actions/tour.ts

---

## PHASE 8 — Create from scratch

These files do NOT exist in eterhub. Create them in tuherenciafacil.

### 8.1 — src/app/[locale]/(herencia)/layout.tsx

Create a clean authenticated layout. No Miru sidebar. Wraps:
ThemeProvider → NextIntlClientProvider → QueryProvider

```tsx
import { ThemeProvider } from '@/providers/ThemeProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export default async function HerenciaLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <ThemeProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <QueryProvider>{children}</QueryProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  )
}
```

### 8.2 — src/app/[locale]/(herencia)/page.tsx

Create the post-login welcome screen. Fetches authenticated user,
displays "Bienvenido [nombre]". If no user found, redirect to login.

```tsx
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from '@/lib/payload/getPayload'

export default async function HerenciaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const payload = await getPayload()

  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const name = user.name || user.email

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Bienvenido, {name}</h1>
        <p className="mt-2 text-muted-foreground">Tu proceso de sucesión comienza aquí.</p>
      </div>
    </main>
  )
}
```

---

## PHASE 9 — Modify REVIEW files

### 9.0 — package.json custom scripts

Open eterhub/package.json and tuherenciafacil/package.json.
Copy only the following script entries from eterhub into tuherenciafacil
under the "scripts" block. Do not overwrite or remove existing scripts,
do not touch dependencies:

- "generate:types"
- "generate:block-slugs"
- "generate:translations"

If any of these already exist in tuherenciafacil with the same value,
skip them. If they exist with a different value, flag them in the report.

### 9.1 — src/payload/payload.config.ts

Copy from eterhub, then apply these changes:

- Remove all finance collection imports:
  Accounts, Budgets, Categories, Transactions,
  ScheduledTransactions, Members
- Remove ImportSettings global import and reference
- Keep all other config (S3, Brevo, plugins, localization, collections)
- Verify S3 env vars match tuherenciafacil .env.local

### 9.2 — src/payload/collections/index.ts

Copy from eterhub, then remove all finance collection exports.
Keep only: Pages, Articles, Media, Users, Tags, InvitationCodes

### 9.3 — src/messages/en.json

Remove the entire `Miru` namespace (all 8 submodules, ~207 lines).
Add the following `Herencia` namespace:

```json
"Herencia": {
  "welcome": "Welcome",
  "welcomeMessage": "Welcome, {user}",
  "subtitle": "Your succession process starts here."
}
```

### 9.4 — src/messages/es.json

Remove the entire `Miru` namespace.
Add:

```json
"Herencia": {
  "welcome": "Bienvenido",
  "welcomeMessage": "Bienvenido, {user}",
  "subtitle": "Tu proceso de sucesión comienza aquí."
}
```

### 9.5 — src/app/[locale]/(auth-split)/login/LoginForm.tsx

Find the post-login redirect (currently points to /app).
Change it to point to /(herencia):

- Before: redirect(`/${locale}/app`)
- After: redirect(`/${locale}/herencia`)

### 9.6 — src/lib/auth/typeGuards.ts

Remove isMember type guard and any Members collection reference.
Keep isAdminUser if present.

### 9.7 — src/lib/auth/getAuthUser.ts

Remove Members collection reference.
This file may become unused — flag it in the output report
but do not delete it yet.

### 9.8 — src/lib/auth/assertUser.ts

Update to reference only the Users collection.
Remove any Member/finance-specific logic.

### 9.9 — src/middleware.ts

Remove any route matchers referencing /app.
Comment out exactly these imports if present:

- import { Ratelimit } from '@upstash/ratelimit'
- import { Redis } from '@upstash/redis'

Comment out all rate limiting logic that uses Ratelimit or Redis.
Keep: all next-intl locale routing logic intact.
Keep: any other middleware logic not related to Upstash.

### 9.10 — src/components/ui/icon-picker.tsx

DO NOT copy this file. It imports categoryIcons which is Miru-specific.
Leave it absent from tuherenciafacil for now.

### 9.11 — tsconfig.json paths verification

Open tuherenciafacil/tsconfig.json.
Verify the compilerOptions.paths block contains:

```json
"@/*": ["./src/*"]
```

If missing, add it under compilerOptions.paths.
Do not modify any other tsconfig settings.
Report whether this entry was already present or was added.

---

## PHASE 10 — Run generators

After Phase 9 is complete, run in order:

```bash
pnpm payload generate:types
pnpm generate:block-slugs
pnpm generate:translations
```

Then run:

```bash
pnpm build
```

Report all build errors. Do not attempt to fix them silently —
stop and list every error with its file and line number.

---

## SUCCESS CRITERION

The following must all be true before this RFC is considered complete:

1. pnpm build completes with zero errors
2. pnpm dev starts without crashes
3. Marketing site loads at /es or /en
4. Login page loads at /es/login
5. After login → redirect lands on /es/herencia
6. Page shows "Bienvenido, [nombre del usuario]"
7. No Miru routes exist or are accessible
8. Payload admin loads at /admin

---

## OUTPUT REPORT

After completing all phases, output:

1. Files copied: total count by phase
2. Files created from scratch: list
3. Files modified: list with summary of changes
4. Build result: success or list of errors
5. Any files not found at expected paths
6. Any ambiguities that require human review
