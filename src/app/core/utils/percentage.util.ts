export function calculatePercentage(value: number, total: number): number {
  const percent = 100;

  if (total === 0) {
    return 0;
  }
  return (value / total) * percent;
}
