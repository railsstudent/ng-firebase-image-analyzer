# 19: Refactor ImageAnalysisPanelComponent to Derive Metadata from Data

**What to build:** Update `ImageAnalysisPanelComponent` and its template to derive all inference metadata (`source` and `displaySource`) directly from `data()`, passing `analysis.displaySource || 'Unknown'` directly to `<app-thought-summary>`. Eliminate the redundant `source` input property and `displaySource` computed signal, and clean up the unused `source` computed property and input binding in `ImageAnalysisComponent`.

**Blocked by:** 18: Elevate DisplaySource to Core Firebase Domain and Compute in AiService

**Status:** done

- [x] In `src/app/features/image-analysis/image-analysis-panel/image-analysis-panel.component.html`, derive metadata directly from scoped `analysis` (`data()`), binding `[displaySource]="analysis.displaySource || 'Unknown'"` to `<app-thought-summary>` and accessing `analysis.source` directly if needed.
- [x] In `src/app/features/image-analysis/image-analysis-panel/image-analysis-panel.component.ts`, remove the standalone `source = input<InferenceSource | undefined>()` input and `displaySource = computed(...)` signal so all inference metadata derives solely from `data()`, and remove unused imports (`computed`, `InferenceSource`, `DisplaySource`).
- [x] In `src/app/features/image-analysis/image-analysis.component.ts` and `src/app/features/image-analysis/image-analysis.component.html`, remove the redundant `source = computed(() => this.analysisData()?.source)` signal, remove the unused `InferenceSource` import, and remove the `[source]="source()"` input binding on `<app-image-analysis-panel>`.
- [x] In `src/app/features/image-analysis/image-analysis-panel/image-analysis-panel.component.spec.ts`, update unit tests to verify `<app-thought-summary>` and panel metadata derive directly from `data.displaySource` and `data.source`, remove tests asserting standalone `source` input, and assert fallback to `'Unknown'` when `displaySource` is omitted.
- [x] Maintain repository standards: zero `!`, zero `../`, native `#` for private state/dependencies, and ensure all tests pass with `npx ng test --watch=false`.
