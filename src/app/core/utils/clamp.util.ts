export function clamp(value: number | undefined | null, min: number, max: number, fallback: number): number {
  if (value === undefined || value === null || isNaN(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, value));
}
