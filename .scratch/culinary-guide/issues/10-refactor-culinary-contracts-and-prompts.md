# Ticket 10: Refactor Culinary Contracts, Schema Symmetry, and Prompt Targets

**Blocked by:** Ticket 05, Ticket 07

**Status:** done

## Context & Purpose

Eliminate primitive data clumps across prompt functions and service interfaces by introducing canonical composite types `CulinaryLocation` and `CulinaryRecipeTarget`. Align schema naming symmetry by renaming `RecipeDetailSchema` to `CulinaryRecipeSchema`.

## Scope of Work

1. Update `src/app/core/culinary-guide/culinary-guide.interface.ts`:
   - Declare `CulinaryLocation`: `{ readonly country: string; readonly city: string; }`
   - Declare `CulinaryRecipeTarget extends CulinaryLocation`: `{ readonly dishName: string; }`
2. Update `src/app/core/culinary-guide/culinary-guide.schema.ts`:
   - Rename `RecipeDetailSchema` to `CulinaryRecipeSchema` to match `CulinaryRecipeResponse` and `StreamingCulinaryRecipeWithMetadata`.
3. Update `src/app/core/culinary-guide/culinary-guide.prompt.ts`:
   - Refactor `createTopFoodsPrompt(location: CulinaryLocation): string`
   - Refactor `createRecipePrompt(target: CulinaryRecipeTarget): string`
4. Update unit tests in `src/app/core/culinary-guide/culinary-guide.prompt.spec.ts`:
   - Pass typed `CulinaryLocation` and `CulinaryRecipeTarget` test fixtures.
5. Update downstream issue tickets (06, 08, 09):
   - Update `getTopFoodsStream(location: CulinaryLocation)` in Ticket 06.
   - Update `getRecipeStream(target: CulinaryRecipeTarget)` and schema name in Ticket 08.
   - Update `search(location: CulinaryLocation)`, `loadRecipe(target: CulinaryRecipeTarget)`, and cache key generation in Ticket 09.
6. Run project verification: `npm run lint` and `npm run test:once`.

## Acceptance Criteria

- [x] `CulinaryLocation` and `CulinaryRecipeTarget` are exported from `src/app/core/culinary-guide/culinary-guide.interface.ts`.
- [x] `createTopFoodsPrompt` consumes a single `CulinaryLocation` object.
- [x] `createRecipePrompt` consumes a single `CulinaryRecipeTarget` object.
- [x] `RecipeDetailSchema` is renamed to `CulinaryRecipeSchema` in `src/app/core/culinary-guide/culinary-guide.schema.ts`.
- [x] All unit tests in `culinary-guide.prompt.spec.ts` pass with zero failures.
- [x] Downstream tickets 06, 08, and 09 signatures and acceptance criteria reflect the structured parameter types.
- [x] `npm run lint` and `npm run test:once` pass with zero errors.
