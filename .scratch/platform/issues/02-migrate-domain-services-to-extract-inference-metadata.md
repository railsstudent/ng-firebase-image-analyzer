# Ticket 02: Migrate Domain Services to AiService.extractInferenceMetadata

**What to build:**
Refactor both `CulinaryGuideService` and `ImageAnalysisService` to consume the canonical `AiService.extractInferenceMetadata()` method, eliminating duplicated inline boilerplate and adhering to the DAG platform envelope architectural standard (Coding Standards § 8).

**Blocked by:** Ticket 01 (Extract Canonical Inference Metadata in AiService)

**Status:** ready-for-agent

## Scope of Work

1. Refactor `src/app/core/culinary-guide/culinary-guide.service.ts`:
   - Delete private method `buildInferenceMetadata(response: EnhancedGenerateContentResponse | undefined)`.
   - Update `getTopFoodsStream` and `getRecipeStream` streaming loops to call `this.#aiService.extractInferenceMetadata(update.response)`.
   - Clean up imports in `culinary-guide.service.ts`: remove unused imports (`TokenModalityBreakdown`, `TokenSummary`, `ZERO_TOKEN_SUMMARY`, `EnhancedGenerateContentResponse`, `InferenceSource`).
2. Refactor `src/app/core/image-analysis/image-analysis.service.ts`:
   - Replace inline metadata construction in `analyzeImageStream` (lines 73–91) with `const metadata = this.#aiService.extractInferenceMetadata(response);`.
   - Spread `...metadata` into yielded `StreamingAnalysisWithMetadata`.
   - Clean up imports in `image-analysis.service.ts`: remove unused imports (`TokenModalityBreakdown`, `TokenSummary`, `ZERO_TOKEN_SUMMARY`, `InferenceSource`).
3. Update Unit Tests:
   - `src/app/core/culinary-guide/culinary-guide.service.spec.ts`:
     - Update mock `AiService` at the TestBed boundary to provide `extractInferenceMetadata: vi.fn()`.
     - Ensure all 27 unit tests pass cleanly.
   - Any affected image-analysis specs:
     - Verify tests pass cleanly.
4. Verify Verification Loop:
   - `npx ng test --include="src/app/core/culinary-guide/**/*.spec.ts" --no-watch`
   - `npx ng test --include="src/app/features/image-analysis/**/*.spec.ts" --no-watch`
   - `npx ng lint`
   - `npm run check:cycles`
   - `npm run cspell`

## Acceptance Criteria

- [ ] `CulinaryGuideService` delegates all metadata extraction to `AiService.extractInferenceMetadata` and deletes private `buildInferenceMetadata`.
- [ ] `ImageAnalysisService` delegates all metadata extraction to `AiService.extractInferenceMetadata` and removes inline boilerplate.
- [ ] Unused envelope types and token constants are removed from both domain service imports.
- [ ] TestBed mocks in `culinary-guide.service.spec.ts` use `satisfies Partial<AiService>` including `extractInferenceMetadata`.
- [ ] All unit test suites and intermediate checks (`ng lint`, `check:cycles`, `cspell`) pass cleanly.
