# 03: Asynchronous AI Model Cache and AI Service Integration

**What to build:** Refactor `AiModelCacheService` to resolve the `AI` instance on demand via `ConfigService.getAiBackend()` and construct model parameters using `ConfigService.appConfig`, expose `clearCache()`, and update `AiService` methods (`preWarmModel` and `generateContentStream`) to await model retrieval via `this.getCachedModel()`.

**Blocked by:** 02: Staged Lazy Loading ConfigService Refactor

**Status:** todo

- [ ] Remove `FIREBASE_AI` token dependency and inject `ConfigService` directly in `AiModelCacheService`.
- [ ] Refactor `getOrCreateModel(config: ModelConfigParams): Promise<GenerativeModel>` in `AiModelCacheService` to await `ConfigService.getAiBackend()`, compute `getCacheKey()` from `ConfigService.appConfig`, and cache `GenerativeModel`.
- [ ] Expose `clearCache(): void` in `AiModelCacheService` to clear `#modelCache`.
- [ ] Update `private async getCachedModel(params: GenerateContentParams): Promise<GenerativeModel>` in `AiService` to await `this.#cacheService.getOrCreateModel(params)`.
- [ ] Update `preWarmModel()` in `AiService` to `const model = await this.getCachedModel(params)`.
- [ ] Update `generateContentStream()` in `AiService` to `const model = await this.getCachedModel(params)`.
- [ ] Update `src/app/core/firebase/ai.service.spec.ts` (and add/update `ai-model-cache.service.spec.ts` if needed) to test async model retrieval, cache hits, and cache eviction.
- [ ] Verify test suite passes with `npm run test:once` and lint checks pass with `npm run lint`.
