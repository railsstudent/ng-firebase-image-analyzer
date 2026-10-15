# Ticket 01: Extract Canonical Inference Metadata in AiService

**What to build:**
Enhance the core platform `AiService` to provide a canonical `extractInferenceMetadata(response?: EnhancedGenerateContentResponse): InferenceMetadata` method, update `PartialResponse<T>` to carry optional `inferenceMetadata?: InferenceMetadata`, and return `inferenceMetadata` on the final completed response chunk of `generateContentStream`. Centralizes the mapping from Firebase AI SDK's `EnhancedGenerateContentResponse` into our domain platform envelope `InferenceMetadata` (telemetry, inference source, thought summaries, and token breakdown/summary) so stream consumers receive already-extracted metadata on the terminal chunk.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

## Scope of Work

1. Update `src/app/core/firebase/ai.interface.ts`:
   - Update `PartialResponse<T>` interface to include `inferenceMetadata?: InferenceMetadata;`.
2. Update `src/app/core/firebase/ai.service.ts`:
   - Implement `extractInferenceMetadata(response?: EnhancedGenerateContentResponse): InferenceMetadata` (omitting `public` keyword per coding standards):
     - Safe optional chaining: `response?.thoughtSummary?.() || 'No thought summary'`.
     - Platform defaults when `response` is undefined: `'on_device'`, `'No thought summary'`, `ZERO_TOKEN_SUMMARY`, and `undefined` breakdown.
     - When `response` is present: extract `source`, `thoughtSummary`, and process usage via `this.processUsage(response)`.
   - Update `generateContentStream`:
     - Keep intermediate streaming chunk yields returning `{ partialData: parsed }` (without `inferenceMetadata`).
     - On the final completed response chunk yield, attach `inferenceMetadata: this.extractInferenceMetadata(finalResponse)`.
   - Retain existing accessible `processUsage(response)` in Ticket 01 to keep intermediate builds green, prior to encapsulating it as private in Ticket 02.
3. Update `src/app/core/firebase/index.ts`:
   - Ensure all necessary types (`InferenceMetadata`, `PartialResponse`) are cleanly exported.
4. Update `src/app/core/firebase/ai.service.spec.ts`:
   - Add unit tests for `extractInferenceMetadata`:
     - Handling undefined response with default values.
     - Extracting on-device / cloud `inferenceSource`.
     - Extracting thought summaries via safe method invocation.
     - Extracting and formatting token usage breakdowns.
   - Update `generateContentStream` tests to verify `inferenceMetadata` is emitted on the final chunk.
5. Verify with:
   - `npx ng test --include="src/app/core/firebase/**/*.spec.ts" --no-watch`
   - `npx ng lint`
   - `npm run check:cycles`
   - `npm run cspell`

## Acceptance Criteria

- [x] `AiService.extractInferenceMetadata` cleanly transforms `EnhancedGenerateContentResponse | undefined` into `InferenceMetadata`.
- [x] Safe optional chaining guards method invocations on SDK responses (`response?.thoughtSummary?.()`).
- [x] Platform defaults (`'on_device'`, `'No thought summary'`, zero-token fallback) are reliably populated.
- [x] `PartialResponse<T>` interface includes `inferenceMetadata?: InferenceMetadata;`.
- [x] `generateContentStream` constructs and yields `inferenceMetadata` on the final chunk.
- [ ] Unit tests in `ai.service.spec.ts` thoroughly cover `extractInferenceMetadata` and the final chunk's metadata emission.
- [ ] Static verification (`ng lint`, `check:cycles`, `cspell`) and unit tests pass cleanly.
