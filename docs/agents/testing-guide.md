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

4. **Isolated Mock Factories**:
   - Reusable or complex mocks belong in `src/testing/` (e.g. `src/testing/factories/`).
   - Never mutate shared mock instances across tests; instantiate fresh mock objects inside `beforeEach`.

## Test Execution Workflow

1. **Targeted Testing during Iterations**:
   - Use the `angular-cli` MCP server `run_target` tool with `target: "test"` to run tests against specific files:
     ```json
     {
       "coverage": true,
       "include": ["src/app/features/image-analysis/image-analysis.component.spec.ts"]
     }
     ```
2. **End-of-Task Verification**:
   - Run `npm run test:once` and `npm run lint` at task completion to ensure all tests pass and `lint-staged` pre-commit checks succeed.
