# Ticket 07: Recipe Synthesis (Stage 2) Contracts, Schema, and Prompt

**Blocked by:** Ticket 04, Ticket 05

**Status:** done

## Context & Purpose

Define domain interfaces, prompt templates, and structured JSON schema for Stage 2 (Recipe Synthesis), generating the major ingredients and a formatted markdown recipe for a selected food item. Reuses `InferenceMetadata` from `src/app/core/firebase`.

## Scope of Work

1. Update `src/app/core/culinary-guide/culinary-guide.interface.ts`:
   - `CulinaryRecipeResponse`: `{ ingredients: string[]; recipe: string }`
   - `StreamingCulinaryRecipeWithMetadata extends CulinaryRecipeResponse, InferenceMetadata`: `{}`
2. Update `src/app/core/culinary-guide/culinary-guide.prompt.ts`:
   - Declare `RECIPE_PROMPT_INSTRUCTION` constant containing formatting instructions (format recipe steps as clear numbered lists, ingredients as bulleted lists; strictly prohibit markdown tables).
   - `createRecipePrompt(country: string, city: string, foodName: string): string` utilizing `RECIPE_PROMPT_INSTRUCTION`.
3. Update `src/app/core/culinary-guide/culinary-guide.schema.ts`:
   - `RecipeDetailSchema` modeling `ingredients` as `Schema.array(Schema.string())` and `recipe` as `Schema.string()`.

## Acceptance Criteria

- [x] `CulinaryRecipeResponse` and `StreamingCulinaryRecipeWithMetadata` interfaces are declared.
- [x] `StreamingCulinaryRecipeWithMetadata` extends both `CulinaryRecipeResponse` and `InferenceMetadata`.
- [x] Constant `RECIPE_PROMPT_INSTRUCTION` declared and utilized in `createRecipePrompt()`.
- [x] `createRecipePrompt()` includes clear directives to output lists and strictly prohibits markdown tables.
- [x] `RecipeDetailSchema` correctly constrains output to ingredients array and recipe markdown string.
