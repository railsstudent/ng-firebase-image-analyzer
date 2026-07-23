# 19. Persistent Local App Check Sandbox via Environment Configuration

We decided to support both transient and persistent App Check debug tokens in local development environments. To avoid manual, repetitive console registration across different browsers, we will allow developers to store a static pre-registered App Check debug token in their local `.env` configuration (propagated into `public/firebase.config.json` via the generator script), while gracefully falling back to transient, auto-generated browser-session tokens if no static token is defined.

## Context

Originally, local development running on `localhost` (or local production previews) forced the Firebase App Check sandbox mode with `FIREBASE_APPCHECK_DEBUG_TOKEN = true`. While this was simple, it generated a new, randomized token for every new browser session (e.g., using incognito tabs, Firefox, or Safari), forcing developers to repeatedly register new debug tokens in the Firebase Console's App Check tab. Storing this persistent bypass token directly in the source code or in Firebase Remote Config was rejected due to security leaks and circular dependencies (App Check must initialize before Remote Config can be fetched securely).

## Decision

We will configure the `config:generate` script to extract `FIREBASE_APPCHECK_DEBUG_TOKEN` from `.env` and write it to `public/firebase.config.json` as `appCheckDebugToken` (defaulting to an empty string if omitted). At runtime, `ConfigService` will inspect `firebaseConfig.appCheckDebugToken`. If present, it uses this custom token; if empty (falsy), it falls back to the dynamic `isDevMode() || isLocalhost` boolean behavior. This ensures absolute type-safety without TypeScript casting while giving developers a seamless way to use a persistent local bypass token.

## Consequences & Trade-offs

- **Testing Convenience:** Developers can now test the local App Check sandbox seamlessly across Safari, Firefox, and incognito sessions using a single, permanently registered token.
- **Zero-Friction Fallback:** New developers do not need to configure any token in `.env` to start working; they immediately fall back to transient console-printed tokens.
- **Improved Type-Safety:** By ensuring the generator always outputs the `appCheckDebugToken` field (even if empty), TypeScript automatically infers the field type, eliminating the need for strict type escape hatches like `(firebaseConfig as any)`.
