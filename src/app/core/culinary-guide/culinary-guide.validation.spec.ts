import type { CulinaryFoodItem } from './culinary-guide.interface';
import { isValidDiscoveryResponse, isValidRecipeResponse } from './culinary-guide.validation';

function makeFood(name: string): CulinaryFoodItem {
  return { name, description: `Description for ${name}` };
}

describe('isValidDiscoveryResponse', () => {
  const validFoods: CulinaryFoodItem[] = [
    makeFood('Sushi'),
    makeFood('Ramen'),
    makeFood('Tempura'),
    makeFood('Udon'),
    makeFood('Soba'),
    makeFood('Yakitori'),
  ];

  it('returns true when response has exactly 6 foods and 1 honorable mention', () => {
    const result = isValidDiscoveryResponse({
      foods: validFoods,
      honorableMentions: ['Takoyaki'],
    });

    expect(result).toBe(true);
  });

  it('returns true when response has exactly 6 foods and 2 honorable mentions', () => {
    const result = isValidDiscoveryResponse({
      foods: validFoods,
      honorableMentions: ['Takoyaki', 'Okonomiyaki'],
    });

    expect(result).toBe(true);
  });

  it('returns false when foods count is less than 6', () => {
    const result = isValidDiscoveryResponse({
      foods: validFoods.slice(0, 5),
      honorableMentions: ['Takoyaki'],
    });

    expect(result).toBe(false);
  });

  it('returns false when foods count is greater than 6', () => {
    const result = isValidDiscoveryResponse({
      foods: [...validFoods, makeFood('Tonkatsu')],
      honorableMentions: ['Takoyaki'],
    });

    expect(result).toBe(false);
  });

  it('returns false when honorable mentions count is less than 1', () => {
    const result = isValidDiscoveryResponse({
      foods: validFoods,
      honorableMentions: [],
    });

    expect(result).toBe(false);
  });

  it('returns false when honorable mentions count is greater than 2', () => {
    const result = isValidDiscoveryResponse({
      foods: validFoods,
      honorableMentions: ['Takoyaki', 'Okonomiyaki', 'Kushikatsu'],
    });

    expect(result).toBe(false);
  });
});

describe('isValidRecipeResponse', () => {
  it('returns true when response has valid ingredients and non-empty recipe string', () => {
    const result = isValidRecipeResponse({
      ingredients: ['200g ramen noodles', '500ml pork bone broth', '2 slices chashu'],
      recipe: '1. Boil noodles for 2 minutes.\n2. Heat broth and pour over noodles.\n3. Top with chashu.',
    });

    expect(result).toBe(true);
  });

  it('returns false when ingredients array is empty', () => {
    const result = isValidRecipeResponse({
      ingredients: [],
      recipe: '1. Cook with whatever ingredients you have.',
    });

    expect(result).toBe(false);
  });

  it('returns false when recipe string is empty', () => {
    const result = isValidRecipeResponse({
      ingredients: ['200g ramen noodles'],
      recipe: '',
    });

    expect(result).toBe(false);
  });

  it('returns false when recipe string contains only whitespace', () => {
    const result = isValidRecipeResponse({
      ingredients: ['200g ramen noodles'],
      recipe: '   \n  \t  ',
    });

    expect(result).toBe(false);
  });
});
