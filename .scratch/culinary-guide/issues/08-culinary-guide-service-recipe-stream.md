# Ticket 08: CulinaryGuideService Recipe Stream (Stage 2)

**Blocked by:** Ticket 07

**Status:** ready

## Context & Purpose

Implement the core service method for generating the Stage 2 Recipe Synthesis stream via `AiService.generateContentStream`, yielding ingredients, streamed markdown recipe chunks, inference source, and per-dish token usage metrics.

## Scope of Work

1. Update `src/app/core/culinary-guide/culinary-guide.service.ts`:
   - `getRecipeStream(country: string, city: string, foodName: string): AsyncGenerator<StreamingCulinaryRecipeWithMetadata>`
   - Use `createRecipePrompt()` and `RecipeDetailSchema`.
   - Parse partial recipe text and ingredients array from streaming chunks.
   - Extract thought summary and token summaries from final responses.
2. Update unit tests in `src/app/core/culinary-guide/culinary-guide.service.spec.ts`.

## Acceptance Criteria

- [ ] `CulinaryGuideService.getRecipeStream()` yields `StreamingCulinaryRecipeWithMetadata` chunks.
- [ ] Correctly processes partial stream chunks and maps token usage metadata via `AiService.processUsage()`.
- [ ] Unit tests verify stream emission, error propagation, and token summary extraction with mock generators.
