import { ModalityTokenCount } from 'firebase/ai';

export interface TokenSummary {
  totalTokenCount: number;
  promptTokenCount: number;
  thoughtsTokenCount: number;
  cachedContentTokenCount: number;
  outputTokenCount: number;
}

export interface TokenModalityBreakdown {
  promptTokensDetails: ModalityTokenCount[];
  outputTokensDetails: ModalityTokenCount[];
  cacheTokensDetails: ModalityTokenCount[];
}

export interface TokenUsage {
  tokenSummary: TokenSummary;
  tokenBreakdown: TokenModalityBreakdown;
}
