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
