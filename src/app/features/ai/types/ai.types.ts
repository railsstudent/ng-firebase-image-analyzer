import { Part, SchemaRequest, TypedSchema } from 'firebase/ai';

export interface GenerateContentParams {
  contents: string | Part | (string | Part)[];
  schema?: TypedSchema | SchemaRequest;
  systemInstruction?: string;
}
