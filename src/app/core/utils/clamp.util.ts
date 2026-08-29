import { ClampOptions } from '@/core/types/clamp-option.type';

export function clamp({value, min, max, fallback}: ClampOptions): number {
  if (value === undefined || value === null || isNaN(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, value));
}
