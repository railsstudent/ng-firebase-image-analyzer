# 3. Firebase & AI Provider Initialization Plan

## 1. Constants Definition

- File: `src/app/features/ai/constants/ai.constants.ts`
- Purpose: Declare the `FIREBASE_AI` `InjectionToken` for the Firebase AI service instance.

## 2. Configuration Service

- File: `src/app/features/ai/services/config.service.ts`
- Purpose:
  - Dynamically/statically load `firebase.config.json` and `remote-config-defaults.json`.
  - Initialize the Firebase App.
  - Enable App Check with ReCaptcha Enterprise (with debug token in `isDevMode()`).
  - Configure Remote Config (fetch interval `0` in dev mode, `1 hour` in prod mode).
  - Expose `firebaseApp` and `vertexAILocation` getters.

## 3. AI Providers

- File: `src/app/features/ai/providers/ai.provider.ts`
- Purpose: Implement `provideFirebaseAI()` utilizing `makeEnvironmentProviders` to resolve `ConfigService` and return the initialized `AI` instance via `VertexAIBackend`.

## 4. App Integration

- File: `src/app/app.config.ts`
- Purpose: Add `provideAppInitializer` to call `ConfigService.initialize()` and register `provideFirebaseAI()`.
