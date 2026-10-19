import type { InferenceSource } from 'firebase/ai';
import type { DisplaySource } from './display-source.type';
import type { TokenModalityBreakdown, TokenSummary } from './token-usage.interface';

export interface InferenceMetadata {
  source?: InferenceSource;
  displaySource?: DisplaySource;
  thoughtSummary?: string;
  tokenSummary?: TokenSummary;
  tokenModalityBreakdown?: TokenModalityBreakdown;
}
