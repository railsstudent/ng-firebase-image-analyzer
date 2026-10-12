# 0026. Staged Lazy Loading and Deferred Firebase AI Initialization

Date: 2026-10-12
Status: Accepted

## Context

1. **Initial Bundle Bloat & Core Web Vitals Degradation**:
   - Previously, `provideAppInitializer(() => inject(ConfigService).initialize())` and `provideFirebaseAI()` were registered eagerly in `src/app/app.config.ts`.
   - This forced `firebase/app`, `firebase/app-check`, `firebase/remote-config`, and `firebase/ai` into the main entrypoint bundle.
   - Initial root bootstrap blocked on network handshakes to Firebase and Remote Config, severely penalizing First Contentful Paint (FCP), Largest Contentful Paint (LCP), and Total Blocking Time (TBT) on static landing pages (`/home`).

2. **Route-Level Isolation and Multi-Feature Scalability**:
   - The landing page (`/home`) requires zero Firebase functionality.
   - Future routes (e.g. `country-delicacy`, `image-analysis`) require Firebase and AI features at different stages of user interaction.
   - Eager root initialization made route-level pre-warming via `provideEnvironmentInitializer` redundant and ineffective.

3. **Remote Config Fetch Race Condition**:
   - If Remote Config fetching is triggered in a fire-and-forget background manner, services attempting to create AI models during initial user action could read fallback default parameters before cloud overrides were applied.
   - Model caching keys in `AiModelCacheService` risked caching models instantiated against stale or default model definitions.

## Decision

1. **Root Bootstrap Decoupling**:
   - Remove `provideAppInitializer` and `provideFirebaseAI` from `src/app/app.config.ts`.
   - The root shell boots with 0 Firebase SDK dependencies in the initial bundle.

2. **Staged Dynamic ESM Loading in `ConfigService`**:
   - Staged dynamic imports inside `ConfigService`:
     - `getApp()`: Dynamically imports `firebase/app` and `firebase/remote-config`.
     - `ensureAppCheck()`: Dynamically imports `firebase/app-check` and applies reCAPTCHA Enterprise / Debug token setup.
     - `getAiBackend()`: Dynamically imports `firebase/ai` (`getAI`, `AgentPlatformBackend`) after ensuring `getApp()` and `ensureAppCheck()`.
   - Provide synchronous default configuration snapshot (`#appConfig`) initialized from `remote-config-defaults.json`.

3. **Deterministic Remote Config Synchronization**:
   - In `ConfigService.getApp()`, await `fetchRemoteConfig()` (bounded by `DEV_TIMEOUT` / `PROD_TIMEOUT` fallbacks) before `#appReady` resolves.
   - Guarantee that all callers of `getAiBackend()` receive an AI instance backed by resolved Remote Config values.

4. **Idempotent Background Pre-Warming**:
   - `ConfigService.initialize()` triggers `loadFirebase()` without throwing, storing the singleton promise in `#appReady`.
   - Seamlessly supports route-level pre-warming via `providers: [provideEnvironmentInitializer(() => inject(ConfigService).initialize())]` across any number of lazy-loaded routes.

5. **Asynchronous Model Caching in `AiModelCacheService`**:
   - Refactor `AiModelCacheService.getOrCreateModel()` to `async` returning `Promise<GenerativeModel>`.
   - Await `ConfigService.getAiBackend()` and construct model parameters / cache keys against `ConfigService.appConfig`.
   - Expose `clearCache()` for dynamic runtime cache eviction.

6. **Engine-Agnostic `AiService` Integration**:
   - Update `AiService.preWarmModel()` and `AiService.generateContentStream()` to await model retrieval via `this.getCachedModel()`.
   - Deprecate and delete `FIREBASE_AI` injection token and `provideFirebaseAI()` provider.

## Consequences

- **Positive**:
  - Main entry bundle is 100% free of Firebase SDK code, significantly improving FCP, LCP, CLS, and TBT on the home page.
  - Firebase SDKs are partitioned into discrete asynchronous chunks loaded only when AI features are accessed or pre-warmed.
  - Eliminates race conditions between Remote Config defaults and fetched values.
  - Supports seamless route-level pre-warming across multiple lazy routes using `provideEnvironmentInitializer`.
- **Negative**:
  - First AI request on cold navigation incurs an asynchronous ESM import and App Check initialization delay (mitigated by background pre-warming via `ImageAnalysisComponent.preWarm()` or route initializers).
