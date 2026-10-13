# Ticket 06: Recipe Synthesis (Stage 2) Contracts, Schema, and Prompt

**Blocked by:** Ticket 04

**Status:** ready

## Context & Purpose

Define domain interfaces, prompt templates, and structured JSON schema for Stage 2 (Recipe Synthesis), generating the major ingredients and a formatted markdown recipe for a selected food item.

## Scope of Work

1. Update `src/app/core/culinary-guide/culinary-guide.interface.ts`:
   - `CulinaryRecipeResponse`: `{ ingredients: string[]; recipe: string }`
   - `StreamingCulinaryRecipeWithMetadata`: `{ ingredients: string[]; recipe: string; source: InferenceSource; thoughtSummary: string; tokenSummary?: TokenSummary; tokenModalityBreakdown?: TokenModalityBreakdown }`
   - `CulinaryRecipeDetail`: `{ ingredients: string[]; recipe: string; recipeHtml: string; tokenSummary?: TokenSummary; tokenModalityBreakdown?: TokenModalityBreakdown }` (where `recipeHtml` is formatted via `MarkdownFormatterService`)
2. Update `src/app/core/culinary-guide/culinary-guide.prompt.ts`:
   - `createRecipePrompt(country: string, city: string, foodName: string): string`
   - Explicit prompt instructions: Format recipe steps as clear numbered lists and ingredients as bulleted lists; strictly prohibit markdown tables.
3. Update `src/app/core/culinary-guide/culinary-guide.schema.ts`:
   - `RecipeDetailSchema` modeling `ingredients` as `Schema.array(Schema.string())` and `recipe` as `Schema.string()`.

## Acceptance Criteria

- [ ] `CulinaryRecipeResponse`, `StreamingCulinaryRecipeWithMetadata`, and `CulinaryRecipeDetail` interfaces are exported.
- [ ] `CulinaryRecipeDetail` includes `recipeHtml` field designated for HTML content generated via `MarkdownFormatterService`.
- [ ] `createRecipePrompt()` includes clear directives to output lists and strictly prohibits markdown tables.
- [ ] `RecipeDetailSchema` correctly constrains output to ingredients array and recipe markdown string.
- [ ] Checklist item for `StreamingCulinaryRecipeWithMetadata` is satisfied.
