import { EnhancedGenerateContentResponse, Part, SchemaRequest, TypedSchema } from 'firebase/ai';

export interface GenerateContentParams {
  contents: string | Part | (string | Part)[];
  schema?: TypedSchema | SchemaRequest;
  systemInstruction?: string;
}

export interface PartialResponse<T> {
  partialData: Partial<T>;
  response?: EnhancedGenerateContentResponse;
}
