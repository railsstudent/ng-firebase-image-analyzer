# Ticket 09: CulinaryGuideCoordinatorService, Barrel Exports, and Verification

**Blocked by:** Ticket 03, Ticket 06, Ticket 08

**Status:** ready

## Context & Purpose

Implement the feature-level coordinator service (`CulinaryGuideCoordinatorService`) that coordinates discovery searches, on-demand recipe synthesis, in-memory caching, single-pass markdown-to-HTML conversion via `MarkdownFormatterService`, and clean barrel exports in `src/app/core/culinary-guide/index.ts`. Per ADR-0029, employs a hybrid streaming architecture returning `AsyncGenerator` to UI components: progressively streaming discovery foods and recipe ingredients to eliminate perceived latency on on-device models (Gemini Nano), while deferring markdown formatting until full completion to prevent partial-tag flicker. Implements retry reset masking and transactional caching while remaining completely signal-free (localizing all reactive signals, execution flags, and error handling to consuming Angular components). Run linting and test suite verification.

## Scope of Work

1. Create `src/app/core/culinary-guide/index.ts` exporting all public core domain contracts (`CulinaryFoodItem`, `CulinaryDestination`, `DestinationDataset`, `StreamingCulinaryDiscoveryWithMetadata`, `StreamingCulinaryRecipeWithMetadata`, `CulinaryLocation`, `CulinaryRecipeTarget`), services, schemas, and prompts (keeping intermediate wire models `TopFoodsResponse`, `CulinaryRecipeResponse` and validation functions package-internal).
2. Create feature view model `src/app/features/culinary-guide/interfaces/culinary-recipe-detail.interface.ts`:
   - `export interface CulinaryRecipeDetail extends StreamingCulinaryRecipeWithMetadata { recipeHtml: string; }`
3. Create `src/app/features/culinary-guide/services/culinary-guide-coordinator.service.ts`:
   - 3.1. Injected dependencies:
     - `readonly #culinaryService = inject(CulinaryGuideService)`
     - `readonly #markdownFormatter = inject(MarkdownFormatterService)`
   - 3.2. Zero reactive signals:
     - Service owns zero Angular signals or reactive state flags (per ADR-0029 and Coding Standard § 3; signals are localized to consuming components).
   - 3.3. In-memory cache & key-builder helper:
     - Private cache map: `readonly #recipeCache = new Map<string, CulinaryRecipeDetail>()`
     - Private helper method: `private buildRecipeCacheKey({ country, city, dishName }: CulinaryRecipeTarget): string` returning `${country.trim().toLowerCase()}:${city.trim().toLowerCase()}:${dishName.trim().toLowerCase()}`.
     - Public cache reset method: `clearCache(): void` clearing `#recipeCache`.
   - 3.4. `search(location: CulinaryLocation): AsyncGenerator<StreamingCulinaryDiscoveryWithMetadata>`:
     - Accepts whole `CulinaryLocation` domain contract without parameter destructuring.
     - Streams Stage 1 discovery via `for await (const chunk of this.#culinaryService.getTopFoodsStream(location))`.
     - Masks retry resets: suppresses empty chunks (`chunk.foods.length === 0`) if previous foods have already been yielded, preventing UI flicker during on-device retry recovery.
     - Yields each valid discovery chunk progressively so consuming components can update local signals (`foods.set()`, `honorableMentions.set()`).
     - Upon successful stream completion, clears `#recipeCache` (`this.#recipeCache.clear()`).
     - On stream error, lets errors propagate naturally to the caller without clearing `#recipeCache` or wiping previously cached state.
   - 3.5. `loadRecipe(target: CulinaryRecipeTarget): AsyncGenerator<CulinaryRecipeDetail>`:
     - Accepts whole `CulinaryRecipeTarget` domain contract without parameter destructuring.
     - Computes cache key using `this.buildRecipeCacheKey(target)`.
     - On cache hit: yields cached `CulinaryRecipeDetail` immediately in a single emission and returns.
     - On cache miss: streams Stage 2 recipe via `for await (const chunk of this.#culinaryService.getRecipeStream(target))`.
     - Masks retry resets: suppresses empty chunks (`chunk.ingredients.length === 0`) if previous ingredients have already been yielded.
     - Yields progressive chunks with `recipeHtml: ''` so ingredients populate immediately while recipe instructions are generating.
     - When the stream finishes, formats the full buffered recipe markdown via `await this.#markdownFormatter.format(chunk.recipe)`.
     - Assembles the complete `CulinaryRecipeDetail` with populated `recipeHtml`, stores in `#recipeCache`, and yields it as the final chunk.
     - On stream error, lets errors propagate naturally to the caller without corrupting the cache.
4. Create unit tests `src/app/features/culinary-guide/services/culinary-guide-coordinator.service.spec.ts`.
5. Run intermediate verification per `docs/agents/testing-guide.md` (excluding `knip --production` until UI integration):
   - `ng lint` (ESLint on TypeScript / templates)
   - `npm run check:cycles` (circular dependency validation)
   - `npm run cspell` (spelling check)
   - `npx ng test --include="src/app/features/culinary-guide/**/*.spec.ts" --no-watch`

## Acceptance Criteria

- [x] `CulinaryRecipeDetail` feature view model extends `StreamingCulinaryRecipeWithMetadata` and resides in `src/app/features/culinary-guide/interfaces/`.
- [x] `CulinaryGuideCoordinatorService` coordinates progressive discovery search, recipe synthesis, caching, and single-pass markdown formatting.
- [x] Service is completely signal-free (no Angular signals; presentation signals localized to consuming components per ADR-0029).
- [x] `search(location)` returns `AsyncGenerator` yielding progressive discovery chunks and clears `#recipeCache` only upon successful stream completion.
- [x] `loadRecipe(target)` returns `AsyncGenerator` yielding progressive ingredients with `recipeHtml: ''`, deferring single-pass HTML formatting until full completion.
- [ ] Coordinator suppresses empty reset chunks during on-device retry recovery.
- [x] Expanding an already-loaded recipe retrieves it immediately from `#recipeCache` as a single-emission generator.
- [x] Failed search preserves existing cache and propagates error.
- [x] Exposes `clearCache(): void` for explicit cache invalidation.
- [x] All public core domain symbols exported from `src/app/core/culinary-guide/index.ts` (excluding internal wire models and validation functions).
- [ ] Unit tests verify progressive discovery streaming, retry masking, recipe caching (hit vs miss), deferred markdown formatting, transactional cache clearing, and error propagation.
- [ ] Intermediate verification (`ng lint && npm run check:cycles && npm run cspell` and unit tests) passes cleanly.
