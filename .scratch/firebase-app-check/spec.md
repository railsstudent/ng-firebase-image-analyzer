# Specification: Persistent App Check Sandbox

## Problem Statement

When developers test the application locally across multiple browser sessions (such as Chrome's Incognito mode, Safari, or Firefox), the default Firebase App Check Sandbox generates a randomized, transient debug token on each refresh. This forces developers to repeatedly copy new debug tokens from the console log and register them in the Firebase Console under the App Check tab.

This friction slows down local development and hinders cross-browser testing. Directly checking a static debug token into source control is a major security risk, and fetching it from Remote Config introduces a circular dependency (as App Check must initialize before Remote Config can be read).

---

## Solution

We will implement an environment-driven **Persistent App Check Sandbox** supporting two distinct operational states:

1. **Locked Mode (Persistent):** Allow developers to define a static, pre-registered App Check debug token in their local, git-ignored `.env` file (`FIREBASE_APPCHECK_DEBUG_TOKEN`). At build-time, this token is compiled into `public/firebase.config.json` and loaded during bootstrap, enabling immediate, registration-free testing across any browser.
2. **Transient Mode (Fallback):** If no custom token is configured in `.env`, the system gracefully falls back to the default dynamic behavior (`isDevMode() || isLocalhost`), ensuring frictionless, out-of-the-box onboarding for new contributors.

---

## User Stories

1. **As a developer testing across browsers,** I want to define a static App Check debug token locally, so that I don't have to register new debug tokens every time I open a new incognito window or alternate browser.
2. **As a security-conscious engineer,** I want my local debug tokens compiled into a git-ignored configuration JSON, so that my development credentials are never exposed or checked into the public repository.
3. **As a new contributor,** I want the local environment to run successfully without requiring me to configure an App Check debug token, so that I can set up the project with zero friction.
4. **As an integration lead,** I want unit tests to verify both Locked and Transient initialization paths, so that future upgrades do not break security bypasses.

---

## High-Level Implementation Decisions

* **Config Compilation:** Extend the build-time configuration compilation pipeline to map `process.env.FIREBASE_APPCHECK_DEBUG_TOKEN` into `public/firebase.config.json` under `appCheckDebugToken`.
* **Stateful Initialization:** Update the startup `ConfigService` to read the token. If defined, bind it to `globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN` to lock the Sandbox. If absent, fall back to `isDevMode() || isLocalhost`.
* **Test Isolation:** Ensure the unit test suite mocks the imported configuration, asserting that the global environment is correctly locked or set to transient fallback modes without modifying hardware.

---

## Out of Scope

* Publishing or storing App Check bypass credentials in cloud stores (like Firebase Remote Config).
* Automating the registration of debug tokens on the Firebase developer console.
* Permitting sandbox execution pathways in production cloud environments.
