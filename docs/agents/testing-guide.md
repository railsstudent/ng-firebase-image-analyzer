# Testing & Mocking Guide

This document defines testing conventions, DI mocking contracts, and verification workflows.

## Mocking Strategy & DI Providers

1. **TestBed Boundary Mocking**:
   - Always mock external dependencies and services at the Angular `TestBed` DI boundary.
   - Type mocks with `Partial<ServiceName>` and verify them with `satisfies Partial<ServiceName>`:

     ```typescript
     const mockImageAnalysisService = {
       isAnalyzing: signal(false),
       analysisResult: signal(null),
       analyzeImage: vi.fn(),
     } satisfies Partial<ImageAnalysisService>;

     await TestBed.configureTestingModule({
       providers: [{ provide: ImageAnalysisService, useValue: mockImageAnalysisService }],
     }).compileComponents();
     ```

2. **Preserve Class Encapsulation**:
   - Never widen `private` or `#` member visibility on production classes to facilitate testing.
   - Test components and services strictly through their public API surface (signals, inputs, outputs, public methods, and DOM behaviors).

3. **Testing `injectAsync` & Background Tasks**:
   - Always await async methods (e.g. `await component.preWarm()`) or use `await vi.waitFor(...)` within tests so asynchronous injector lookups and dynamic module loads settle before the `TestBed` fixture is torn down.
   - Prevents `NG0205: Injector has already been destroyed` runtime errors in test suites.

4. **Testing Zoneless `@defer` Hydration**:
   - In Zoneless Angular (`provideZonelessChangeDetection()`), hydrate `@defer (when condition)` blocks by triggering the condition (setting input signal or dispatching DOM event like `button.click()`), followed by change detection and fixture stability:

     ```typescript
     // 1. Trigger the deferral condition
     tabButtons[1].click();
     // 2. Run change detection and wait for stability
     fixture.detectChanges();
     await fixture.whenStable();
     // 3. Assert on hydrated component presence
     expect(fixture.debugElement.query(By.directive(HydratedComponent))).toBeTruthy();
     ```

   - Never use deprecated APIs like `deferBlock.render()`, `fakeAsync`, or `tick()`.

5. **Shared Test Helpers & Mock Factories (`src/testing/`)**:
   - Reusable mock factories, custom harness helpers, and DOM stabilization helpers belong in `src/testing/` (e.g., `src/testing/factories/`, `src/testing/helpers/`).
   - When writing test helpers:
     - Keep helpers pure, synchronous/async explicit, and accepting generic `ComponentFixture<T>`.
     - Never mutate shared mock instances across tests; instantiate fresh mock objects per test run inside `beforeEach`.

6. **Exact Assertions for Diagnostics & Thrown Errors**:
   - When asserting console logs, telemetry events, or error messages containing dynamic arguments (e.g. shapes, dimensions, status codes, URLs), assert the full interpolated pattern or regex (e.g., `expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('pre-compiled successfully for shape 128x128!'))`).
   - Ban overly broad substring matches (e.g., `expect.stringContaining('pre-compiled')`) that remain green if dynamic arguments are accidentally stripped during refactoring.

## Test Execution Workflow

1. **Targeted Testing during Iterations**:
   - Use the `angular-cli` MCP server `run_target` tool with `target: "test"` to run tests against specific files:

     ```json
     {
       "coverage": true,
       "include": ["src/app/features/image-analysis/image-analysis.component.spec.ts"]
     }
     ```

   - When running from the terminal, always use `npx ng test --include="<path>/**/*.spec.ts" --no-watch` rather than bare `npx vitest run <file>` to ensure `@/` tsconfig path aliases are resolved through Angular CLI.

2. **End-of-Task Verification**:
   - **Intermediate Domain Tickets** (work-in-progress core packages prior to UI/route wiring):
     - Run `ng lint && npm run check:cycles && npm run test:once`.
     - _Knip Caveat_: `knip --production` analyzes reachable production code from `src/main.ts`. For intermediate core domain tickets (services, schemas, contracts) not yet imported by UI components or routes, `knip --production` will report false positives for unused files/exports. Do not create fake imports or pollute production code to satisfy Knip during intermediate tickets.
   - **Full Integration Tickets** (once wired into UI components, routes, or production entrypoints):
     - Run `npm run lint` (`ng lint && npm run check:cycles && knip --production && npm run cspell`) and `npm run test:once`. All checks including Knip production analysis must pass with zero violations.
