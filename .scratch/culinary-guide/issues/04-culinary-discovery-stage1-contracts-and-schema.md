# Ticket 04: Culinary Discovery (Stage 1) Contracts and Schema

**Blocked by:** Ticket 01

**Status:** ready

## Context & Purpose

Define domain interfaces, prompt templates, and structured JSON schemas for Stage 1 (Culinary Discovery), constraining model output to exactly 6 iconic local foods and 1–2 honorable mentions.

## Scope of Work

1. Create `src/app/core/culinary-guide/culinary-guide.interface.ts`:
   - `CulinaryFoodItem`: `{ name: string; nativeName?: string; description: string; }`
   - `TopFoodsResponse`: `{ foods: CulinaryFoodItem[]; honorableMentions: string[]; }`
   - `StreamingCulinaryDiscoveryWithMetadata`: `{ foods: CulinaryFoodItem[]; honorableMentions: string[]; source: InferenceSource; thoughtSummary: string; tokenSummary?: TokenSummary; tokenModalityBreakdown?: TokenModalityBreakdown }`
2. Create `src/app/core/culinary-guide/culinary-guide.prompt.ts`:
   - `CULINARY_GUIDE_SYSTEM_INSTRUCTION`
   - `createTopFoodsPrompt(country: string, city: string): string`
3. Create `src/app/core/culinary-guide/culinary-guide.schema.ts`:
   - `TopFoodsSchema` using `Schema.object(...)` defining `foods` array (6 items) and `honorableMentions` array (1–2 items).

## Acceptance Criteria

- [ ] `CulinaryFoodItem`, `TopFoodsResponse`, and `StreamingCulinaryDiscoveryWithMetadata` interfaces are exported.
- [ ] `TopFoodsSchema` strictly models 6 food items and 1–2 honorable mentions.
- [ ] Prompt explicitly instructs the model to return native names, concise descriptions, and 1–2 honorable mention runner-up dishes.
- [ ] `StreamingCulinaryDiscoveryWithMetadata` includes fields for `foods`, `honorableMentions`, `source`, `thoughtSummary`, `tokenSummary`, and `tokenModalityBreakdown`.
