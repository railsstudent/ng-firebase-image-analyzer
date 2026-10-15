import type { Part, SchemaRequest, TypedSchema } from 'firebase/ai';
import type { InferenceMetadata } from './inference-metadata.interface';

export interface GenerateContentParams {
  contents: string | Part | (string | Part)[];
  schema?: TypedSchema | SchemaRequest;
  systemInstruction?: string;
}

export interface PartialResponse<T> {
  partialData: Partial<T>;
  inferenceMetadata?: InferenceMetadata;
}
