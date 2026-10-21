# 29: Refine Recipe Synthesis System Instruction, Prompt, and Schema for Concise Output

**What to build:**
Define `MAX_RECIPE_INGREDIENTS = 10`, `MIN_RECIPE_STEPS = 5`, and `MAX_RECIPE_STEPS = 7` in `src/app/core/culinary-guide/culinary-guide.const.ts`, rename `RECIPE_PROMPT_INSTRUCTION` to `RECIPE_SYSTEM_INSTRUCTION` in `src/app/core/culinary-guide/culinary-guide.prompt.ts`, and refine Stage 2 Recipe Synthesis system instructions, user prompt (`createRecipePrompt`), and JSON schema (`CulinaryRecipeSchema`) so generated ingredients (capped at `MAX_RECIPE_INGREDIENTS`) and cooking steps (`MIN_RECIPE_STEPS` to `MAX_RECIPE_STEPS` concise steps) exclude repeated ingredient lists and markdown headings, fitting cleanly inside the Recipe Accordion so `<app-token-analytics>` remains visible in the viewport. Update `CulinaryGuideService` and unit test suites (`culinary-guide.prompt.spec.ts` and `culinary-guide.service.spec.ts`).

**Blocked by:** 07: Recipe Synthesis (Stage 2) Contracts, Schema, and Prompt, 08: CulinaryGuideService Stage 2 Recipe Stream, 10: Refactor Culinary Contracts and Prompts

**Status:** done

- [x] In `src/app/core/culinary-guide/culinary-guide.const.ts`, add the Stage 2 recipe synthesis constants:

  ```typescript
  export const EXPECTED_FOOD_COUNT = 6;
  export const MIN_HONORABLE_MENTIONS = 1;
  export const MAX_HONORABLE_MENTIONS = 2;
  export const MAX_RECIPE_INGREDIENTS = 10;
  export const MIN_RECIPE_STEPS = 5;
  export const MAX_RECIPE_STEPS = 7;
  ```

- [x] In `src/app/core/culinary-guide/culinary-guide.prompt.ts`, import `MAX_RECIPE_INGREDIENTS`, `MIN_RECIPE_STEPS`, and `MAX_RECIPE_STEPS` from `./culinary-guide.const`, rename `RECIPE_PROMPT_INSTRUCTION` to `RECIPE_SYSTEM_INSTRUCTION`, and update both `RECIPE_SYSTEM_INSTRUCTION` and `createRecipePrompt` (interpolating the constants without hardcoding numbers and removing duplicate interpolation of `RECIPE_SYSTEM_INSTRUCTION` inside `createRecipePrompt`):

  ```typescript
  import {
    EXPECTED_FOOD_COUNT,
    MAX_HONORABLE_MENTIONS,
    MAX_RECIPE_INGREDIENTS,
    MAX_RECIPE_STEPS,
    MIN_HONORABLE_MENTIONS,
    MIN_RECIPE_STEPS,
  } from './culinary-guide.const';
  import type { CulinaryLocation, CulinaryRecipeTarget } from './culinary-guide.interface';
  ```

  ```typescript
  export const RECIPE_SYSTEM_INSTRUCTION =
    `Format the recipe instructions strictly as a single, compact numbered list of ${MIN_RECIPE_STEPS} to ${MAX_RECIPE_STEPS} brief, high-level cooking steps (one short sentence per step).
  Do NOT repeat or list ingredients in the recipe markdown field.
  Do NOT include markdown headings, introductory or concluding remarks, sub-lists, or markdown tables under any circumstances.`.trim();

  export function createRecipePrompt({ country, city, dishName }: CulinaryRecipeTarget): string {
    return `Provide an authentic, concise recipe for "${dishName}", a signature dish of ${city}, ${country}.
  List at most ${MAX_RECIPE_INGREDIENTS} core, essential ingredients with recommended quantities in the ingredients array (omit basic pantry staples like water, salt, pepper, cooking oil, and optional garnishes).
  Provide concise, summarized step-by-step preparation and cooking instructions in the recipe field.`.trim();
  }
  ```

- [x] In `src/app/core/culinary-guide/culinary-guide.schema.ts`, import `MAX_RECIPE_INGREDIENTS`, `MIN_RECIPE_STEPS`, and `MAX_RECIPE_STEPS` from `./culinary-guide.const` and update `CulinaryRecipeSchema` constraints and descriptions to align with the concise prompt:

  ```typescript
  import { Schema } from 'firebase/ai';
  import {
    EXPECTED_FOOD_COUNT,
    MAX_HONORABLE_MENTIONS,
    MAX_RECIPE_INGREDIENTS,
    MAX_RECIPE_STEPS,
    MIN_HONORABLE_MENTIONS,
    MIN_RECIPE_STEPS,
  } from './culinary-guide.const';
  ```

  ```typescript
  export const CulinaryRecipeSchema = Schema.object({
    properties: {
      ingredients: Schema.array({
        items: Schema.string({
          description: 'Core ingredient of a dish with recommended quantity.',
        }),
        description: `Between 1 and ${MAX_RECIPE_INGREDIENTS} core ingredients of a dish.`,
        minItems: 1,
        maxItems: MAX_RECIPE_INGREDIENTS,
      }),
      recipe: Schema.string({
        description: `Concise step-by-step preparation and cooking instructions (${MIN_RECIPE_STEPS} to ${MAX_RECIPE_STEPS} numbered steps) in Markdown format, excluding the ingredients list.`,
      }),
    },
    description: 'Structured output of ingredients and recipe.',
  });
  ```

