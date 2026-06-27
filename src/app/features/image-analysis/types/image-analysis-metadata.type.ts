import { TokenModalityBreakdown, TokenSummary } from '@/features/ai/types/token-usage.type';
import { InferenceSource } from 'firebase/ai';
import { ColorAdjustment } from './color-adjustment.type';
import { Recommendation } from './recommendation.type';
import { Tag } from './tag.type';

export interface ImageAnalysisResponse {
  alternativeTexts: string[];
  tags: Tag[];
  recommendations: Recommendation[];
  colorAdjustment?: ColorAdjustment;
}

export interface ImageAnalysisWithMetadata {
  analysis: ImageAnalysisResponse;
  source?: InferenceSource;
  thoughtSummary?: string;
  tokenSummary?: TokenSummary;
  tokenModalityBreakdown?: TokenModalityBreakdown;
}
