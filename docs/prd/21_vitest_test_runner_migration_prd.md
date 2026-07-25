# 21. Vitest Test Runner Migration & Unit Test Refactoring

## Problem Statement

As a developer maintaining the **NgFirebaseImageAnalyzer** application, the current unit testing framework is slow, outdated, and prone to breaking during dependency updates. The application currently relies on Karma and Jasmine as its test runner and assertion framework. Karma is now deprecated in the modern web ecosystem, requires launching a full Chrome browser instance (even for simple, headless unit tests), and has slow reload times which severely impacts the developer feedback loop.

Furthermore, following the upgrade to Angular 22, several existing component and directive unit tests are failing. These failures stem from structural changes in how modern Angular handles Zoneless execution, Signal Inputs, Dependency Injection (DI) contexts, and router outlet compilers. To ensure stability and future-proof the codebase, the testing infrastructure must be migrated to a modern, high-performance runner, and the broken spec files must be systematically refactored to align with Angular 22 best practices.

## Solution

Migrate the application's entire unit testing infrastructure from Karma/Jasmine to **Vitest** utilizing a **JSDOM** DOM emulation environment. We will configure this using Angular's native `@angular/build:unit-test` builder.

Additionally, we will refactor the existing failing spec files so that they execute flawlessly in the new Vitest environment. This includes rewriting direct instantiations of directives to use Test Host Components, pre-initializing required Signal Inputs using Angular 16+ `setInput()` lifecycle hooks, satisfying routing dependencies with `provideRouter([])`, and mocking the underlying Hybrid Inference and On-Device Pre-Warming service layers so that tests are 100% isolated, reliable, and run entirely offline.

## User Stories

1. As an application developer, I want a modern, ultra-fast unit testing runner, so that my local test-driven development (TDD) cycle remains instantaneous.
2. As a Continuous Integration (CI) engineer, I want unit tests to execute headlessly in a clean Node.js environment without spawning or managing full browser binaries, so that our deployment pipelines are faster, cheaper, and less prone to environment-specific browser launch crashes.
3. As a developer testing the **Visual Enhancer** or other image-adjusting components, I want to pre-initialize components with required Signal Inputs dynamically, so that the initial change detection cycles do not crash with `Input is required but no value is available yet` errors.
4. As a developer testing custom directives containing Signal Inputs and Dependency Injection (such as the download-enhanced directive), I want to test them deterministically using a Test Host Component, so that their DOM-binding and event-handling attributes are verified under proper injection contexts.
5. As an integration engineer, I want deep dependency trees (such as the **Hybrid Inference** orchestration layer, the **App Check Sandbox** tokens, and the Gemini model cache services) to be easily mockable, so that our core component tests are fully decoupled from live Firebase SDK network calls and Vertex AI API rate limits.
6. As a frontend developer, I want components containing `<router-outlet>` or router directives (such as the root `App` component) to automatically have their router contexts satisfied during tests, so that compiling the test suite does not throw missing provider errors.
7. As an engineer migrating from Karma/Jasmine, I want to retain standard test suite syntaxes (like `describe`, `it`, and `expect`) globally without adding manual imports to all 13 existing spec files, so that we minimize code churn and maintain a clean, readable test structure.
8. As a QA lead, I want the standard Angular test command (`ng test`) to trigger our high-performance test suite seamlessly, so that our team does not need to learn or configure custom scripts.
9. As a developer verifying **On-Device Pre-Warming**, I want to mock asynchronous pre-warm execution trees in my component tests, so that components render their post-warming UI states instantly and reliably.

## Implementation Decisions

### Testing Seams & Interfaces

* **Test-Runner Seam (The Build Target):** The primary integration seam for our test runner is the **Angular build target (`@angular/build:unit-test`)** specified in `angular.json`. This abstracts the compilation, watcher, and environment injection layer into a single standard target. The execution interface remains the standard `ng test` command.
* **Component & Directive Seam (Angular `TestBed`):** The primary seam for testing our component and directive classes is Angular's **`TestBed` API**. We will use this seam to configure testing modules, mock service-layer dependencies, inject custom providers, and programmatically initialize required signal inputs before change detection runs.

### Technical & Architectural Decisions

* **JSDOM DOM Emulation:** We will use `jsdom` to mock the browser DOM environment inside Vitest, allowing Angular's testing framework to interact with templates, fire host events, and inspect the rendered HTML in a lightweight Node environment.
* **Vitest Global APIs:** We will configure `tsconfig.spec.json` with `"vitest/globals"` to enable globally available testing primitives (`describe`, `it`, `expect`, `beforeEach`, `vi`), preventing the need to explicitly import them in every single file.
* **Strict Service-Layer Mocking:** All spec files testing components that consume deep network-reliant services (such as `ImageAnalysisService`) must register lightweight mocked providers in `TestBed`. This ensures that unit tests never make live calls to Firebase or Vertex AI, which would break in sandboxed or offline environments.
* **Host-Component Pattern for Directives:** Directives with signal inputs or constructor injections must be tested by compiling a dummy host component that consumes the directive, rather than instantiating the directive directly.
* **Global WebGPU Mocking (Alternative A):** In `ai.service.spec.ts`, dynamically define properties on `globalThis.navigator.gpu` to emulate a fully WebGPU-compliant client. This allows us to unit-test shader compilation branches and state-warming behaviors without actual hardware constraints.
* **Compile-Time Contract Guarding (Option A):** All unit test mocks of core services (such as `ImageAnalysisService`) must be strongly typed using TypeScript's `satisfies Partial<T>` operator. This ensures that any change or renaming of the real service methods instantly triggers a compilation failure, preventing silent API drift.
* **Parameterized Utility Testing (Option A):** Write extensive, parameterized test matrices using `test.each` to thoroughly cover `sanitize-adjustment.ts` calculations. This targets the core clamp and crop algorithms of our **Visual Enhancer** with sub-millisecond mathematical validations.

## Testing Decisions

* **Core Testing Philosophy:** A good test only asserts the external behavior of a component (e.g. user-visible DOM changes, emitted events) or its integration boundaries, rather than testing its internal private states or private variables.
* **Modules & Components to Test:**
  * The root `App` component (testing router outlet and structure).
  * The `DownloadEnhancedDirective` (testing click-to-download binding).
  * The `EnhancedCanvas` component (testing structural aspect ratio calculations).
  * The `ImageAnalysis` feature component (testing reactive UI states during upload and warming states).
* **Prior Art:** We will model our Vitest configuration and mocking techniques on Angular 22's official unit-testing blueprints and standard `TestBed` mock-provider patterns.

## Out of Scope

* **End-to-End (E2E) Testing:** Full visual and functional E2E tests utilizing Cypress or Playwright are completely out of scope for this unit testing migration.
* **Visual Regression Testing:** Snapshot-based pixel-by-pixel regression testing of canvas elements and images is not covered by this specification.
* **Real Browser Testing:** Running unit tests inside real, headful desktop or mobile browsers is not supported by this headless Vitest/JSDOM configuration.

## Further Notes

* **Triage Labeling:** Once this document is created in the repository, apply the `ready-for-agent` triage label in the issue tracker (or local tracking file) so that developer agents can instantly pick up and execute the full implementation.
