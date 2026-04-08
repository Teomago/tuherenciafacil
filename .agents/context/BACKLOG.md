## INFRA-001 — Separate dev and production Neon branches

**Priority:** low
**Type:** infrastructure
**Description:** Currently only one Neon branch exists used for both development
and production. Once the full app is implemented and deployed, create separate
Neon branches: one for production (current) and one for development/staging.
Each branch gets its own DATABASE_URL. Update Vercel environment variables
accordingly (preview deployments → dev branch, main deployments → prod branch).
**Success criterion:** `pnpm dev` connects to dev Neon branch; Vercel production
connects to prod branch. Migrations run against dev first, then promoted to prod.
**Dependencies:** Full app implementation complete (post RFC-008)

---

## WARN-001 — next-themes script tag warning

**Priority:** low
**Type:** bug (third-party)
**Description:** next-themes v0.4.6 injects a <script> tag that React 19
warns about. Non-blocking, theme works correctly.
**Success criterion:** warning disappears after next-themes releases
React 19 compatible version
**Dependencies:** none — monitor next-themes releases
