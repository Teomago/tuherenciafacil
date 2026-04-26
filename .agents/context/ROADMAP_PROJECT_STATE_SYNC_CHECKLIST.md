# ROADMAP + PROJECT_STATE Sync Checklist

Use this checklist whenever RFC numbering, status, or sequencing changes.

---

## Sequence consistency

- [ ] `PROJECT_STATE` and `ROADMAP` reference the same next RFC ID.
- [ ] Implemented RFCs are marked consistently in both files.
- [ ] Deferred/out-of-scope items point to the same future RFC.

## Scope consistency

- [ ] `PROJECT_STATE` next-priority bullets match `ROADMAP` next executable phase.
- [ ] In-scope/out-of-scope language for the active RFC is aligned.
- [ ] Stabilization fixes are documented as baseline assumptions, not silent scope shifts.

## Decision-file consistency

- [ ] Active decision filename exists in `.agents/decisions/`.
- [ ] Decision title/ID matches references in both context docs.
- [ ] Verification expectations in context docs do not contradict the decision file.

## Closure consistency

- [ ] After merge, update both files in the same cycle.
- [ ] Include merge date and what changed in status narrative.
- [ ] Record any RFC numbering re-baseline explicitly (never implicit).
