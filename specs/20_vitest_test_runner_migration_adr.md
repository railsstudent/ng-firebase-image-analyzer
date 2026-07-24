# 20. Migrating to Vitest and Refactoring Unit Tests

We decided to migrate the test runner from Karma/Jasmine to Vitest using the stable `@angular/build:unit-test` builder introduced in Angular 22. Along with this migration, we resolved structural failures in existing component and directive spec files to align with modern Angular signal input and dependency injection requirements.

## Context

Historically, Angular applications used Karma and Jasmine as the default test runner and assertion framework. While reliable, Karma is now deprecated, slower, and requires spawning full web browsers (such as Chrome) to run simple headless unit tests.

With Angular 22, Vitest is supported natively as a high-performance, headless test runner running in a Node.js environment utilizing JSDOM. However, during the application dependency updates, the Jasmine/Karma dependencies and configs were left in place, creating an inconsistent configuration. Furthermore, several existing unit tests (`spec.ts` files) were failing due to incorrect instantiation of Signal Inputs, missing Router providers, and lack of dependency mocking under Angular's modern Zoneless/Signals architecture.

## Decision

We will perform the following actions:

1. **Transition to `@angular/build:unit-test`:** Replace the legacy Karma builder (`@angular/build:karma`) in `angular.json` with the modern Vitest unit test builder.
2. **Update Dependencies:** Uninstall Jasmine and Karma devDependencies and install `vitest` and `jsdom`.
3. **Configure TypeScript:** Modify `tsconfig.spec.json` to include types for `"vitest/globals"` and remove `"jasmine"`.
4. **Fix Spec Failures:**
   - **Directives with Signal Inputs/DI:** Refactor `download-enhanced.spec.ts` to instantiate the directive via a `TestHostComponent` compiled by `TestBed`.
   - **Required Signal Inputs:** Update `enhanced-canvas.spec.ts` to pre-initialize the required `cropImage` input using `fixture.componentRef.setInput()` before executing initial change detection.
   - **Router-outlet Dependencies:** Add `provideRouter([])` to `app.spec.ts` to satisfy `RouterOutlet` dependencies.
   - **Deep Injection Mocking:** Fully mock `ImageAnalysisService` in `image-analysis.spec.ts` to decouple UI testing from the Firebase SDK and `FirebaseAI` token.
   - **Jasmine API Porting:** Refactor the Jasmine `spyOn` and `createSpyObj` assertions in `config.service.spec.ts` to use Vitest's `vi.spyOn` and `vi.fn()` utilities.

## Consequences & Trade-offs

- **Testing Speed and Developer Velocity:** Moving to Vitest provides massive performance gains and instant-reload watch times compared to Karma/Chrome launcher.
- **Improved Alignment with Angular 22 Defaults:** This aligns our testing framework with the officially supported standard for new Angular 22 projects.
- **Robustness of Unit Tests:** Decoupling tests from deep Firebase DI trees and correctly configuring Signal Inputs guarantees stable, predictable testing without false positives.
- **Headless Node-based Environment:** Since Vitest runs in Node.js with JSDOM instead of a real browser, specialized browser-only features must be carefully mocked where necessary.
