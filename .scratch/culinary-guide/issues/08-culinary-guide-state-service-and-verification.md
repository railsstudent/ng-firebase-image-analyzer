# Ticket 08: CulinaryGuideStateService, Barrel Exports, and Verification

## Status

Ready

## Context & Purpose

Implement the feature-level state management service (`CulinaryGuideStateService`) that coordinates discovery searches, on-demand recipe accordion streaming, caching, markdown-to-HTML conversion via `MarkdownFormatterService`, and clean barrel exports in `src/app/core/culinary-guide/index.ts`. Run linting and test suite verification.

## Scope of Work

1. Create `src/app/core/culinary-guide/index.ts` exporting all domain contracts, services, schemas, and prompts.
2. Create `src/app/features/culinary-guide/services/culinary-guide-state.service.ts`:
   - Signals: `foods = signal<CulinaryFoodItem[]>([])`, `honorableMentions = signal<CulinaryFoodItem[]>([])`, `selectedFood = signal<string | null>(null)`, `isSearching = signal<boolean>(false)`, `isStreamingRecipe = signal<boolean>(false)`, `discoveryTokens = signal<TokenSummary | null>(null)`, `discoveryModality = signal<TokenModalityBreakdown | null>(null)`, `thoughtSummary = signal<string>('')`.
   - In-memory cache: `#recipeCache = new Map<string, CulinaryRecipeDetail>()`. Key format: `${country}:${city}:${dishName}` in lowercase.
   - `search(country: string, city: string)`: Clears `#recipeCache`, resets active signals, and streams Stage 1 discovery.
   - `loadRecipe(country: string, city: string, foodName: string)`: Checks `#recipeCache`; if found, sets active recipe signal immediately without calling AI. If not found, streams Stage 2, formats recipe markdown with `MarkdownFormatterService`, saves to `#recipeCache`, and updates signals.
3. Create unit tests `src/app/features/culinary-guide/services/culinary-guide-state.service.spec.ts`.
4. Run project verification: `npm run lint` and `npm run test:once`.

## Acceptance Criteria

- [ ] `CulinaryGuideStateService` coordinates state, streaming, caching, and markdown formatting.
- [ ] Changing search criteria resets the cache and active dish state.
- [ ] Expanding an already-loaded accordion item retrieves recipe immediately from cache without calling AI backend.
- [ ] All public domain symbols exported from `src/app/core/culinary-guide/index.ts`.
- [ ] Unit tests pass with 100% branch and statement coverage.
- [ ] `npm run lint` and `npm run test:once` pass with zero errors.
