# 02: Staged Lazy Loading ConfigService Refactor

**What to build:** Refactor `ConfigService` in `src/app/core/firebase/config.service.ts` to implement staged dynamic ESM imports (`getApp`, `ensureAppCheck`, `getAiBackend`), deterministic Remote Config resolution with fallback timeout, and idempotent `initialize()` execution for route environment initializers, with comprehensive unit tests in `config.service.spec.ts`.

**Blocked by:** 01: Remote Config Contract and Host Utility

**Status:** todo

- [ ] Initialize `#appConfig: AppRemoteConfig` from `remote-config-defaults.json` defaults and expose `get appConfig(): AppRemoteConfig` in `ConfigService`.
- [ ] Expose `initialize(): void` storing `this.#appReady = this.loadFirebase()` idempotently in `ConfigService`.
- [ ] Implement `getApp(): Promise<FirebaseApp>` with dynamic imports of `firebase/app` and `firebase/remote-config`.
- [ ] Implement `ensureAppCheck(isLocalhost: boolean): Promise<void>` with dynamic import of `firebase/app-check`.
- [ ] Implement `getAiBackend(): Promise<AI>` with dynamic import of `firebase/ai` (`getAI`, `AgentPlatformBackend`), awaiting `getApp()` and `ensureAppCheck()`.
- [ ] Ensure `fetchRemoteConfig` awaits activation inside `loadFirebase()` bounded by `DEV_TIMEOUT` / `PROD_TIMEOUT`.
- [ ] Update `src/app/core/firebase/config.service.spec.ts` with test coverage for `getApp()`, `ensureAppCheck()`, `getAiBackend()`, App Check debug tokens (Transient vs Locked Mode), Remote Config fallback when offline/timeout, and idempotent `initialize()` calls.
- [ ] Verify test suite passes with `npm run test:once` and lint checks pass with `npm run lint`.
