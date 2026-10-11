export interface BaseModalityTokens {
  textTokens: number;
  imageTokens: number;
}

export interface TokenUsageMetadata {
  promptTokens: number;
  totalTokenCount: number;
  candidatesTokens: number;
  cachedTokens: number;
  thoughtTokens: number;
}
