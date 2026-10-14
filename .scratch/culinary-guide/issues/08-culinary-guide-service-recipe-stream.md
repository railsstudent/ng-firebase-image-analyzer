# Ticket 08: CulinaryGuideService Recipe Stream (Stage 2)

**Blocked by:** Ticket 07

**Status:** done

## Context & Purpose

Implement the core service method for generating the Stage 2 Recipe Synthesis stream via `AiService.generateContentStream`, yielding ingredients, streamed markdown recipe chunks, inference source, and per-dish token usage metrics.

## Scope of Work

1. Update `src/app/core/culinary-guide/culinary-guide.service.ts`:
   - `getRecipeStream(target: CulinaryRecipeTarget): AsyncGenerator<StreamingCulinaryRecipeWithMetadata>`
   - Use `createRecipePrompt()` and `CulinaryRecipeSchema`.
   - Parse partial recipe text and ingredients array from streaming chunks.
   - Extract thought summary and token summaries from final responses.
   - **Stream Completion Validation**: Upon stream termination, strictly validate that `ingredients.length >= 1` and `recipe.trim().length > 0`.
   - **Automatic 1-Time Retry**: If validation fails on stream completion (e.g. truncated response or empty recipe text), emit an explicit reset chunk (`{ ingredients: [], recipe: '', inferenceSource: 'none', rawText: '' }`) and re-request the stream once.
   - **Terminal Error Propagation**: If the retry attempt also fails validation or throws, bubble a descriptive terminal `Error` to the caller.
2. Update unit tests in `src/app/core/culinary-guide/culinary-guide.service.spec.ts`.

## Acceptance Criteria

- [x] `CulinaryGuideService.getRecipeStream()` yields `StreamingCulinaryRecipeWithMetadata` chunks.
- [x] Correctly processes partial stream chunks and maps token usage metadata via `AiService.processUsage()`.
- [x] Validates stream completion constraints (`ingredients.length >= 1` and non-empty `recipe`).
- [x] Automatically retries once on incomplete/invalid stream termination, emitting an empty reset chunk before re-requesting.
- [x] Throws a terminal `Error` if the retry attempt also fails validation or encounters an unrecoverable failure.
- [x] Unit tests verify stream emission, happy path completion, 1-time retry with reset chunk emission upon incomplete payload, and terminal error propagation with mock generators.
