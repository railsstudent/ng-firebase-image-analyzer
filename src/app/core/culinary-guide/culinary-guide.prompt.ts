import {
  EXPECTED_FOOD_COUNT,
  MAX_HONORABLE_MENTIONS,
  MAX_RECIPE_INGREDIENTS,
  MAX_RECIPE_STEPS,
  MIN_HONORABLE_MENTIONS,
  MIN_RECIPE_STEPS,
} from './culinary-guide.const';
import type { CulinaryLocation, CulinaryRecipeTarget } from './culinary-guide.interface';

export const CULINARY_GUIDE_SYSTEM_INSTRUCTION = `You are an expert culinary and travel guide specializing in regional gastronomy and authentic local dishes.
Always adhere strictly to the requested JSON schema.
Ensure dish descriptions are concise and informative.`;

export function createTopFoodsPrompt({ country, city }: CulinaryLocation): string {
  return `Identify the top ${EXPECTED_FOOD_COUNT} iconic local foods and culinary staples for ${city}, ${country}.

For each dish, provide its popular name, its native name in the local script or language (if different), and a concise description of what makes it special.

Additionally, provide between ${MIN_HONORABLE_MENTIONS} and ${MAX_HONORABLE_MENTIONS} honorable mentions: notable runner-up dishes that represent the local culture but just missed the top ${EXPECTED_FOOD_COUNT} list.`.trim();
}

export const RECIPE_SYSTEM_INSTRUCTION =
  `Format the recipe instructions strictly as a single, compact numbered list of ${MIN_RECIPE_STEPS} to ${MAX_RECIPE_STEPS} brief, high-level cooking steps (one short sentence per step).
Do NOT repeat or list ingredients in the recipe markdown field.
Do NOT include markdown headings, introductory or concluding remarks, sub-lists, or markdown tables under any circumstances.`.trim();

export function createRecipePrompt({ country, city, dishName }: CulinaryRecipeTarget): string {
  return `Provide an authentic, concise recipe for "${dishName}", a signature dish of ${city}, ${country}.
  List at most ${MAX_RECIPE_INGREDIENTS} core, essential ingredients with recommended quantities in the ingredients array (omit basic pantry staples like water, salt, pepper, cooking oil, and optional garnishes).
  Provide concise, summarized step-by-step preparation and cooking instructions in the recipe field.`.trim();
}
