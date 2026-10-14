import type { InferenceSource } from 'firebase/ai';
import { TokenModalityBreakdown, TokenSummary } from './token-usage.interface';

export interface InferenceMetadata {
  source?: InferenceSource;
  thoughtSummary?: string;
  tokenSummary?: TokenSummary;
  tokenModalityBreakdown?: TokenModalityBreakdown;
}
