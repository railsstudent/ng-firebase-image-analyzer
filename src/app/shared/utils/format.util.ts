import { MS_PER_SECOND, PERCENT_FACTOR } from '@/core/constants';

export function toPercentString(ratio: number, decimals = 2): string {
  return `${(ratio * PERCENT_FACTOR).toFixed(decimals)}%`;
}

export function formatDurationSeconds(ms: number, decimals = 1): string {
  return (ms / MS_PER_SECOND).toFixed(decimals);
}

export function calculatePercentage(value: number, total: number): number {
  return total === 0 ? 0 : (value / total) * PERCENT_FACTOR;
}
