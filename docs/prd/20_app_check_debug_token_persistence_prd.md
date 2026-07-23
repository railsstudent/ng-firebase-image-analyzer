# Product Requirement Document (PRD): Persistent Local App Check Sandbox

## Problem Statement

When developers are building and testing the application locally on different browsers (such as Safari, Firefox, or Chrome's Incognito mode), the local App Check Sandbox generates a brand-new, randomized debug token for each unique browser session because `FIREBASE_APPCHECK_DEBUG_TOKEN` is dynamically set to `true`. 

This forces developers to repeatedly copy the auto-generated debug token from the browser developer console and register it in the Firebase Console under the App Check tab. Storing a persistent, pre-registered debug token directly in source code is not secure, and attempting to fetch it from Firebase Remote Config introduces a circular dependency (as App Check must be initialized before Remote Config can be retrieved securely).

## Solution

Allow developers to define a static, pre-registered App Check debug token inside their local, git-ignored `.env` file (`FIREBASE_APPCHECK_DEBUG_TOKEN`). 

During local build configuration, this token is compiled into `public/firebase.config.json` as `appCheckDebugToken` (defaulting to `""` if omitted). At runtime, the application checks for this token:
1. **Locked Mode:** If a custom token string is provided, it configures App Check with that exact token, enabling immediate testing across any browser without manual session-level registration.
2. **Transient Mode (Fallback):** If no token is provided, it gracefully falls back to the dynamic `isDevMode() || isLocalhost` boolean behavior, ensuring zero friction for new developers.

## User Stories

1. As a developer, I want to define a static App Check debug token in my local `.env` file, so that I can reuse a single registered bypass token across multiple browsers (Safari, Firefox, Chrome).
2. As a developer, I want the build configuration script to inject my custom debug token into a local-only, git-ignored JSON file, so that my development credentials are never checked into source control or exposed to the public internet.
3. As a new project contributor, I want the local environment to run successfully without requiring me to configure an App Check debug token, so that I have a friction-free onboarding experience.
4. As an automated test suite, I want to verify the initialization sequence of the App Check Sandbox, so that changes to configuration files do not inadvertently break security bypasses or create compile-time type errors.

## Implementation Decisions

1. **Config Generator Expansion:**
   - Enhance the build-time generation script (`generate-firebase-config.js`) to read `process.env.FIREBASE_APPCHECK_DEBUG_TOKEN` from the environment.
   - Inject this value into the output `public/firebase.config.json` under the key `appCheckDebugToken`, defaulting to an empty string (`""`) if the environment variable is not defined.

2. **Type-Safe Fallback Logic:**
   - Modify `ConfigService` to read `firebaseConfig.appCheckDebugToken` at startup.
   - If the property contains a valid string (is truthy), assign it directly to `(globalThis as any).FIREBASE_APPCHECK_DEBUG_TOKEN`.
   - If the property is empty (falsy), assign `isDevMode() || isLocalhost` to `(globalThis as any).FIREBASE_APPCHECK_DEBUG_TOKEN` as a fallback.

3. **Documentation Alignment:**
   - Update `CONTEXT.md` to broaden the definition of the "App Check Sandbox" domain concept, documenting both Transient (fallback) and Locked (persistent) modes.
   - Update `firebase/.env.example` to document the optional `FIREBASE_APPCHECK_DEBUG_TOKEN` key.

## Testing Decisions

- **Good Test Criteria:** Tests must verify external behavior (the assignment of the global `FIREBASE_APPCHECK_DEBUG_TOKEN` value on the global window context) under different configuration environments, rather than verifying internal private service variables.
- **Modules Tested:** `ConfigService` will be tested via a new unit test suite: `src/app/features/ai/services/config.service.spec.ts`.
- **Test Seams:**
  - Mocking the imported `firebaseConfig` object using standard Jasmine/Angular injection.
  - Asserting the final value of `globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN` under two test scenarios:
    1. Custom debug token defined in configuration (Locked Mode).
    2. Empty debug token in configuration (Transient Fallback Mode).
- **Prior Art:** Existing angular component spec suites (such as `src/app/app.spec.ts` and `src/app/features/home/home.spec.ts`) utilizing standard Jasmine assertions and Angular Testbed configurations.

## Out of Scope

- Publishing or hosting App Check debug credentials inside production cloud stores (like Firebase Remote Config).
- Automating the retrieval of debug tokens from the Firebase Console itself.
- Production environment bypasses (App Check sandbox is strictly limited to localhost / development modes).

## Further Notes

This PRD satisfies all requirements specified in **ADR 19: Persistent Local App Check Sandbox via Environment Configuration**.
