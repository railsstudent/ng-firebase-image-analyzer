import { describe, expect, it } from 'vitest';
import { normalizeKeys } from './culinary-guide.normalization';

describe('buildCompositeKey', () => {
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
