# 04: Cleanup Root Bootstrap and Providers

**What to build:** Remove `provideAppInitializer` and `provideFirebaseAI` from `src/app/app.config.ts`, delete obsolete files (`ai.provider.ts`, `ai.const.ts`), and update `src/app/core/firebase/index.ts` public exports.

**Blocked by:** 03: Asynchronous AI Model Cache and AI Service Integration

**Status:** todo

- [ ] Remove `provideAppInitializer(() => inject(ConfigService).initialize())` from `src/app/app.config.ts`.
- [x] Remove `provideFirebaseAI()` from `src/app/app.config.ts`.
- [ ] Remove unused imports from `src/app/app.config.ts`.
- [x] Delete `src/app/core/firebase/ai.provider.ts` and `src/app/core/firebase/ai.const.ts`.
- [ ] Update `src/app/core/firebase/index.ts` to export `ConfigService`, `AiService`, `AppRemoteConfig`, `host.util`, constants, and interfaces.
- [ ] Create `src/app/app.config.spec.ts` testing `appConfig` provider array to assert zero Firebase root providers and proper router/service worker configuration.
- [ ] Verify test suite passes with `npm run test:once` and lint checks pass with `npm run lint`.
