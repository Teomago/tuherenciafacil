# Systematic Debugging

## The Iron Law
**NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.**

## The Four Phases
1.  **Investigation:** Read error messages, reproduce consistently, check recent changes.
2.  **Pattern Analysis:** Find working examples, compare against references, identify differences.
3.  **Hypothesis:** Form a single hypothesis ("I think X causes Y because Z") and test it minimally.
4.  **Implementation:** Create a failing test case, implement a single fix, verify.

## 3-Fix Rule
If 3+ fixes have failed: **STOP.** The problem is likely architectural. Question the fundamentals before attempting a 4th fix.

## Red Flags
- "Just try changing X and see if it works."
- Fixing symptoms instead of the root cause.
- Proposing solutions before tracing data flow.
