# 18: Elevate DisplaySource to Core Firebase Domain and Compute in AiService

**What to build:** Move the `DisplaySource` domain type from the image analysis feature layer to `@/core/firebase`, extend `InferenceMetadata` to include `displaySource?: DisplaySource`, and automatically compute the human-readable display string (`'Gemini Nano'` for `'on_device'`, `'Cloud AI'` for `'in_cloud'`, `'Unknown'` otherwise) inside `AiService.extractInferenceMetadata()` when `generateContentStream()` resolves. Provide fallback metadata with `displaySource: 'Gemini Nano'` in `CulinaryGuideService.extractChunk()`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] In `src/app/core/firebase/display-source.type.ts`, define and export `export type DisplaySource = 'Gemini Nano' | 'Cloud AI' | 'Unknown'`.
- [ ] Add `displaySource?: DisplaySource` property to `InferenceMetadata` in `src/app/core/firebase/inference-metadata.interface.ts`.
- [ ] Re-export `DisplaySource` and `InferenceMetadata` via `src/app/core/firebase/index.ts`.
- [ ] In `AiService.extractInferenceMetadata()` (`src/app/core/firebase/ai.service.ts`), compute `displaySource: DisplaySource` based on `response?.inferenceSource` and assign it to the returned `InferenceMetadata`.
- [ ] In `src/app/core/culinary-guide/culinary-guide.service.ts`, ensure `extractChunk()` sets `displaySource: 'Gemini Nano'` on default fallback `inferenceMetadata`.
- [ ] Update `src/app/core/firebase/ai.service.spec.ts` to assert that `inferenceMetadata.displaySource` is populated as `'Gemini Nano'` for on-device inference and `'Cloud AI'` for in-cloud inference.
- [ ] Maintain repository standards: zero `!`, zero `../`, native `#` for private state/dependencies, and ensure all tests pass with `npx ng test --watch=false`.
