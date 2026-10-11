import { TokenModalityBreakdown, TokenSummary } from '@/core/firebase';
import { InferenceSource } from 'firebase/ai';

interface Tag {
  name: string;
  sentence: string;
}

export interface Recommendation {
  recommendation: string;
  sentence: string;
}

export interface ColorAdjustment {
  brightness?: number;
  saturation?: number;
  contrast?: number;
  warmth?: number;
}

export interface Crop {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

export interface ImageAnalysisResponse {
  alternativeTexts: string[];
  tags: Tag[];
  recommendations: Recommendation[];
  colorAdjustment?: ColorAdjustment;
  crop?: Crop;
}

interface ImageAnalysisWithMetadata {
  analysis: ImageAnalysisResponse;
  source?: InferenceSource;
  thoughtSummary?: string;
  tokenSummary?: TokenSummary;
  tokenModalityBreakdown?: TokenModalityBreakdown;
}

export type StreamingAnalysisWithMetadata = Omit<ImageAnalysisWithMetadata, 'analysis'> & {
  analysis: Partial<ImageAnalysisResponse>;
};
