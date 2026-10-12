# 05: End-to-End Verification and Pre-Commit Validation

**What to build:** Execute full test suite via `npm run test:once` and lint checks via `npm run lint` across all features, ensuring zero regressions, zero lint warnings, and 100% test pass rate.

**Blocked by:** 04: Cleanup Root Bootstrap and Providers

**Status:** todo

- [ ] Run `npm run lint` to enforce all project invariants (zero `!`, native `#` for private fields, zero relative `../` across domains, single quotes, trailing commas).
- [ ] Run `npm run test:once` to execute all unit tests across core, features, and shared components.
- [ ] Verify that `/home` builds with zero Firebase imports in its main entrypoint chunk.
