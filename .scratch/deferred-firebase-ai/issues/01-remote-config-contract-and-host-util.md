# 01: Remote Config Contract and Host Utility

**What to build:** Define the canonical `AppRemoteConfig` typed snapshot interface in `src/app/core/firebase/app-remote-config.interface.ts` and implement an isolated, testable `isLocalhost` domain detection utility in `src/app/core/firebase/host.util.ts` with unit tests in `host.util.spec.ts`.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Create `src/app/core/firebase/app-remote-config.interface.ts` exporting `AppRemoteConfig` matching properties: `useLimitedUseAppCheckTokens: boolean`, `vertexAILocation: string`, `geminiModelName: string`, `thinkingLevel: ThinkingLevel`.
- [x] Create `src/app/core/firebase/host.util.ts` exporting `isLocalhost(win: Window | null): boolean` covering localhost, IPv4, IPv6 loopback addresses.
- [x] Create `src/app/core/firebase/host.util.spec.ts` testing `isLocalhost` with localhost, 127.0.0.1, ::1, [::1], null window, and remote production domains.
- [x] Verify test suite passes with `npm run test:once` and lint checks pass with `npm run lint`.
