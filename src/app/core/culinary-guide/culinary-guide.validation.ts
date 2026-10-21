import { EXPECTED_FOOD_COUNT, MAX_HONORABLE_MENTIONS, MIN_HONORABLE_MENTIONS } from './culinary-guide.const';
import type { CulinaryRecipeResponse, TopFoodsResponse } from './culinary-guide.interface';
import { normalizeKeys } from './culinary-guide.normalization';

function distinctBy<T>(items: readonly T[], keySelector: (item: T) => string, initialKeys?: Set<string>): T[] {
  const seen = new Set(initialKeys);
  return items.filter((item) => {
    const key = keySelector(item);

    // skip blank key
    if (!key) {
      return false;
    }

    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function normalizeDiscoveryResponse({ foods, honorableMentions }: TopFoodsResponse): TopFoodsResponse {
  const uniqueFoods = distinctBy(foods, (item) => normalizeKeys(item.name));
  const seenFoods = new Set<string>(uniqueFoods.map((item) => normalizeKeys(item.name)));
  const uniqueHonorableMentions = distinctBy(honorableMentions, (item) => normalizeKeys(item), seenFoods);
  return { foods: uniqueFoods, honorableMentions: uniqueHonorableMentions };
}

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
