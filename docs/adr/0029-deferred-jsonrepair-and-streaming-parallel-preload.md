# 0029. Deferred jsonrepair Loading and Streaming Parallel Preload in AiService

Date: 2026-10-14
Status: Accepted
Relates to: [ADR-0026](0026-deferred-firebase-and-ai-initialization.md), [ADR-0028](0028-culinary-guide-two-stage-inference-and-lazy-markdown.md)

## Context

1. **Third-Party Parser Bundle Footprint**:
   - `AiService` statically imports `jsonrepair` via top-level ESM (`import { jsonrepair } from 'jsonrepair';`).
   - `jsonrepair` adds ~268 KB raw source code (~15–20 KB gzipped) to any bundle chunk that imports `AiService`.
   - While [ADR-0026](0026-deferred-firebase-and-ai-initialization.md) successfully eliminated Firebase SDK code from the root application entrypoint, any feature accessing AI capabilities (such as image analysis or culinary guide) eagerly loads `jsonrepair` upon feature module initialization, even during non-streaming operations or background shader pre-warming.

2. **Streaming Incomplete JSON Failure Mode**:
   - Structured AI streaming produces fragmented JSON chunks (e.g. `{"foods": [{"name": "Piz`).
   - Native `JSON.parse` is guaranteed to fail on early stream chunks, making `jsonrepair` essential for intermediate object reconstruction.
   - Naively importing `jsonrepair` dynamically inside the `catch` block of `JSON.parse` introduces network latency on the first chunk, pausing the streaming pipeline and stalling Time to First Token.

3. **Strict Async Control Flow and Promise Safety**:
   - Unhandled or floating promises (`void import(...)`) risk uncaught rejection errors outside Angular's error handling boundaries if network chunk retrieval encounters an error.
   - All dynamic ESM imports must be deterministically tracked, cached via memoized promises, and strictly awaited before stream processing begins.

## Decision

1. **Dynamic ESM Loading with Promise Memoization**:
   - Remove the static `import { jsonrepair } from 'jsonrepair'` from `src/app/core/firebase/ai.service.ts`.
   - Introduce a private memoized loader in `AiService`:

     ```typescript
     #jsonRepairPromise: Promise<(text: string) => string> | null = null;

     private loadJsonRepair(): Promise<(text: string) => string> {
       if (!this.#jsonRepairPromise) {
         this.#jsonRepairPromise = import('jsonrepair').then(
           (m) => m.jsonrepair ?? (m as unknown as { default: (text: string) => string }).default,
         );
       }
       return this.#jsonRepairPromise;
     }
     ```

2. **Parallel Non-Floating Pre-Load in `generateContentStream`**:
   - In `AiService.generateContentStream<T>()`, if `params.schema` is defined, initiate `this.loadJsonRepair()` concurrently with model initialization:

     ```typescript
     const jsonRepairPromise = params.schema ? this.loadJsonRepair() : Promise.resolve(null);
     const model = await this.getCachedModel(params);
     const request = this.constructRequest(params);
     await this.downloadDeviceModel(model);

     const jsonrepair = await jsonRepairPromise;
     ```

   - Because model retrieval and device handshake take ~100–300 ms, the ~20–50 ms dynamic import resolves concurrently with zero added latency.
   - Awaiting `jsonRepairPromise` ensures no floating promises exist; network errors reject deterministically before stream generation commences.

3. **Synchronous Execution in Stream Parser**:
   - Pass the resolved `jsonrepair` function reference into `parseStreamJSONResponse<T>(text, schema, jsonrepairFn)`.
   - Keep `parseStreamJSONResponse` fully synchronous to avoid promise overhead inside high-frequency token chunk iterations.

## Consequences

- **Positive**:
  - `jsonrepair` is completely removed from the initial feature chunks and loaded on-demand only when structured streaming is executed.
  - Zero perceptible latency impact on first token generation due to parallel pre-fetching during model handshake.
  - Subsequent streaming requests resolve instantly from memory via memoized `#jsonRepairPromise`.
  - Zero unhandled floating promises (`void`), preserving clean error boundary bubbling.
- **Negative**:
  - Adds minor internal orchestration in `AiService` to manage the loader promise and pass the repair function into parser calls.
