import type { TopFoodsResponse } from './culinary-guide.interface';

export function normalizeKeys(...parts: (string | undefined)[]): string {
  if (parts.length > 1) {
    return parts
      .map((part) => part?.trim())
      .join(':')
      .toLowerCase();
  }

  return parts?.[0]?.trim()?.toLowerCase() || '';
}

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
