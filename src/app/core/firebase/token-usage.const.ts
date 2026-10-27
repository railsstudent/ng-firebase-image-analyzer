import type { TokenSummary } from './token-usage.interface';

export const ZERO_TOKEN_SUMMARY: TokenSummary = {
  totalTokenCount: 0,
  promptTokenCount: 0,
  thoughtsTokenCount: 0,
  cachedContentTokenCount: 0,
  outputTokenCount: 0,
};
