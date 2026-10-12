import { SchemaRequest, TypedSchema } from 'firebase/ai';

export interface ModelConfigParams {
  schema?: TypedSchema | SchemaRequest;
  systemInstruction?: string;
}
