# 31: Buffer AI Stream Chunks Before JSON Repair in AiService

**What to build:** Buffer incoming raw stream chunks in `AiService.generateContentStream()` in batches of `STREAM_CHUNK_BUFFER_SIZE = 5` before attempting `parseStreamJSONResponse` (`JSON.parse` / `jsonrepair`) and yielding intermediate `PartialResponse<T>` emissions. When the stream ends with fewer than 5 un-yielded chunks in the buffer, skip the redundant intermediate yield and let `await result.response` emit the authoritative final `PartialResponse<T>` with `inferenceMetadata`. Remove the leftover debug `console.log('chunk', chunk)` from `CulinaryGuideComponent.loadRecipe()`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

## Acceptance Criteria & Implementation Checklist

### 1. Stream Chunk Buffer Constant (`src/app/core/firebase/`)

- [ ] Create `src/app/core/firebase/ai.const.ts` defining `STREAM_CHUNK_BUFFER_SIZE = 5`:

  ```ts
  /**
   * Number of raw stream chunks to accumulate in `AiService.generateContentStream()`
   * before attempting `jsonrepair` / `JSON.parse` and yielding an intermediate `PartialResponse<T>`.
   */
  export const STREAM_CHUNK_BUFFER_SIZE = 5;
  ```

- [ ] Export `STREAM_CHUNK_BUFFER_SIZE` from `src/app/core/firebase/index.ts`:

  ```ts
  export { STREAM_CHUNK_BUFFER_SIZE } from './ai.const';
  ```

### 2. Buffer Chunks in `AiService.generateContentStream()` (`src/app/core/firebase/ai.service.ts`)

- [ ] Update `generateContentStream<T>()` in `src/app/core/firebase/ai.service.ts` to accumulate `chunk.text()` and `chunk.usageMetadata` on every chunk, increment `bufferedChunkCount`, and only invoke `parseStreamJSONResponse` when `bufferedChunkCount >= STREAM_CHUNK_BUFFER_SIZE`. Reset `bufferedChunkCount = 0` only after `parseStreamJSONResponse` succeeds (so a failed repair on chunk 5 retries immediately on chunk 6), and let `await result.response` flush any trailing `< 5` buffered chunks:

  ```ts
  let accumulatedText = '';
  let latestUsage: UsageMetadata | undefined;
  let bufferedChunkCount = 0;

  for await (const chunk of result.stream) {
    if (chunk.usageMetadata) {
      latestUsage = chunk.usageMetadata;
    }

    const chunkText = chunk.text();
    accumulatedText = accumulatedText + chunkText;
    bufferedChunkCount += 1;

    if (bufferedChunkCount >= STREAM_CHUNK_BUFFER_SIZE) {
      try {
        const parsed = this.parseStreamJSONResponse<T>(accumulatedText, params.schema);
        bufferedChunkCount = 0;
        yield {
          partialData: parsed,
        };
      } catch (e) {
        this.#logger.warn(`Failed to parse stream JSON response for ${featureName}:`, e);
      }
    }
  }
  ```

### 3. Remove Debug Logging in `CulinaryGuideComponent` (`src/app/features/culinary-guide/culinary-guide.component.ts`)

- [ ] Remove `console.log('chunk', chunk);` inside `loadRecipe()` in `src/app/features/culinary-guide/culinary-guide.component.ts`:

  ```ts
  for await (const chunk of this.#culinaryService.streamDishRecipe(
    dish.dishName,
    cuisineType,
    imageFile,
  )) {
    finalChunk = chunk;
    if (chunk.partialData) {
  ```

### 4. Domain Glossary & ADR-0029 Synchronization (`GLOSSARY.md`, `docs/adr/0029-*.md`)

- [ ] Add **Stream Chunk Buffering** to `GLOSSARY.md` (defining the accumulation of `STREAM_CHUNK_BUFFER_SIZE = 5` raw stream chunks in `AiService.generateContentStream` before running `jsonrepair` and yielding an intermediate `PartialResponse<T>`, with tail flushing delegated to `await result.response`).
- [ ] Update `docs/adr/0029-internal-stream-aggregation-for-structured-generative-output.md` to record the 5-chunk buffering policy, retry-on-next-chunk behavior when `jsonrepair` throws, and tail flush via `await result.response`.

### 5. Unit Tests (`src/app/core/firebase/ai.service.spec.ts`)

- [ ] Update existing streaming tests in `src/app/core/firebase/ai.service.spec.ts` and add dedicated test cases verifying:
  - A stream of `< 5` chunks (e.g., 2 chunks) yields `0` intermediate chunks and `1` final chunk from `await result.response` with `inferenceMetadata`.
  - A stream of `5` chunks yields `1` intermediate chunk on the 5th chunk plus `1` final chunk from `await result.response`.
  - A stream of `12` chunks yields `2` intermediate chunks (at chunks 5 and 10) and flushes the remaining 2 chunks via the single final chunk from `await result.response`.
  - If chunk 5 fails `parseStreamJSONResponse` (`jsonrepair` throws), `bufferedChunkCount` is not reset and chunk 6 immediately retries and yields upon valid repair.
- [ ] Run targeted unit tests for `ai.service.spec.ts` and `culinary-guide.component.spec.ts` and verify all test cases pass with zero errors.
