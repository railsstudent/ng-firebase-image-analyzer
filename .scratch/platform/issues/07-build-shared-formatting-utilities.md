# 07: Build Shared Presentation Formatting Utilities

**What to build:** Reusable, pure presentation utilities for formatting ratios as percentages, converting millisecond durations to human-readable seconds, and computing bounded percentage shares, backed by comprehensive unit tests.

**Blocked by:** 06: Establish Math and Time Constants and Retire Metrics Constant

**Status:** done

- [x] Create `format.util.ts` under shared utilities with zero layer-inversion dependencies on feature code.
- [x] Implement `toPercentString(ratio: number, decimals = 2): string` using formula `${(ratio * PERCENT_FACTOR).toFixed(decimals)}%` (importing `PERCENT_FACTOR` from `@/core/constants/math.const`).
- [x] Implement `formatDurationSeconds(ms: number, decimals = 1): string` using formula `(ms / MS_PER_SECOND).toFixed(decimals)` (importing `MS_PER_SECOND` from `@/core/constants/time.const`).
- [x] Implement `calculatePercentage(value: number, total: number): number` using formula `total === 0 ? 0 : (value / total) * PERCENT_FACTOR` safely guarding against division by zero.
- [x] Create comprehensive unit test suite in `format.util.spec.ts` testing happy path, precision defaults, boundary conditions (zero, negative, decimals), and edge cases.
