# 02: Deepen Visual Calibration Service and Simplify Improvement Component

**What to build:**

1. Create `src/app/features/image-analysis/interfaces/visual-calibration.interface.ts` merging `CropImageStyles` (retaining internal helper styles `ContainerStyle` and `ImageStyle` unexported) and the new `VisualCalibrationResult` interface. Update imports in `enhanced-canvas.component.ts` and `visual-calibration.service.ts`, and remove `src/app/features/image-analysis/interfaces/crop-image.interface.ts`.
2. Deepen `VisualCalibrationService` by adding a cohesive `calibrate()` method that encapsulates crop sanitization, color adjustment clamping, CSS filter composition, container/image styling calculation, and crop coordinate string formatting.
3. Refactor `ImageImprovementComponent` so its `calibration` computed signal delegates to this single call, reducing orchestration ceremony to one line.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Define `VisualCalibrationResult` and `CropImageStyles` in `src/app/features/image-analysis/interfaces/visual-calibration.interface.ts` (keeping internal `ContainerStyle` and `ImageStyle` unexported), update imports, and delete `src/app/features/image-analysis/interfaces/crop-image.interface.ts`.
- [x] Implement `calibrate(analysis: Partial<ImageAnalysisResponse> | null, width?: number): VisualCalibrationResult` in `src/app/features/image-analysis/services/visual-calibration.service.ts`.
- [x] Refactor `ImageImprovementComponent` in `src/app/features/image-analysis/image-improvement/image-improvement.component.ts` to use `computed(() => this.#imageEffect.calibrate(this.analysis()))`.
- [x] Update `src/app/features/image-analysis/services/visual-calibration.service.spec.ts` to test `calibrate()` with complete data, null/undefined inputs, and invalid/out-of-bounds crops.
- [x] Update `src/app/features/image-analysis/image-improvement/image-improvement.component.spec.ts` to verify the simplified computed signal behavior.
- [x] Run `npm run lint` and `npm run test:once` to verify no breaking changes.
