# 08: Migrate Call Sites and Fix Compilation Errors

**What to build:** Rewire all broken call sites across core, shared, and features to use the new domain constants and formatting utilities, bringing the application and test suites back to a 100% green state.

**Blocked by:** 06: Establish Math and Time Constants and Retire Metrics Constant, 07: Build Shared Presentation Formatting Utilities

**Status:** done

- [x] Migrate `ai.service.ts` to consume `PERCENT_FACTOR` from core math constants.
- [x] Migrate `config.service.ts` to consume `ONE_HOUR_MS` from core time constants.
- [x] Migrate `visual-calibration.service.ts` to format layout percentage coordinates using `toPercentString`.
- [x] Migrate `image-analysis.component.ts` to format duration latency using `formatDurationSeconds`.
- [x] Migrate `token-analytics.util.ts` to use shared calculation or constants.
- [x] Ensure zero lingering references to `metrics.const.ts` across the codebase.
- [x] Run full validation suite (`npm run lint`, `npx cspell`, and test suite) to verify 100% passing tests and zero regressions.
