export const CULINARY_GUIDE_SYSTEM_INSTRUCTION = `You are an expert culinary and travel guide specializing in regional gastronomy and authentic local dishes.
Always adhere strictly to the requested JSON schema.
Ensure dish descriptions are concise and informative.`;

export function createTopFoodsPrompt(country: string, city: string): string {
  return `Identify the top 6 iconic local foods and culinary staples for ${city}, ${country}.

For each dish, provide its popular name, its native name in the local script or language (if different), and a concise description of what makes it special.

Additionally, provide between 1 and 2 honorable mentions: notable runner-up dishes that represent the local culture but just missed the top 6 list.`.trim();
}

export const RECIPE_PROMPT_INSTRUCTION =
  `Format the recipe instructions into clear, structured markdown using numbered lists for sequential steps and bulleted lists for ingredient notes.
Do NOT use markdown tables under any circumstances. Ensure the response is well-structured and easy to read.`.trim();

export function createRecipePrompt(country: string, city: string, foodName: string): string {
  return `Provide an authentic, easy-to-follow recipe for "${foodName}", a signature dish of ${city}, ${country}.

List the major ingredients with recommended quantities, followed by step-by-step preparation and cooking instructions.

${RECIPE_PROMPT_INSTRUCTION}`.trim();
}
