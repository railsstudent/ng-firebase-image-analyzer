import type { BaseModalityTokens } from './token-analytics.interface';

export type ModalitySegments = BaseModalityTokens & {
  totalTokens: number;
};
