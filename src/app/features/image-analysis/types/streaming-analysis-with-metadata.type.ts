import {
  ImageAnalysisResponse,
  ImageAnalysisWithMetadata,
} from '@/features/image-analysis/interfaces/image-analysis-response.interface';

export type StreamingAnalysisWithMetadata = Omit<ImageAnalysisWithMetadata, 'analysis'> & {
  analysis: Partial<ImageAnalysisResponse>;
};
