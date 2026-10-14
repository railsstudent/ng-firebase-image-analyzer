# 01: Dynamic jsonrepair Loading and Parallel Preload in AiService

**What to build:** Refactor `AiService` to dynamically load `jsonrepair` on demand using a memoized import promise, pre-fetch it in parallel with model initialization in `generateContentStream` with zero floating promises, and pass the resolved repair function synchronously into `parseStreamJSONResponse`.

**Relates to:** [ADR-0029](../../../docs/adr/0029-deferred-jsonrepair-and-streaming-parallel-preload.md)

**Status:** ready

## Scope of Work

1. Update `src/app/core/firebase/ai.service.ts`:
   - Remove top-level `import { jsonrepair } from 'jsonrepair';`.
   - Add private memoized promise field `#jsonRepairPromise: Promise<(text: string) => string> | null = null;`.
   - Add private loader method `private loadJsonRepair(): Promise<(text: string) => string>`.
   - In `generateContentStream<T>()`:
     - If `params.schema` is defined, initiate `const jsonRepairPromise = this.loadJsonRepair();` concurrently with model setup.
     - Strictly await `const jsonrepair = await jsonRepairPromise;` before initiating `model.generateContentStream(request)`.
     - Pass `jsonrepair` to `parseStreamJSONResponse<T>(text, schema, jsonrepair)`.
   - Refactor `parseStreamJSONResponse<T>(text: string, schema?: TypedSchema | SchemaRequest, jsonrepairFn?: ((text: string) => string) | null): Partial<T>` to execute synchronously using `jsonrepairFn`.
2. Update unit tests in `src/app/core/firebase/ai.service.spec.ts`:
   - Verify `generateContentStream` repairs partial unclosed JSON chunks via `jsonrepair`.
   - Verify that `#jsonRepairPromise` memoization reuses the resolved promise on subsequent stream calls.
   - Verify rejection propagation if the dynamic import fails.
3. Run verification: `npm run lint`, `npm run test:once`, and `npm run cspell`.

## Acceptance Criteria

- [ ] `jsonrepair` is not statically imported in `src/app/core/firebase/ai.service.ts`.
- [ ] `generateContentStream` concurrently initiates and awaits `loadJsonRepair()` without floating promises (`void`).
- [ ] Intermediate partial JSON stream chunks parse correctly using the loaded repair function.
- [ ] `parseStreamJSONResponse` runs synchronously without awaiting promises inside the chunk loop.
- [ ] Unit tests verify dynamic loading, chunk repair, and promise memoization.
- [ ] `npm run lint`, `npm run test:once`, and `npm run cspell` pass with zero errors.
