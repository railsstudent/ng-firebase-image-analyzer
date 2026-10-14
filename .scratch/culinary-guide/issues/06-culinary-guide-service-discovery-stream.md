# Ticket 06: CulinaryGuideService Discovery Stream (Stage 1)

**Blocked by:** Ticket 05

**Status:** done

## Context & Purpose

Implement the core service method for generating the Stage 1 Culinary Discovery stream via `AiService.generateContentStream`, extracting partial foods, honorable mentions, thought summaries, inference source, and token analytics.

## Scope of Work

1. Create `src/app/core/culinary-guide/culinary-guide.service.ts`:
   - `getTopFoodsStream(location: CulinaryLocation): AsyncGenerator<StreamingCulinaryDiscoveryWithMetadata>`
   - Delegate streaming and model caching to `AiService`.
   - Parse partial updates and accumulate `foods` and `honorableMentions`.
   - Extract thought summary and token summaries from responses.
   - **Stream Completion Validation**: Upon stream termination, strictly validate that `foods.length === 6` and `1 <= honorableMentions.length <= 2`.
   - **Automatic 1-Time Retry**: If validation fails on stream completion (e.g. truncated response or incomplete dish count), emit an explicit reset chunk (`{ foods: [], honorableMentions: [], inferenceSource: 'none', rawText: '' }`) and re-request the stream once.
   - **Terminal Error Propagation**: If the retry attempt also fails validation or throws, bubble a descriptive terminal `Error` to the caller.
2. Create unit tests `src/app/core/culinary-guide/culinary-guide.service.spec.ts`.

## Acceptance Criteria

- [x] `CulinaryGuideService.getTopFoodsStream()` yields `StreamingCulinaryDiscoveryWithMetadata` chunks.
- [x] Correctly processes partial stream chunks and maps token usage metadata via `AiService.processUsage()`.
- [x] Validates stream completion constraints (`foods.length === 6` and `1 <= honorableMentions.length <= 2`).
- [x] Automatically retries once on incomplete/invalid stream termination, emitting an empty reset chunk before re-requesting.
- [x] Throws a terminal `Error` if the retry attempt also fails validation or encounters an unrecoverable failure.
- [x] Unit tests verify stream emission, happy path completion, 1-time retry with reset chunk emission upon incomplete payload, and terminal error propagation with mock generators.
