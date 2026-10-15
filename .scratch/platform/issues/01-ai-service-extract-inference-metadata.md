# Ticket 01: Extract Canonical Inference Metadata in AiService

**What to build:**
Enhance the core platform `AiService` to provide a canonical `extractInferenceMetadata(response?: EnhancedGenerateContentResponse): InferenceMetadata` method. Centralizes the mapping from Firebase AI SDK's `EnhancedGenerateContentResponse` into our domain platform envelope `InferenceMetadata` (telemetry, inference source, thought summaries, and token breakdown/summary), removing the need for domain services to independently reinvent this logic.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

## Scope of Work

1. Update `src/app/core/firebase/ai.service.ts`:
   - Implement `extractInferenceMetadata(response?: EnhancedGenerateContentResponse): InferenceMetadata`.
   - Provide standard platform defaults when `response` is undefined:
     - `source: 'on_device'`
     - `thoughtSummary: 'No thought summary'`
     - `tokenSummary: undefined`
     - `tokenModalityBreakdown: undefined`
   - When `response` is present, defensively extract:
     - `source: response.inferenceSource || 'on_device'`
     - `thoughtSummary: response.thoughtSummary?.() || 'No thought summary'`
     - Delegate token usage processing to `this.processUsage(response)` with `ZERO_TOKEN_SUMMARY` fallback.
   - Retain existing `processUsage(response)` method for backward compatibility.
2. Update `src/app/core/firebase/index.ts`:
   - Ensure all necessary types (`InferenceMetadata`, `EnhancedGenerateContentResponse` if applicable) are cleanly exported.
3. Update `src/app/core/firebase/ai.service.spec.ts`:
   - Add unit tests for `extractInferenceMetadata`:
     - Handling undefined response with default values.
     - Extracting on-device / cloud `inferenceSource`.
     - Extracting thought summaries via safe method invocation.
     - Extracting and formatting token usage breakdowns.
4. Verify with:
   - `npx ng test --include="src/app/core/firebase/**/*.spec.ts" --no-watch`
   - `npx ng lint`
   - `npm run check:cycles`
   - `npm run cspell`

## Acceptance Criteria

- [ ] `AiService.extractInferenceMetadata` cleanly transforms `EnhancedGenerateContentResponse | undefined` into `InferenceMetadata`.
- [ ] Safe optional chaining guards method invocations on SDK responses (`response.thoughtSummary?.()`).
- [ ] Platform defaults (`'on_device'`, `'No thought summary'`, zero-token fallback) are reliably populated.
- [ ] Unit tests in `ai.service.spec.ts` thoroughly cover undefined, partial, and complete response scenarios.
- [ ] Static verification (`ng lint`, `check:cycles`, `cspell`) and unit tests pass cleanly.
