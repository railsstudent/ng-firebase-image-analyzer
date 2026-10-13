# 03: Consolidate Enhanced Canvas Inputs and Expand Specs

**What to build:** Refactor `EnhancedCanvasComponent` to consolidate three separate calibration inputs (`cropImage`, `colorAdjustment`, and `filterStyle`) into a single `calibration = input.required<VisualCalibrationResult>()` input. Update `ImageImprovementComponent`'s template to pass `[calibration]="calibration()"`. Significantly expand `enhanced-canvas.component.spec.ts` from a basic smoke test to a comprehensive unit test suite covering aspect ratio calculation, style derivations, and template rendering states.

**Blocked by:** 02 (Deepen Visual Calibration Service and Simplify Improvement Component)

**Status:** done

- [x] Refactor `EnhancedCanvasComponent` in `src/app/features/image-analysis/enhanced-canvas/enhanced-canvas.component.ts` to accept `calibration = input.required<VisualCalibrationResult>()` and derive `cropImage`, `colorAdjustment`, and `filterStyle` as computed signals (`cropImage = computed(() => this.calibration().cropImage)`, `colorAdjustment = computed(() => this.calibration().safeColorAdjustment)`, `filterStyle = computed(() => this.calibration().filterStyle)`).
- [x] Note on types: `CropImageStyles` remains exported from `visual-calibration.interface.ts` as `cropImage` in `VisualCalibrationService` returns it.
- [x] Maintain `src/app/features/image-analysis/enhanced-canvas/enhanced-canvas.component.html` binding to computed signals derived from `calibration()`.
- [x] Update `src/app/features/image-analysis/image-improvement/image-improvement.component.html` to pass `[calibration]="calibration()"` to `<app-enhanced-canvas>`.
- [x] Expand `src/app/features/image-analysis/enhanced-canvas/enhanced-canvas.component.spec.ts` with comprehensive unit tests:
  - Default square aspect ratio (`'1'`) before image is loaded
  - Dynamic aspect ratio and container CSS recalculation on `onImageLoad` with image dimensions
  - Proper derivation of `filterStyle` and `imageCss` from the `calibration` input
  - Template states: placeholder when `imageUrl` is null vs. rendering enhanced image preview and download button when URL is provided
- [x] Run `npm run lint` and `npm run test:once` to verify no breaking changes.