- [x] In `src/app/core/culinary-guide/culinary-guide.service.ts`, update the import and `getRecipeStream` call site from `RECIPE_PROMPT_INSTRUCTION` to `RECIPE_SYSTEM_INSTRUCTION`:

  ```typescript
  import {
    createRecipePrompt,
    createTopFoodsPrompt,
    CULINARY_GUIDE_SYSTEM_INSTRUCTION,
    RECIPE_SYSTEM_INSTRUCTION,
  } from './culinary-guide.prompt';
  ```

  ```typescript
  const generator = await this.#aiService.generateContentStream<CulinaryRecipeResponse>({
    systemInstruction: RECIPE_SYSTEM_INSTRUCTION,
    contents: createRecipePrompt(target),
    schema: CulinaryRecipeSchema,
  });
  ```

- [x] In `src/app/core/culinary-guide/culinary-guide.prompt.spec.ts`, update unit tests to cover `RECIPE_SYSTEM_INSTRUCTION` and the updated `createRecipePrompt` with `MAX_RECIPE_INGREDIENTS`, `MIN_RECIPE_STEPS`, and `MAX_RECIPE_STEPS`:

  ```typescript
  import {
    EXPECTED_FOOD_COUNT,
    MAX_HONORABLE_MENTIONS,
    MAX_RECIPE_INGREDIENTS,
    MAX_RECIPE_STEPS,
    MIN_HONORABLE_MENTIONS,
    MIN_RECIPE_STEPS,
  } from './culinary-guide.const';
  import {
    createRecipePrompt,
    createTopFoodsPrompt,
    CULINARY_GUIDE_SYSTEM_INSTRUCTION,
    RECIPE_SYSTEM_INSTRUCTION,
  } from './culinary-guide.prompt';

  describe('culinary-guide prompts', () => {
    describe('CULINARY_GUIDE_SYSTEM_INSTRUCTION', () => {
      it('defines the role as an expert culinary and travel guide', () => {
        expect(CULINARY_GUIDE_SYSTEM_INSTRUCTION).toContain('expert culinary and travel guide');
        expect(CULINARY_GUIDE_SYSTEM_INSTRUCTION).toContain('JSON schema');
      });
    });

    describe('createTopFoodsPrompt', () => {
      it('interpolates country and city into prompt', () => {
        const prompt = createTopFoodsPrompt({ country: 'Japan', city: 'Kyoto' });

        expect(prompt).toContain('Kyoto, Japan');
        expect(prompt).toContain(`top ${EXPECTED_FOOD_COUNT} iconic local foods`);
        expect(prompt).toContain(`between ${MIN_HONORABLE_MENTIONS} and ${MAX_HONORABLE_MENTIONS} honorable mentions`);
        expect(prompt).toContain(`missed the top ${EXPECTED_FOOD_COUNT} list`);
        expect(prompt).toContain('native name');
      });
    });

    describe('RECIPE_SYSTEM_INSTRUCTION', () => {
      it('enforces a single compact numbered list of 5 to 7 steps and prohibits repeating ingredients, headings, and tables', () => {
        expect(RECIPE_SYSTEM_INSTRUCTION).toContain(
          `single, compact numbered list of ${MIN_RECIPE_STEPS} to ${MAX_RECIPE_STEPS} brief, high-level cooking steps`,
        );
        expect(RECIPE_SYSTEM_INSTRUCTION).toContain('Do NOT repeat or list ingredients in the recipe markdown field');
        expect(RECIPE_SYSTEM_INSTRUCTION).toContain('Do NOT include markdown headings');
        expect(RECIPE_SYSTEM_INSTRUCTION).toContain('markdown tables');
      });
    });

    describe('createRecipePrompt', () => {
      it('interpolates country, city, dish name, and max ingredients without duplicating system instruction', () => {
        const prompt = createRecipePrompt({ country: 'Italy', city: 'Naples', dishName: 'Pizza Margherita' });

        expect(prompt).toContain('"Pizza Margherita"');
        expect(prompt).toContain('Naples, Italy');
        expect(prompt).toContain(
          `at most ${MAX_RECIPE_INGREDIENTS} core, essential ingredients with recommended quantities`,
        );
        expect(prompt).toContain('omit basic pantry staples');
        expect(prompt).toContain('concise, summarized step-by-step preparation and cooking instructions');
        expect(prompt).not.toContain(RECIPE_SYSTEM_INSTRUCTION);
      });
    });
  });
  ```

- [x] In `src/app/core/culinary-guide/culinary-guide.service.spec.ts`, update the import and expectation from `RECIPE_PROMPT_INSTRUCTION` to `RECIPE_SYSTEM_INSTRUCTION`:

  ```typescript
  import { CULINARY_GUIDE_SYSTEM_INSTRUCTION, RECIPE_SYSTEM_INSTRUCTION } from './culinary-guide.prompt';
  ```

  ```typescript
  expect(mockAiService.generateContentStream).toHaveBeenCalledWith(
    expect.objectContaining({
      systemInstruction: RECIPE_SYSTEM_INSTRUCTION,
      schema: CulinaryRecipeSchema,
    }),
  );
  ```

- [x] Run targeted unit tests for `culinary-guide.prompt.spec.ts` and `culinary-guide.service.spec.ts` and verify `npm run test:spec` passes with zero errors.
