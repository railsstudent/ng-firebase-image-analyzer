# Ticket 05: Culinary Discovery (Stage 1) Contracts and Schema

**Blocked by:** Ticket 01, Ticket 04

**Status:** done

## Context & Purpose

Define domain interfaces, prompt templates, and structured JSON schemas for Stage 1 (Culinary Discovery), constraining model output to exactly 6 iconic local foods and 1–2 honorable mentions. Reuses `InferenceMetadata` from `src/app/core/firebase`.

## Scope of Work

1. Create `src/app/core/culinary-guide/culinary-guide.interface.ts`:
   - `CulinaryFoodItem`: `{ name: string; nativeName?: string; description: string; }`
   - `TopFoodsResponse`: `{ foods: CulinaryFoodItem[]; honorableMentions: string[]; }`
   - `StreamingCulinaryDiscoveryWithMetadata extends TopFoodsResponse, InferenceMetadata`: `{}`
2. Create `src/app/core/culinary-guide/culinary-guide.prompt.ts`:
   - `CULINARY_GUIDE_SYSTEM_INSTRUCTION`
   - `createTopFoodsPrompt(country: string, city: string): string`
3. Create `src/app/core/culinary-guide/culinary-guide.schema.ts`:
   - `TopFoodsSchema` using `Schema.object(...)` defining `foods` array (6 items) and `honorableMentions` array (1–2 items).

## Acceptance Criteria

- [x] `CulinaryFoodItem`, `TopFoodsResponse`, and `StreamingCulinaryDiscoveryWithMetadata` interfaces are declared.
- [x] `StreamingCulinaryDiscoveryWithMetadata` extends both `TopFoodsResponse` and `InferenceMetadata`.
- [x] `TopFoodsSchema` strictly models 6 food items and 1–2 honorable mentions.
- [x] Prompt explicitly instructs the model to return native names, concise descriptions, and 1–2 honorable mention runner-up dishes.
