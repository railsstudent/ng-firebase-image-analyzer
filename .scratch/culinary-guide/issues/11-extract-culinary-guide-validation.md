# Ticket 11: Extract Culinary Guide Response Validation Functions

**Blocked by:** Ticket 06, Ticket 08, Ticket 10

**Status:** done

## Context & Purpose

Extract the inline AI stream completion validation logic from `CulinaryGuideService` into pure, dedicated validation functions within `src/app/core/culinary-guide/culinary-guide.validation.ts`. This encapsulates validation boundary rules (satisfying food count, honorable mentions range, non-empty ingredients, and non-blank recipes), eliminates repeated logic, and allows isolated unit testing without mocking complex AI streaming generators.

In accordance with our Deep Module architecture, these validation functions remain package-internal within `src/app/core/culinary-guide/` and are not exported from `index.ts`.

## Scope of Work

1. Create `src/app/core/culinary-guide/culinary-guide.validation.ts`:
   - `isValidDiscoveryResponse({ foods, honorableMentions }: TopFoodsResponse): boolean`:
     - Validates `foods.length === EXPECTED_FOOD_COUNT`.
     - Validates `MIN_HONORABLE_MENTIONS <= honorableMentions.length <= MAX_HONORABLE_MENTIONS`.
   - `isValidRecipeResponse({ ingredients, recipe }: CulinaryRecipeResponse): boolean`:
     - Validates `ingredients.length >= 1`.
     - Validates `recipe.trim().length > 0` (ensuring blank or whitespace-only recipe text is rejected).
2. Update `src/app/core/culinary-guide/culinary-guide.service.ts`:
   - Import `isValidDiscoveryResponse` and `isValidRecipeResponse` from `./culinary-guide.validation`.
   - In `getTopFoodsStream()`: replace the inline 3-part check with `isValidDiscoveryResponse({ foods: latestFoods, honorableMentions: latestHonorableMentions })`.
   - In `getRecipeStream()`: replace the inline check with `isValidRecipeResponse({ ingredients: latestIngredients, recipe: latestRecipe })`.
   - Remove unused constant imports (`EXPECTED_FOOD_COUNT`, `MIN_HONORABLE_MENTIONS`, `MAX_HONORABLE_MENTIONS`) from `culinary-guide.service.ts` if only needed in the validation file (preserving error message interpolation as appropriate).
3. Create unit tests `src/app/core/culinary-guide/culinary-guide.validation.spec.ts`:
   - Test `isValidDiscoveryResponse`:
     - Returns `true` for exact count match (`EXPECTED_FOOD_COUNT` foods and `1` or `2` honorable mentions).
     - Returns `false` when foods count is below or above `EXPECTED_FOOD_COUNT`.
     - Returns `false` when honorable mentions count is below `MIN_HONORABLE_MENTIONS` or above `MAX_HONORABLE_MENTIONS`.
   - Test `isValidRecipeResponse`:
     - Returns `true` for valid ingredients and non-empty recipe string.
     - Returns `false` when ingredients array is empty.
     - Returns `false` when recipe string is empty (`""`).
     - Returns `false` when recipe string contains only whitespace (`"   \n  \t  "`).
4. Run intermediate verification per `docs/agents/testing-guide.md` (excluding `knip --production` until UI integration):
   - `ng lint` (ESLint on TypeScript / templates)
   - `npm run check:cycles` (circular dependency validation)
   - `npm run cspell` (spelling check)
   - `npx ng test --include="src/app/core/culinary-guide/**/*.spec.ts" --no-watch`

## Acceptance Criteria

- [x] `culinary-guide.validation.ts` exports `isValidDiscoveryResponse` and `isValidRecipeResponse` accepting `TopFoodsResponse` and `CulinaryRecipeResponse`.
- [x] `isValidDiscoveryResponse` verifies `EXPECTED_FOOD_COUNT` and honorable mentions range boundaries using constants from `culinary-guide.const.ts`.
- [x] `isValidRecipeResponse` verifies at least 1 ingredient and non-blank (`trim().length > 0`) recipe text.
- [x] `CulinaryGuideService` delegates stream completion checks to `isValidDiscoveryResponse` and `isValidRecipeResponse`.
- [x] `culinary-guide.validation.ts` remains package-internal (not re-exported in `index.ts`).
- [x] Comprehensive unit tests in `culinary-guide.validation.spec.ts` cover valid, boundary, and invalid scenarios for both discovery and recipe responses.
- [x] All unit tests in `culinary-guide.service.spec.ts` continue to pass without regression.
- [x] Intermediate verification (`ng lint && npm run check:cycles && npm run cspell` and unit tests) passes cleanly.
