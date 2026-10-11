import { TokenModalityBreakdown, TokenSummary } from '@/core/firebase';
import { InferenceSource } from 'firebase/ai';
import { ColorAdjustment } from './color-adjustment.interface';
import { Crop } from './crop.interface';
import { Recommendation } from './recommendation.interface';
import { Tag } from './tag.interface';

export interface ImageAnalysisResponse {
  alternativeTexts: string[];
  tags: Tag[];
  recommendations: Recommendation[];
  colorAdjustment?: ColorAdjustment;
  crop?: Crop;
}

export interface ImageAnalysisWithMetadata {
  analysis: ImageAnalysisResponse;
  source?: InferenceSource;
  thoughtSummary?: string;
  tokenSummary?: TokenSummary;
  tokenModalityBreakdown?: TokenModalityBreakdown;
}
