import { describe, expect, it } from 'vitest';
import { normalizeDiscoveryResponse, normalizeKeys } from './culinary-guide.normalization';
import type { CulinaryFoodItem } from './culinary-guide.interface';

function makeFood(name: string): CulinaryFoodItem {
  return { name, description: `Description for ${name}` };
}

describe('normalizeKeys', () => {
  describe('single-part keys (fast-path)', () => {
    it('normalizes single key by trimming whitespace and converting to lowercase', () => {
      expect(normalizeKeys('  Tonkotsu Ramen  ')).toBe('tonkotsu ramen');
    });

    it('returns empty string when given undefined or empty string', () => {
      expect(normalizeKeys(undefined)).toBe('');
      expect(normalizeKeys('   ')).toBe('');
    });
  });

  describe('multi-part composite keys', () => {
    it('joins multiple parts with colon delimiter after normalizing each part', () => {
      expect(normalizeKeys('  JAPAN ', ' Tokyo  ', ' Tonkotsu Ramen ')).toBe('japan:tokyo:tonkotsu ramen');
    });

    it('handles undefined or blank segments gracefully', () => {
      expect(normalizeKeys('Japan', undefined, 'Ramen')).toBe('japan::ramen');
      expect(normalizeKeys('  ', 'Tokyo')).toBe(':tokyo');
    });
  });
});

describe('normalizeDiscoveryResponse', () => {
  it('deduplicates foods by name (case-insensitive and trimmed), preserving the first occurrence', () => {
    const foods: CulinaryFoodItem[] = [
      { name: 'Tacos', description: 'Original tacos' },
      { name: 'Burrito', description: 'Fresh burrito' },
      { name: '  tacos  ', description: 'Duplicate tacos to discard' },
      { name: 'TACOS', description: 'Uppercase duplicate tacos' },
    ];

    const result = normalizeDiscoveryResponse({
      foods,
      honorableMentions: ['Quesadilla'],
    });

    expect(result.foods).toEqual([
      { name: 'Tacos', description: 'Original tacos' },
      { name: 'Burrito', description: 'Fresh burrito' },
    ]);
  });

  it('drops honorable mentions that duplicate any food item (cross-list disjoint check)', () => {
    const foods: CulinaryFoodItem[] = [makeFood('Sushi'), makeFood('Ramen')];

    const result = normalizeDiscoveryResponse({
      foods,
      honorableMentions: [' sushi ', 'RAMEN', 'Takoyaki'],
    });

    expect(result.honorableMentions).toEqual(['Takoyaki']);
  });

  it('deduplicates honorable mentions, preserving the first unique occurrence', () => {
    const foods: CulinaryFoodItem[] = [makeFood('Sushi')];

    const result = normalizeDiscoveryResponse({
      foods,
      honorableMentions: ['Takoyaki', '  takoyaki  ', 'TAKOYAKI', 'Okonomiyaki'],
    });

    expect(result.honorableMentions).toEqual(['Takoyaki', 'Okonomiyaki']);
  });

  it('preserves clean foods and honorable mentions arrays untouched', () => {
    const foods: CulinaryFoodItem[] = [makeFood('Sushi'), makeFood('Ramen')];
    const honorableMentions = ['Takoyaki', 'Okonomiyaki'];

    const result = normalizeDiscoveryResponse({
      foods,
      honorableMentions,
    });

    expect(result.foods).toEqual(foods);
    expect(result.honorableMentions).toEqual(honorableMentions);
  });

  it('handles empty foods and honorable mentions gracefully', () => {
    const result = normalizeDiscoveryResponse({
      foods: [],
      honorableMentions: [],
    });

    expect(result.foods).toEqual([]);
    expect(result.honorableMentions).toEqual([]);
  });
});
