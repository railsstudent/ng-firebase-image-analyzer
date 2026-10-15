# Ticket 05: Culinary Discovery (Stage 1) Contracts and Schema

**Blocked by:** Ticket 01, Ticket 04

**Status:** done

## Context & Purpose

Define domain interfaces, prompt templates, and structured JSON schemas for Stage 1 (Culinary Discovery), constraining model output to exactly 6 iconic local foods and 1–2 honorable mentions. Reuses `InferenceMetadata` from `src/app/core/firebase`.

## Scope of Work

1. Create `src/app/core/culinary-guide/culinary-guide.const.ts`:
   - Single source of truth constants: `EXPECTED_FOOD_COUNT = 6`, `MIN_HONORABLE_MENTIONS = 1`, `MAX_HONORABLE_MENTIONS = 2`.
2. Create `src/app/core/culinary-guide/culinary-guide.interface.ts`:
   - `CulinaryFoodItem`: `{ name: string; nativeName?: string; description: string; }`
   - `TopFoodsResponse`: `{ foods: CulinaryFoodItem[]; honorableMentions: string[]; }`
   - `StreamingCulinaryDiscoveryWithMetadata extends TopFoodsResponse, InferenceMetadata`: `{}`
3. Create `src/app/core/culinary-guide/culinary-guide.prompt.ts`:
   - `CULINARY_GUIDE_SYSTEM_INSTRUCTION`
   - `createTopFoodsPrompt(location: CulinaryLocation): string` using constants.
4. Create `src/app/core/culinary-guide/culinary-guide.schema.ts`:
   - `TopFoodsSchema` using `Schema.object(...)` defining `foods` array (`EXPECTED_FOOD_COUNT` items) and `honorableMentions` array (`MIN_HONORABLE_MENTIONS`–`MAX_HONORABLE_MENTIONS` items).

## Acceptance Criteria

- [x] Domain constants `EXPECTED_FOOD_COUNT`, `MIN_HONORABLE_MENTIONS`, and `MAX_HONORABLE_MENTIONS` defined in `culinary-guide.const.ts`.
- [x] `CulinaryFoodItem`, `TopFoodsResponse`, and `StreamingCulinaryDiscoveryWithMetadata` interfaces are declared.
- [x] `StreamingCulinaryDiscoveryWithMetadata` extends both `TopFoodsResponse` and `InferenceMetadata`.
- [x] `TopFoodsSchema` strictly models `EXPECTED_FOOD_COUNT` food items and `MIN_HONORABLE_MENTIONS`–`MAX_HONORABLE_MENTIONS` honorable mentions.
- [x] Prompt explicitly instructs the model to return native names, concise descriptions, and honorable mention runner-up dishes using constants.
