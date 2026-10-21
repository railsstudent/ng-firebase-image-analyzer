export function normalizeKeys(...parts: (string | undefined)[]): string {
  if (parts.length > 1) {
    return parts
      .map((part) => part?.trim())
      .join(':')
      .toLowerCase();
  }

  return parts?.[0]?.trim()?.toLowerCase() || '';
}
