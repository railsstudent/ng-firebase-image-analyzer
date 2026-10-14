# Ticket 09: CulinaryGuideStateService, Barrel Exports, and Verification

**Blocked by:** Ticket 03, Ticket 06, Ticket 08

**Status:** ready

## Context & Purpose

Implement the feature-level state management service (`CulinaryGuideStateService`) that coordinates discovery searches, on-demand recipe accordion streaming, caching, markdown-to-HTML conversion via `MarkdownFormatterService`, and clean barrel exports in `src/app/core/culinary-guide/index.ts`. Run linting and test suite verification.

## Scope of Work

1. Create `src/app/core/culinary-guide/index.ts` exporting all public core domain contracts (`CulinaryFoodItem`, `CulinaryDestination`, `DestinationDataset`, `StreamingCulinaryDiscoveryWithMetadata`, `StreamingCulinaryRecipeWithMetadata`), services, schemas, and prompts (keeping intermediate wire models `TopFoodsResponse` and `CulinaryRecipeResponse` package-internal).
2. Create feature view model `src/app/features/culinary-guide/models/culinary-recipe-detail.interface.ts`:
   - `export interface CulinaryRecipeDetail extends StreamingCulinaryRecipeWithMetadata { recipeHtml: string; }`
3. Create `src/app/features/culinary-guide/services/culinary-guide-state.service.ts`:
   - Signals: `foods = signal<CulinaryFoodItem[]>([])`, `honorableMentions = signal<CulinaryFoodItem[]>([])`, `selectedFood = signal<string | null>(null)`, `isSearching = signal<boolean>(false)`, `isStreamingRecipe = signal<boolean>(false)`, `discoveryTokens = signal<TokenSummary | null>(null)`, `discoveryModality = signal<TokenModalityBreakdown | null>(null)`, `thoughtSummary = signal<string>('')`.
   - In-memory cache: `#recipeCache = new Map<string, CulinaryRecipeDetail>()`. Key format: `${country}:${city}:${dishName}` in lowercase.
   - `search({ country, city }: CulinaryLocation)`: Clears `#recipeCache`, resets active signals, and streams Stage 1 discovery.
   - `loadRecipe({ country, city, dishName }: CulinaryRecipeTarget)`: Checks `#recipeCache`; if found, sets active recipe signal immediately without calling AI. If not found, streams Stage 2, formats recipe markdown with `MarkdownFormatterService`, saves to `#recipeCache`, and updates signals.
4. Create unit tests `src/app/features/culinary-guide/services/culinary-guide-state.service.spec.ts`.
5. Run project verification: `npm run lint` and `npm run test:once`.

## Acceptance Criteria

- [ ] `CulinaryRecipeDetail` feature view model extends `StreamingCulinaryRecipeWithMetadata` and resides in `src/app/features/culinary-guide/models/`.
- [ ] `CulinaryGuideStateService` coordinates state, streaming, caching, and markdown formatting.
- [ ] Changing search criteria resets the cache and active dish state.
- [ ] Expanding an already-loaded accordion item retrieves recipe immediately from cache without calling AI backend.
- [ ] All public core domain symbols exported from `src/app/core/culinary-guide/index.ts` (excluding internal wire models and feature view models).
- [ ] Unit tests verify discovery streaming, recipe caching (cache hit vs. cache miss), markdown formatting integration, and error state transitions.
- [ ] `npm run lint` and `npm run test:once` pass with zero errors.
