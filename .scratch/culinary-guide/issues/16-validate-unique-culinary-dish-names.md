# Ticket 16: Validate & Normalize Unique Culinary Dish Names and Honorable Mentions

**What to build:** Enforce that all discovered food items and honorable mentions in Stage 1 Culinary Discovery have unique dish names (case-insensitive, trimmed) and maintain cross-list disjoint integrity at the domain normalization and validation seams:

1. Pure Normalizer (`normalizeDiscoveryResponse`):
   - Deduplicates `foods` keeping the first occurrence of each unique dish name (case-insensitive, trimmed).
   - Drops `honorableMentions` that match any dish in `foods` (cross-list disjoint check: runner-ups cannot duplicate top dishes).
   - Deduplicates `honorableMentions` keeping the first occurrence.
2. Progressive Chunk Normalization:
   - Call `normalizeDiscoveryResponse` on each emitted chunk in `CulinaryGuideService.getTopFoodsStream`, preventing intermediate duplicate accordion headers / IDs and duplicate badges in the UI.
3. Pure Boolean Validator (`isValidDiscoveryResponse`):
   - Validates that normalized `foods.length === EXPECTED_FOOD_COUNT` (6) and `MIN_HONORABLE_MENTIONS <= honorableMentions.length <= MAX_HONORABLE_MENTIONS` (1-2).
   - If duplicates reduce `foods` below 6, or honorable mentions are starved to 0, validation naturally fails and triggers Attempt 2 retry (`MAX_ATTEMPTS = 2`).

**Blocked by:** Ticket 11: Extract Culinary Guide Validation

**Status:** done

## Acceptance Criteria & Checklist

- [x] Export pure normalizer `normalizeDiscoveryResponse` and maintain pure `isValidDiscoveryResponse` in `src/app/core/culinary-guide/culinary-guide.validation.ts`:
  - `normalizeDiscoveryResponse({ foods, honorableMentions }: TopFoodsResponse): TopFoodsResponse`: Deduplicates foods preserving first occurrence, drops mentions colliding with foods, and deduplicates remaining mentions (all case/whitespace-insensitive).
  - `isValidDiscoveryResponse({ foods, honorableMentions }: TopFoodsResponse): boolean`: Validates `foods.length === EXPECTED_FOOD_COUNT` and `honorableMentions.length >= MIN_HONORABLE_MENTIONS && honorableMentions.length <= MAX_HONORABLE_MENTIONS`.
- [x] Integrate chunk-level normalization and validation into `CulinaryGuideService.getTopFoodsStream`:
  - Pass each streamed partial chunk through `normalizeDiscoveryResponse` before yielding to avoid duplicate keys/badges during streaming.
  - Evaluate completion with `isValidDiscoveryResponse(normalizeDiscoveryResponse({ foods, honorableMentions }))`, triggering Attempt 2 retry on invalid attempts.
- [x] Add unit tests in `src/app/core/culinary-guide/culinary-guide.validation.spec.ts`:
  - Test `normalizeDiscoveryResponse`: food deduplication (first occurrence preserved), cross-list mention exclusion against foods, mention deduplication, clean disjoint retention, and empty array fallbacks.
  - Test `isValidDiscoveryResponse`: boundary assertions for 6 foods and 1-2 mentions.
- [x] Add unit tests in `src/app/core/culinary-guide/culinary-guide.service.spec.ts`:
  - Stream yields deduplicated chunks per partial update.
  - Attempt 1 duplicate foods (< 6 unique) triggers reset chunk and Attempt 2 retry.
  - Attempt 1 duplicate mentions that deduplicate to 1 passes Attempt 1 without retry.
  - Attempt 1 mentions colliding with top foods and starving mentions to 0 triggers reset chunk and Attempt 2 retry.
  - Terminal failure thrown when Attempt 2 fails validation.
- [x] Repository invariants: zero `!`, zero `../`, native `#` for private state/deps, TypeScript `private` for methods, and no agent git commits.
