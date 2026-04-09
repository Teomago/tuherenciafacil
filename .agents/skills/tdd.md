# Test-Driven Development (TDD)

## The Iron Law
**NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**

## Red-Green-Refactor Cycle
1.  **RED:** Write a minimal failing test.
2.  **Verify RED:** Run the test and watch it fail (must be a "fail", not an "error").
3.  **GREEN:** Write the minimal code to make the test pass.
4.  **Verify GREEN:** Run the test and watch it pass.
5.  **REFACTOR:** Clean up code while keeping tests green.

## Why Order Matters
- Tests written after code are biased by the implementation.
- If you didn't see it fail, you don't know if it tests the right thing.
- Working code without tests is technical debt.

## Red Flags
- Code before test.
- Test passes immediately.
- Mocking the code instead of testing behavior.
