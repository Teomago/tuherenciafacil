# NO-ERROR-SUPPRESSION — Absolute standard

> **Language:** This file is **English (canonical)** so every agent (Cursor, Claude Code, Gemini CLI, future tools) reads the same rules. Product copy and legal UX for end users stay **Spanish** in the app and in `src/messages/es.json`.

> Read by **all agents**. Referenced from `.agents/AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `CURSOR.md`.  
> **Ignoring this rule is a pipeline conduct violation.**

---

## The rule in one line

**Never suppress, hide, ignore, or work around an error. Fix the root cause, or escalate.**

---

## Forbidden suppressions — exhaustive list

No agent may use any of these techniques to make a build, test, or linter pass:

### TypeScript
| Forbidden | Why |
|-----------|-----|
| `// @ts-ignore` | Hides the error from the compiler. The failure still exists at runtime. |
| `// @ts-expect-error` | Only valid for a **known, accepted** compiler bug — never to “make it green”. |
| `as any` | Disables the type system for that expression. |
| `as unknown as T` | Forces an impossible cast. |
| `(value as any).field` | Same as `as any`. |

### JavaScript / ESLint
| Forbidden | Why |
|-----------|-----|
| `// eslint-disable-next-line` | Hides the problem from the linter. |
| `// eslint-disable` (block) | Silences rules for a whole file. |
| `/* eslint-disable rule */` | Same. |

### Tests
| Forbidden | Why |
|-----------|-----|
| Commenting out or deleting a failing test | Tests exist to catch regressions. Removing them lies about quality. |
| `test.skip(...)` to green the suite | Only valid with an open **BACKLOG** ticket that justifies the skip. |
| Empty `expect(true).toBe(true)` | False positive. |
| Mocks that replace real behavior just to hide an error | Only when the mock reflects a real external boundary (HTTP, S3, etc.). |

### Semantic workarounds
| Forbidden | Why |
|-----------|-----|
| Placeholder values (`'GENERATING...'`, `'TODO'`, `'FIXME_VALUE'`) in functional fields | Lies in the data model. If a hook generates the value, remove it from caller input. |
| `required: true` on fields the caller never supplies (because a hook always fills them) | False contract. Drop `required` and regenerate types. |
| Hard-coded data to satisfy a validation that should not apply | Fix the validation or the data path. |

---

## Valid path when you hit an error

```
ERROR DETECTED
     │
     ▼
Do I understand the root cause?
     │
    YES ──► Apply the smallest fix that resolves the root cause
     │      └─► Verify with tsc / tests / linter
     │
    NO ──► Investigate (read types, read producer code, read docs)
           └─► Still broken after 2 serious attempts?
                └─► ESCALATE TO TEO with the exact error text (copy-paste)
```

---

## When TypeScript reports an error

1. **Read the full error.** Do not paraphrase — copy it.
2. **Identify expected vs actual types.**
3. Valid fixes (in order):
   - Fix the value so it satisfies the expected type.
   - Fix the type definition if the type is wrong (e.g. `required` on a hook-populated field → make optional).
   - Regenerate `payload-types.ts` so it matches the real schema.
4. If none of the above is clear → **escalate to Teo with the literal error.**

---

## When a test fails

1. Read the full test output.
2. Reproduce in isolation.
3. Find the production line that causes wrong behavior.
4. Fix that line.
5. If the test was wrong → fix the test to assert correct behavior. **Do not delete it.**
6. Never claim “passed” on a suite with skipped or commented tests unless **BACKLOG.md** documents an approved skip.

---

## Self-check before commit

- [ ] Did I use any forbidden suppression?
- [ ] Any semantic placeholder in code paths?
- [ ] Did I comment or skip a test?
- [ ] Does the build pass because we **fixed** the issue, or because we **ignored** it?
- [ ] Any `TODO` / `FIXME` that creates immediate debt?

If any answer is **yes** → **do not commit. Fix or escalate.**

---

## Why this rule exists

In a prior session, an agent added `// @ts-ignore` to silence a real typing issue in `convertIntake.ts`. The masked error matched a mis-typed field (`tieneTestamento`) and caused a silent logic bug. The build was green, so it slipped past review.

**A green build with suppressions is not a correct build — it is a compiled lie.**

---

## Reality check (beta week)

The codebase may still contain legacy `as any` / `@ts-expect-error` from Payload typing gaps. **New work** must not add more. When you touch a file, prefer removing suppressions over spreading them. If Teo approves a **narrow, documented exception** for a specific Payload API, record it in the RFC decision file — not only in code comments.
