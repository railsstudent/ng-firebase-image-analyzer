import type { InferenceMetadata } from '@/core/firebase';

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

interface ImageAnalysisWithMetadata extends InferenceMetadata {
  analysis: ImageAnalysisResponse;
}

export type StreamingAnalysisWithMetadata = Omit<ImageAnalysisWithMetadata, 'analysis'> & {
  analysis: Partial<ImageAnalysisResponse>;
};
