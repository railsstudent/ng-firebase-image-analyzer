# 02: Staged Lazy Loading ConfigService Refactor

**What to build:** Refactor `ConfigService` in `src/app/core/firebase/config.service.ts` to implement staged dynamic ESM imports (`getApp`, `ensureAppCheck`, `getAiBackend`), deterministic Remote Config resolution with fallback timeout, and idempotent `initialize()` execution for route environment initializers, with comprehensive unit tests in `config.service.spec.ts`.

**Blocked by:** 01: Remote Config Contract and Host Utility

**Status:** done

- [x] Initialize `#appConfig: AppRemoteConfig` from `remote-config-defaults.json` defaults and expose `get appConfig(): AppRemoteConfig` in `ConfigService`.
- [x] Expose `initialize(): void` storing `this.#appReady = this.loadFirebase()` idempotently in `ConfigService`.
- [x] Implement `getApp(): Promise<FirebaseApp>` with dynamic imports of `firebase/app` and `firebase/remote-config`.
- [x] Implement private `ensureAppCheck(isLocalhost: boolean): Promise<void>` with dynamic import of `firebase/app-check` invoked within `getAiBackend()`.
- [x] Implement `getAiBackend(): Promise<AI>` with dynamic import of `firebase/ai` (`getAI`, `AgentPlatformBackend`), awaiting `getApp()` and `ensureAppCheck()`.
- [x] Trigger `fetchRemoteConfig` in the background with timeout bounds while serving synchronous bundled defaults immediately.
- [x] Update `src/app/core/firebase/config.service.spec.ts` with test coverage for `getApp()`, `getAiBackend()`, App Check localhost vs production host configuration, Remote Config fallback when offline/timeout, and idempotent `initialize()` calls.
- [x] Verify test suite passes with `npm run test:once` and lint checks pass with `npm run lint`.
