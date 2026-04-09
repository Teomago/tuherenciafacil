# Documentation Lookup (Context7)

## Overview
Use the `ctx7` CLI to fetch up-to-date documentation for Next.js, React, Payload CMS, and other libraries. **Never rely on training data for API details.**

## Workflow
1.  **Resolve Library:** `ctx7 library <name> "<query>"` to get the Library ID (e.g., `/vercel/next.js`).
2.  **Query Docs:** `ctx7 docs <libraryId> "<specific-question>"` to get code snippets and documentation.

## Guidelines
- Be specific in queries (e.g., "React 19 useEffect async cleanup" instead of "hooks").
- Use version-specific IDs if mentioned (e.g., `/vercel/next.js/v15`).
- If quota is reached, inform the user and suggest `ctx7 login`.

## Preferred Libraries
- **Next.js:** `/vercel/next.js`
- **Payload CMS:** `/payloadcms/payload`
- **React:** `/facebook/react`
- **Drizzle:** `/drizzle-team/drizzle-orm`
