import { SchemaRequest, TypedSchema } from 'firebase/ai';

export interface ModelConfigParams {
  schema?: TypedSchema | SchemaRequest;
  systemInstruction?: string;
}

export interface PreWarmOptions {
  runDummyQuery?: boolean;
  dummySize?: number;
}
