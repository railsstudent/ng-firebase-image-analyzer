# Ticket 02: Migrate Domain Services to Consume Stream Inference Metadata

**What to build:**
Refactor both `CulinaryGuideService` and `ImageAnalysisService` to consume `update.inferenceMetadata` directly from `AiService.generateContentStream()` (`PartialResponse<T>`), deleting private `buildInferenceMetadata`, eliminating duplicated inline boilerplate across domain services, and adhering to the shared service boundary standard (Coding Standards § 8).

**Blocked by:** Ticket 01 (Extract Canonical Inference Metadata in AiService)

**Status:** done

## Scope of Work

1. Refactor `src/app/core/culinary-guide/culinary-guide.service.ts`:
   - Delete private method `buildInferenceMetadata(response: EnhancedGenerateContentResponse | undefined)`.
   - In `getTopFoodsStream` and `getRecipeStream` streaming loops:
     - Post-process `update.partialData`.
     - Spread `update.inferenceMetadata` when present (on final chunk), falling back to lightweight platform defaults (`source: 'on_device'`, `thoughtSummary: ''` or `'No thought summary'`; no `ZERO_TOKEN_SUMMARY` required during intermediate chunks).
   - Clean up imports in `culinary-guide.service.ts`: remove unused imports (`TokenModalityBreakdown`, `TokenSummary`, `EnhancedGenerateContentResponse`, `InferenceSource`).
2. Refactor `src/app/core/image-analysis/image-analysis.service.ts`:
   - Remove inline metadata construction in `analyzeImageStream` (lines 73–91).
   - In `analyzeImageStream` streaming loop:
     - Post-process `analysis = this.constructAnalysis(update)`.
     - Yield `{ analysis, ...(update.inferenceMetadata ?? { source: 'on_device', thoughtSummary: 'No thought summary' }) }`. No token summary fallback needed during intermediate chunks.
   - Clean up imports in `image-analysis.service.ts`: remove unused imports (`TokenModalityBreakdown`, `TokenSummary`, `EnhancedGenerateContentResponse`, `InferenceSource`).
3. Encapsulate `AiService.processUsage`:
   - Now that all domain services consume `inferenceMetadata` and have zero references to `processUsage`, mark `processUsage` as `private` in `src/app/core/firebase/ai.service.ts`.
4. Update Unit Tests:
   - `src/app/core/culinary-guide/culinary-guide.service.spec.ts`:
     - Update mock `generateContentStream` yields to include mock `inferenceMetadata` on emitted chunks.
     - Remove `processUsage` from the mock object.
     - Ensure all 27 unit tests pass cleanly.
   - `src/app/core/image-analysis/image-analysis.service.spec.ts`:
     - Update mock `generateContentStream` yields to include mock `inferenceMetadata` on emitted chunks.
     - Ensure all unit tests pass cleanly.
5. Verify Verification Loop:
   - `npx ng test --include="src/app/core/culinary-guide/**/*.spec.ts" --no-watch`
   - `npx ng test --include="src/app/core/image-analysis/**/*.spec.ts" --no-watch`
   - `npx ng test --include="src/app/core/firebase/**/*.spec.ts" --no-watch`
   - `npx ng lint`
   - `npm run check:cycles`
   - `npm run cspell`

## Acceptance Criteria

- [x] `CulinaryGuideService` consumes `update.inferenceMetadata` directly from the stream update and deletes private `buildInferenceMetadata`.
- [x] `ImageAnalysisService` consumes `update.inferenceMetadata` directly from the stream update and deletes inline metadata extraction boilerplate.
- [x] `AiService.processUsage` is made `private` now that zero external callers reference it.
- [x] Unused platform envelope types, SDK types, and token constants are removed from both domain service imports.
- [x] TestBed mocks in `culinary-guide.service.spec.ts` and `image-analysis.service.spec.ts` provide `inferenceMetadata` on streamed chunks.
- [x] All unit test suites and intermediate checks (`ng lint`, `check:cycles`, `cspell`) pass cleanly.
