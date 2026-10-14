import {
  createRecipePrompt,
  createTopFoodsPrompt,
  CULINARY_GUIDE_SYSTEM_INSTRUCTION,
  RECIPE_PROMPT_INSTRUCTION,
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
      const prompt = createTopFoodsPrompt('Japan', 'Kyoto');

      expect(prompt).toContain('Kyoto, Japan');
      expect(prompt).toContain('top 6 iconic local foods');
      expect(prompt).toContain('between 1 and 2 honorable mentions');
      expect(prompt).toContain('native name');
    });
  });

  describe('createRecipePrompt', () => {
    it('interpolates country, city, and dish name into prompt', () => {
      const prompt = createRecipePrompt('Italy', 'Naples', 'Pizza Margherita');

      expect(prompt).toContain('"Pizza Margherita"');
      expect(prompt).toContain('Naples, Italy');
      expect(prompt).toContain(RECIPE_PROMPT_INSTRUCTION);
      expect(prompt).toContain('Do NOT use markdown tables');
      expect(prompt).toContain('numbered lists for sequential steps');
      expect(prompt).toContain('bulleted lists for ingredient notes');
    });
  });
});
