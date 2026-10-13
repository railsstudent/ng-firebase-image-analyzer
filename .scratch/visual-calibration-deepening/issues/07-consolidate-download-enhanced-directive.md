# 07: Consolidate Download Enhanced Directive with Precomputed Calibration

**What to build:** Refactor `DownloadEnhancedDirective` to accept a single consolidated `calibration = input.required<VisualCalibrationResult>()` input instead of separate `crop` and `filter` inputs. Update `ImageDownloadOptions` to accept `filterStyle: string` directly, allowing `ImageDownloadService` to use the pre-computed CSS filter string without injecting `VisualCalibrationService`. Remove redundant computed signals (`crop`, `colorAdjustment`, `filterStyle`) while retaining `cropImage` in `EnhancedCanvasComponent`, and pass `[calibration]="calibration()"` in its template. Expand and update unit tests in `download-enhanced.directive.spec.ts`, `enhanced-canvas.component.spec.ts`, and `image-download.service.spec.ts`.

**Blocked by:** 06 (Quantize Canvas Crop Coordinates to Integer Pixels)

**Status:** done

- [x] In `src/app/features/image-analysis/interfaces/image-download-options.interface.ts`:
  - Update `ImageDownloadOptions` to replace `filter: ColorAdjustment | undefined` with `filterStyle: string`.
- [x] In `src/app/features/image-analysis/services/image-download.service.ts`:
  - Remove `VisualCalibrationService` injection dependency.
  - In `downloadFilteredCrop`, consume `options.filterStyle` directly for `renderCroppedCanvas`.
- [x] In `src/app/features/image-analysis/directives/download-enhanced.directive.ts`:
  - Replace `crop` and `filter` inputs with `calibration = input.required<VisualCalibrationResult>()`.
  - In `onClick()`, pass `crop: this.calibration().cropImage.crop` and `filterStyle: this.calibration().filterStyle` to `ImageDownloadService.downloadFilteredCrop`.
- [x] In `src/app/features/image-analysis/enhanced-canvas/enhanced-canvas.component.ts`:
  - Remove redundant `crop`, `colorAdjustment`, and `filterStyle` computed signals while keeping `cropImage` computed signal.
- [x] In `src/app/features/image-analysis/enhanced-canvas/enhanced-canvas.component.html`:
  - Update `@let imageStyle` to read `cropImage().imageStyle`.
  - Update `[style.filter]` to bind `calibration().filterStyle` directly.
  - Update the download button to pass `[calibration]="calibration()"`.
- [x] In `src/app/features/image-analysis/enhanced-canvas/enhanced-canvas.component.spec.ts`:
  - Remove obsolete unit tests for removed `filterStyle()` computed property.
- [x] In `src/app/features/image-analysis/directives/download-enhanced.directive.spec.ts`:
  - Update `TestHostComponent` to bind `[calibration]="calibration"` with mock `VisualCalibrationResult`.
  - Type `mockImageDownloadService` with `Partial<ImageDownloadService>` and verify with `satisfies Partial<ImageDownloadService>`.
  - Add test asserting click triggers `downloadFilteredCrop` with the unpacked crop and precomputed filterStyle.
- [x] In `src/app/features/image-analysis/services/image-download.service.spec.ts`:
  - Remove `VisualCalibrationService` from `TestBed` providers and update test options to pass `filterStyle`.
  - Add test asserting `'none'` fallback filter when `filterStyle` is empty.
- [x] Run `npm run lint` and `npm run test:once` to verify zero violations and all tests passing.
