import { describe, expect, it } from 'vitest';
import { calculatePercentage, formatDurationSeconds, toPercentString } from './format.util';

describe('format.util', () => {
  describe('toPercentString', () => {
    it('formats a decimal ratio with default 2 decimal places and percent symbol', () => {
      expect(toPercentString(0.5)).toBe('50.00%');
      expect(toPercentString(1)).toBe('100.00%');
      expect(toPercentString(0)).toBe('0.00%');
    });

    it('formats a decimal ratio with custom decimal precision', () => {
      expect(toPercentString(0.12345, 0)).toBe('12%');
      expect(toPercentString(0.12345, 1)).toBe('12.3%');
      expect(toPercentString(0.12345, 3)).toBe('12.345%');
    });

    it('formats negative ratios and values exceeding 1', () => {
      expect(toPercentString(-0.25)).toBe('-25.00%');
      expect(toPercentString(1.5)).toBe('150.00%');
    });

    it('formats very small fractional values', () => {
      expect(toPercentString(0.0001, 2)).toBe('0.01%');
      expect(toPercentString(0.00004, 2)).toBe('0.00%');
    });
  });

  describe('formatDurationSeconds', () => {
    it('formats milliseconds into seconds with default 1 decimal place', () => {
      expect(formatDurationSeconds(1500)).toBe('1.5');
      expect(formatDurationSeconds(1000)).toBe('1.0');
      expect(formatDurationSeconds(0)).toBe('0.0');
    });

    it('formats milliseconds with custom decimal precision', () => {
      expect(formatDurationSeconds(1234, 0)).toBe('1');
      expect(formatDurationSeconds(1234, 2)).toBe('1.23');
      expect(formatDurationSeconds(500, 3)).toBe('0.500');
    });

    it('formats sub-second and large durations', () => {
      expect(formatDurationSeconds(250)).toBe('0.3');
      expect(formatDurationSeconds(60000)).toBe('60.0');
    });

    it('formats negative duration values', () => {
      expect(formatDurationSeconds(-1000)).toBe('-1.0');
    });
  });

  describe('calculatePercentage', () => {
    it('calculates the percentage correctly for standard values', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(1, 4)).toBe(25);
      expect(calculatePercentage(0, 100)).toBe(0);
    });

    it('guards against division by zero and returns 0 when total is 0', () => {
      expect(calculatePercentage(10, 0)).toBe(0);
      expect(calculatePercentage(0, 0)).toBe(0);
      expect(calculatePercentage(-5, 0)).toBe(0);
    });

    it('calculates percentage when value exceeds total', () => {
      expect(calculatePercentage(150, 100)).toBe(150);
    });

    it('calculates percentage with negative values', () => {
      expect(calculatePercentage(-25, 100)).toBe(-25);
    });

    it('returns accurate floating point values for fractional divisions', () => {
      expect(calculatePercentage(1, 3)).toBeCloseTo(33.333, 3);
    });
  });
});
