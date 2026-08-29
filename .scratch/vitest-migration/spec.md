# Specification: High-Performance Headless Testing with Vitest

## Problem Statement

The legacy Angular testing framework (Karma + Jasmine) is slow, resource-heavy, and deprecated in the modern web development ecosystem. It requires spawning full, headful Chrome browser binaries even for simple headless unit tests, increasing CI/CD pipeline costs and slowing down local test-driven development (TDD).

Furthermore, following the upgrade to Angular 22, several unit tests are failing due to changes in Zoneless change detection, required Signal Inputs, and direct constructor dependency injections. The testing framework must be migrated to a modern, high-performance, headless runner to speed up the developer feedback loop and stabilize test suites.

---

## Solution

We will migrate the application's entire unit testing infrastructure from Karma/Jasmine to **Vitest** with a **JSDOM** browser emulation environment, integrated natively via Angular's `@angular/build:unit-test` builder.

To ensure test stability, all existing spec files will be systematically refactored to comply with modern Angular 22 best practices (utilizing test host components for directives, satisfy operators for type safety, and proper signal input pre-initializations via `setInput()`). All service-layer interactions (such as image analysis and model caching) will be strictly mocked, allowing test execution to run 100% offline, isolated, and with zero network dependency.

---

## User Stories

1. **As an application developer,** I want an ultra-fast local unit test runner, so that my local red-green-refactor loop remains instantaneous.
2. **As a CI/CD engineer,** I want unit tests to execute headlessly in a clean Node.js runtime without spawning browser binaries, so that deployment pipelines are cheaper, faster, and immune to browser launch crashes.
3. **As a test engineer verifying components with Signal Inputs,** I want to pre-initialize inputs before change detection runs, so that the compiler does not throw required-input errors.
4. **As a developer testing custom directives (such as the download directive),** I want them compiled inside a test host component, so that event bindings and DI contexts are verified under proper, realistic runtime shapes.
5. **As a QA lead,** I want the standard `ng test` command to trigger our high-performance Vitest runner, so that the testing command interface remains unchanged.

---

## High-Level Implementation Decisions

* **DOM Emulation via JSDOM:** Use `jsdom` to emulate browser layouts in a lightweight Node environment, allowing TestBed to interact with compiled templates and trigger click handlers.
* **Vitest Global Primitives:** Configure `tsconfig.spec.json` with `"vitest/globals"` to make common primitives (`describe`, `it`, `expect`, `beforeEach`) globally available, preventing massive manual imports.
* **Isolated Service Mocking:** Enforce mock providers for all data services. All unit tests must run entirely isolated from Firebase networks and API endpoints.
* **Typing Checks (`satisfies Partial<T>`):** All component-side service mocks must use the `satisfies` operator to prevent test-to-production API drift.

---

## Out of Scope

* Full end-to-end (E2E) testing utilizing automated browser platforms (Cypress / Playwright).
* Visual pixel-regression testing or automated snapshotting of rendered canvas files.
* Running unit tests inside real, headful mobile or desktop browsers.
