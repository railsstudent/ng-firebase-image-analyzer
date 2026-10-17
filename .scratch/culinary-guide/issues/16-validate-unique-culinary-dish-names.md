# Ticket 16: Validate Unique Food Names in Culinary Discovery Response

**What to build:** Enforce that all discovered food items in Stage 1 Culinary Discovery have unique dish names (case-insensitive) at the domain validation seam. If duplicate dish names are returned by the generative model, `isValidDiscoveryResponse` rejects the payload, triggering `CulinaryGuideService.getTopFoodsStream`'s built-in retry mechanism (`MAX_ATTEMPTS = 2`) to attempt a second generation stream, ensuring the UI receives 6 distinct dishes without silent truncation or accordion ID collisions.

**Blocked by:** Ticket 11: Extract Culinary Guide Validation

**Status:** ready-for-agent

## Acceptance Criteria & Checklist

- [ ] Update `isValidDiscoveryResponse` in `src/app/core/culinary-guide/culinary-guide.validation.ts`:
  - Assert that all food items have distinct names: `new Set(foods.map(f => f.name.trim().toLowerCase())).size === EXPECTED_FOOD_COUNT`.
  - Return `false` if `foods.length === EXPECTED_FOOD_COUNT` but contains duplicate dish names.
- [ ] Add unit tests in `src/app/core/culinary-guide/culinary-guide.validation.spec.ts`:
  - Test case: payload with 6 foods where 2 foods have identical names (exact or case/whitespace-variant) returns `false`.
  - Test case: payload with 6 foods with distinct names returns `true`.
- [ ] Add unit tests in `src/app/core/culinary-guide/culinary-guide.service.spec.ts`:
  - Verify that when attempt 1 returns duplicate dish names, `getTopFoodsStream` emits a retry reset chunk (`foods: []`) and executes attempt 2.
  - Verify that when attempt 2 returns 6 unique dishes, the stream completes successfully with all 6 dishes.
  - Verify that when attempt 2 also returns duplicate dish names, the service throws an error without masking the failure.
- [ ] Verify existing test suites pass cleanly via `angular-cli` test runner.
- [ ] Enforce repository invariants: zero `!`, zero `../`, native `#` for private state/deps, and TypeScript `private` for methods.
