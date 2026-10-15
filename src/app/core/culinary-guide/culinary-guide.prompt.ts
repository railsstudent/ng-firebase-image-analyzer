import { MIN_HONORABLE_MENTIONS, MAX_HONORABLE_MENTIONS, EXPECTED_FOOD_COUNT } from './culinary-guide.const';
import type { CulinaryLocation, CulinaryRecipeTarget } from './culinary-guide.interface';

export const CULINARY_GUIDE_SYSTEM_INSTRUCTION = `You are an expert culinary and travel guide specializing in regional gastronomy and authentic local dishes.
Always adhere strictly to the requested JSON schema.
Ensure dish descriptions are concise and informative.`;

export function createTopFoodsPrompt({ country, city }: CulinaryLocation): string {
  return `Identify the top ${EXPECTED_FOOD_COUNT} iconic local foods and culinary staples for ${city}, ${country}.

For each dish, provide its popular name, its native name in the local script or language (if different), and a concise description of what makes it special.

Additionally, provide between ${MIN_HONORABLE_MENTIONS} and ${MAX_HONORABLE_MENTIONS} honorable mentions: notable runner-up dishes that represent the local culture but just missed the top 6 list.`.trim();
}

export const RECIPE_PROMPT_INSTRUCTION =
  `Format the recipe instructions into clear, structured markdown using numbered lists for sequential steps and bulleted lists for ingredient notes.
Do NOT use markdown tables under any circumstances. Ensure the response is well-structured and easy to read.`.trim();

export function createRecipePrompt({ country, city, dishName }: CulinaryRecipeTarget): string {
  return `Provide an authentic, easy-to-follow recipe for "${dishName}", a signature dish of ${city}, ${country}.

List the major ingredients with recommended quantities, followed by step-by-step preparation and cooking instructions.

${RECIPE_PROMPT_INSTRUCTION}`.trim();
}
