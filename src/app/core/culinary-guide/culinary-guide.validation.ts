import { EXPECTED_FOOD_COUNT, MAX_HONORABLE_MENTIONS, MIN_HONORABLE_MENTIONS } from './culinary-guide.const';
import type { CulinaryRecipeResponse, TopFoodsResponse } from './culinary-guide.interface';

export function isValidDiscoveryResponse({ foods, honorableMentions }: TopFoodsResponse): boolean {
  return (
    foods.length === EXPECTED_FOOD_COUNT &&
    honorableMentions.length >= MIN_HONORABLE_MENTIONS &&
    honorableMentions.length <= MAX_HONORABLE_MENTIONS
  );
}

export function isValidRecipeResponse({ ingredients, recipe }: CulinaryRecipeResponse): boolean {
  return ingredients.length >= 1 && recipe.trim().length > 0;
}
