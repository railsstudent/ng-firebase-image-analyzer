# 03: Asynchronous AI Model Cache and AI Service Integration

**What to build:** Refactor `AiModelCacheService` to resolve the `AI` instance on demand via `ConfigService.getAiBackend()` and construct model parameters using `ConfigService.appConfig`, and update `AiService` methods (`preWarmModel` and `generateContentStream`) to await model retrieval via `this.getCachedModel()`.

**Blocked by:** 02: Staged Lazy Loading ConfigService Refactor

**Status:** done

- [x] Remove `FIREBASE_AI` token dependency and inject `ConfigService` directly in `AiModelCacheService`.
- [x] Refactor `getOrCreateModel(config: ModelConfigParams): Promise<GenerativeModel>` in `AiModelCacheService` to await `ConfigService.getAiBackend()`, compute `getCacheKey()` from `ConfigService.appConfig`, and cache `GenerativeModel`.
- [x] Update `private async getCachedModel(params: GenerateContentParams): Promise<GenerativeModel>` in `AiService` to await `this.#cacheService.getOrCreateModel(params)`.
- [x] Update `preWarmModel()` in `AiService` to `const model = await this.getCachedModel(params)`.
- [x] Update `generateContentStream()` in `AiService` to `const model = await this.getCachedModel(params)`.
- [x] Update `src/app/core/firebase/ai.service.spec.ts` and `ai-model-cache.service.spec.ts` to test async model retrieval and cache hits.
- [x] Verify test suite passes with `npm run test:once` and lint checks pass with `npm run lint`.
