import { BaseModalityTokens } from '@/features/image-analysis/interfaces/modality-tokens.interface';

export type ModalitySegments = BaseModalityTokens & {
  totalTokens: number;
};
