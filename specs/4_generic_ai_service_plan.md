# 4. Generic AI Service Plan (Revised)

## 1. Directory & Files

- Types: `src/app/features/ai/types/ai.types.ts`
  - Defines the `GenerateContentParams` parameter object interface.
- Service: `src/app/features/ai/services/ai.service.ts`
  - Implement `AiService` injecting `FIREBASE_AI`.

## 2. Validation Logics

- **Inputs Validation**:
  - Null/undefined check.
  - Trimmed non-empty check for strings.
  - Length check for arrays, ensuring all elements (either string or `Part`) are valid and non-empty.
  - Defined check for single `Part` objects.
- **Response Validation**:
  - Throw error if `response.candidates` is empty or undefined.
  - Throw error if the first candidate's `finishReason` is defined and is not `'STOP'`.
  - For streaming, intercept and chain validation onto the final `.response` promise.

## 3. Method Signatures

- `generateContent(params: GenerateContentParams): Promise<GenerateContentResponse>`
  - Integrates the optional `schema` from `params` into `options.generationConfig.responseSchema`.
  - Validates `params.contents`, gets the model, calls `generateContent`, validates the response, and returns it.
- `generateContentStream(params: GenerateContentParams): Promise<GenerateContentStreamResult>`
  - Integrates the optional `schema` from `params` into `options.generationConfig.responseSchema`.
  - Validates `params.contents`, gets the model, calls `generateContentStream`, intercepts the response promise for validation, and returns the stream result.
