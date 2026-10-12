# 04: Cleanup Root Bootstrap and Providers

**What to build:** Remove `provideAppInitializer` and `provideFirebaseAI` from `src/app/app.config.ts`, delete obsolete files (`ai.const.ts`), configure deferred initialization on `/image-analysis`, and verify public domain exports.

**Blocked by:** 03: Asynchronous AI Model Cache and AI Service Integration

**Status:** done

- [x] Remove `provideAppInitializer(() => inject(ConfigService).initialize())` from `src/app/app.config.ts`.
- [x] Remove `provideFirebaseAI()` and obsolete injection tokens (`ai.const.ts`).
- [x] Remove unused imports from `src/app/app.config.ts`.
- [x] Retain `host.util` and `AppRemoteConfig` as internal domain modules (unexported from `src/app/core/firebase/index.ts` to maintain encapsulation).
- [x] Add `provideEnvironmentInitializer(() => inject(ConfigService).initialize())` to `ROUTE_PATHS.IMAGE_ANALYSIS` in `src/app/app.routes.ts`.
- [x] Create `src/app/app.routes.spec.ts` testing route definitions to assert deferred initialization on `/image-analysis` and zero initialization on `/home`.
- [x] Create `src/app/app.config.spec.ts` testing `appConfig` provider array to assert zero Firebase root providers and proper router/service worker configuration.
- [x] Verify test suite passes with `npm run test:once` and lint checks pass with `npm run lint`.
