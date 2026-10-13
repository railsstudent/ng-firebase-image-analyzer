# 05: Consolidate Image Crop Component Inputs and Expand Specs

**What to build:** Refactor `ImageCropComponent` to accept a single consolidated `calibration = input.required<VisualCalibrationResult>()` input instead of three separate inputs (`colorAdjustment`, `aspectRatio`, and `cropPosition`). Update `appliedFilters` to derive from `this.calibration().safeColorAdjustment`. Update `src/app/features/image-analysis/image-crop/image-crop.component.html` to access `calibration().cropPosition` and `calibration().aspectRatio`. Update `ImageImprovementComponent`'s template to pass `[calibration]="calibration()"` to `<app-image-crop>`. Expand `image-crop.component.spec.ts` with comprehensive unit tests for metadata rendering, filter formatting, and fallback handling.

**Blocked by:** 02 (Deepen Visual Calibration Service and Simplify Improvement Component)

**Status:** done

- [x] Refactor `ImageCropComponent` in `src/app/features/image-analysis/image-crop/image-crop.component.ts` to accept `calibration = input.required<VisualCalibrationResult>()` and replace separate inputs `colorAdjustment`, `aspectRatio`, and `cropPosition`.
- [x] Update `appliedFilters` computed signal to map entries from `this.calibration().safeColorAdjustment`.
- [x] Update `src/app/features/image-analysis/image-crop/image-crop.component.html` to reference `calibration().cropPosition` and `calibration().aspectRatio`.
- [x] Update `src/app/features/image-analysis/image-improvement/image-improvement.component.html` to pass `[calibration]="calibration()"` to `<app-image-crop>`.
- [x] Expand `src/app/features/image-analysis/image-crop/image-crop.component.spec.ts` with comprehensive unit tests:
  - Rendering crop metadata (`cropPosition` and `aspectRatio`) correctly in the DOM.
  - Rendering the filters list with formatted labels and numerical adjustment values when `safeColorAdjustment` is present.
  - Rendering fallback `'N/A'` when `safeColorAdjustment` is undefined or individual values are missing.
- [x] Run `npm run lint` and `npm run test:once` to verify zero violations and passing test suite.
