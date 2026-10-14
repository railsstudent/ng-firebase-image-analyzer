# Ticket 06: CulinaryGuideService Discovery Stream (Stage 1)

**Blocked by:** Ticket 05

**Status:** ready

## Context & Purpose

Implement the core service method for generating the Stage 1 Culinary Discovery stream via `AiService.generateContentStream`, extracting partial foods, honorable mentions, thought summaries, inference source, and token analytics.

## Scope of Work

1. Create `src/app/core/culinary-guide/culinary-guide.service.ts`:
   - `getTopFoodsStream(country: string, city: string): AsyncGenerator<StreamingCulinaryDiscoveryWithMetadata>`
   - Delegate streaming and model caching to `AiService`.
   - Parse partial updates and accumulate `foods` and `honorableMentions`.
   - Extract thought summary and token summaries from responses.
2. Create unit tests `src/app/core/culinary-guide/culinary-guide.service.spec.ts`.

## Acceptance Criteria

- [ ] `CulinaryGuideService.getTopFoodsStream()` yields `StreamingCulinaryDiscoveryWithMetadata` chunks.
- [ ] Correctly processes partial stream chunks and maps token usage metadata via `AiService.processUsage()`.
- [ ] Unit tests verify stream emission, error propagation, and token summary extraction with mock generators.
