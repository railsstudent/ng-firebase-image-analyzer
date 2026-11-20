# 09: Calculate Cropped Aspect Ratio from Natural Image Dimensions

**What to build:** Ensure `ImageCropComponent` and `EnhancedCanvasComponent` share a single source of truth for **Cropped Aspect Ratio** and CSS crop styles in `VisualCalibrationService.buildCropStyles(...)`, keeping `VisualCalibrationService.calibrate(analysis)` pure and removing `cropImage` and `aspectRatio` from `VisualCalibrationResult`.

**Blocked by:** None (can start immediately)

**Status:** done

---

## Scope of Work

1. **Decouple `CropImageStyles` from `VisualCalibrationResult` (`visual-calibration.interface.ts` & `visual-calibration.service.ts`)**:
   - Remove `cropImage` and `aspectRatio` from `VisualCalibrationResult` (keeps `{ safeCrop, appliedFilters, cropPosition, filterStyle }`).
   - Remove `crop` from `CropImageStyles` (keeps `{ containerStyle, imageStyle }`).
   - Keep `calibrate(analysis)` pure (no `options` parameter).
   - Expose `buildCropStyles(crop?: Crop, naturalAspectRatio: number | null = null): CropImageStyles` to compute `containerStyle` (including 4-decimal **Cropped Aspect Ratio** with unrounded crop deltas, `'1'` pre-load fallback, and `naturalAspectRatio.toFixed(4)` when `crop` is `undefined`) and `imageStyle`.
2. **Child-to-parent `naturalAspectRatioChange` in `EnhancedCanvasComponent`**:
   - Accept `cropStyles = input.required<CropImageStyles>()` alongside `imageUrl` and `calibration`.
   - Remove `imageAspectRatio`, `containerAspectRatio`, and `containerCss`.
   - Add `naturalAspectRatioChange = output<number | null>()` emitted only from `onImageLoad()` (`img.naturalWidth / img.naturalHeight`) and `onImageError()` (`null`) — no `effect()`.
   - Bind `cropStyles().containerStyle.aspectRatio` on `.canvas-container` and `cropStyles().containerStyle` / `cropStyles().imageStyle` inside.
3. **Pass `aspectRatio` to `ImageCropComponent`**:
   - Accept `aspectRatio = input.required<string>()` alongside `calibration` and display `aspectRatio()`.
4. **`DownloadEnhancedDirective` fallback**:
   - Read `this.calibration().safeCrop ?? { xMin: 0, yMin: 0, xMax: 1, yMax: 1 }` instead of `this.calibration().cropImage.crop`.
5. **Recalculation in `ImageImprovementComponent`**:
   - Keep `calibration = computed(() => this.#imageEffect.calibrate(this.analysis()))`.
   - Store `naturalAspectRatio = signal<number | null>(null)` and compute `cropStyles = computed(() => this.#imageEffect.buildCropStyles(this.calibration().safeCrop, this.naturalAspectRatio()))`.
   - Pass `[aspectRatio]="cropStyles().containerStyle.aspectRatio"` to `<app-image-crop>` and `[cropStyles]="cropStyles()"` + `(naturalAspectRatioChange)="naturalAspectRatio.set($event)"` to `<app-enhanced-canvas>`.
6. **Unit tests & mock**: Update `visual-calibration.mock.ts` and specs for `VisualCalibrationService`, `EnhancedCanvasComponent`, `ImageCropComponent`, `DownloadEnhancedDirective`, and `ImageImprovementComponent`.

---

## Acceptance Criteria & Implementation Checklist

### 1. Decouple `CropImageStyles` and add `buildCropStyles` (`src/app/features/image-analysis/interfaces/visual-calibration.interface.ts` & `src/app/features/image-analysis/services/visual-calibration.service.ts`)

- [x] Remove `crop` from `CropImageStyles`, rename `CalibrateOptions` to `CropStyleOptions`, and remove `cropImage` and `aspectRatio` from `VisualCalibrationResult`.
- [x] Keep `calibrate(analysis)` pure (`{ safeCrop, appliedFilters, cropPosition, filterStyle }`).
- [x] Expose `buildCropStyles(crop?: Crop, options: CropStyleOptions = {}): CropImageStyles` to compute `containerStyle` (with 4-decimal **Cropped Aspect Ratio** using unrounded deltas, `'1'` pre-load fallback, and `naturalAspectRatio.toFixed(4)` when `crop` is `undefined`) and `imageStyle`.

```ts
// src/app/features/image-analysis/interfaces/visual-calibration.interface.ts
export interface CropImageStyles {
  containerStyle: ContainerStyle;
  imageStyle: ImageStyle;
}

export interface CropStyleOptions {
  naturalAspectRatio?: number | null;
  width?: number;
}

export interface VisualCalibrationResult {
  safeCrop: Crop | undefined;
  appliedFilters: AppliedFilterItem[];
  cropPosition: string;
  filterStyle: string;
}
```

```ts
// src/app/features/image-analysis/services/visual-calibration.service.ts
const DEFAULT_IMAGE_WIDTH = 100;
const ASPECT_RATIO_DECIMAL_PLACES = 4;

  calibrate(analysis?: Partial<ImageAnalysisResponse> | null): VisualCalibrationResult {
    const safeCrop = this.sanitizeCrop(analysis?.crop);
    const safeColorAdjustment = this.sanitizeColorAdjustments(analysis?.colorAdjustment);
    const filterStyle = this.getCssFilter(safeColorAdjustment);
    const cropPosition = safeCrop
      ? `X: ${safeCrop.xMin}–${safeCrop.xMax} | Y: ${safeCrop.yMin}–${safeCrop.yMax}`
      : 'N/A';

    return {
      safeCrop,
      appliedFilters: this.buildAppliedFilters(safeColorAdjustment),
      cropPosition,
      filterStyle,
    };
  }

  buildCropStyles(crop?: Crop, options: CropStyleOptions = {}): CropImageStyles {
    const { naturalAspectRatio = null, width = DEFAULT_IMAGE_WIDTH } = options;
    const safeCrop = crop || { xMin: 0.0, yMin: 0.0, xMax: 1.0, yMax: 1.0 };
    const cropWidth = +(safeCrop.xMax - safeCrop.xMin).toFixed(2);
    const cropHeight = +(safeCrop.yMax - safeCrop.yMin).toFixed(2);

    const imgWidth = crop ? toPercentString(1 / cropWidth) : '100%';
    const imgLeft = crop ? toPercentString(-(safeCrop.xMin / cropWidth)) : 'auto';
    const imgTop = crop ? toPercentString(-(safeCrop.yMin / cropHeight)) : 'auto';

    return {
      containerStyle: {
        position: crop ? 'relative' : 'static',
        aspectRatio: this.formatCroppedAspectRatio(safeCrop, naturalAspectRatio),
        overflow: 'hidden',
        width: `${width}%`,
      },
      imageStyle: {
        position: crop ? 'absolute' : 'static',
        width: imgWidth,
        left: imgLeft,
        top: imgTop,
        maxWidth: 'none',
        maxHeight: 'none',
      },
    };
  }

  private isValidAspectRatio(value?: number | null): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
  }

  private formatCroppedAspectRatio(crop: Crop, naturalAspectRatio?: number | null): string {
    if (!this.isValidAspectRatio(naturalAspectRatio)) {
      return '1';
    }

    const rawWidth = crop.xMax - crop.xMin;
    const rawHeight = crop.yMax - crop.yMin;
    return ((rawWidth / rawHeight) * naturalAspectRatio).toFixed(ASPECT_RATIO_DECIMAL_PLACES);
  }
```

---

### 2. Update `EnhancedCanvasComponent` (`src/app/features/image-analysis/enhanced-canvas/enhanced-canvas.component.ts` & `.html`)

- [x] Accept `cropStyles = input.required<CropImageStyles>()` alongside `imageUrl` and `calibration`.
- [x] Remove `DECIMAL_PLACES`, `imageAspectRatio`, `containerAspectRatio`, `containerCss`, and `cropImage`.
- [x] Add `naturalAspectRatioChange = output<number | null>()`, emitting `img.naturalWidth / img.naturalHeight` in `onImageLoad(event)` and `null` in `onImageError()`.
- [x] Bind `cropStyles().containerStyle.aspectRatio`, `cropStyles().containerStyle`, and `cropStyles().imageStyle`, plus `(error)="onImageError()"` on `<img>`.

```ts
import { DownloadEnhancedDirective } from '@/features/image-analysis/directives/download-enhanced.directive';
import type {
  CropImageStyles,
  VisualCalibrationResult,
} from '@/features/image-analysis/interfaces/visual-calibration.interface';
import { DownloadIconComponent } from '@/shared/ui/icons/download-icon/download-icon.component';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-enhanced-canvas',
  host: {
    class: 'block md:col-span-2 w-full',
  },
  imports: [DownloadEnhancedDirective, DownloadIconComponent],
  templateUrl: './enhanced-canvas.component.html',
  styleUrl: './enhanced-canvas.component.css',
})
export class EnhancedCanvasComponent {
  imageUrl = input<string | null>(null);
  calibration = input.required<VisualCalibrationResult>();
  cropStyles = input.required<CropImageStyles>();
  naturalAspectRatioChange = output<number | null>();

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
      this.naturalAspectRatioChange.emit(img.naturalWidth / img.naturalHeight);
    }
  }

  onImageError(): void {
    this.naturalAspectRatioChange.emit(null);
  }
}
```

```html
<div class="max-w-[400px] mx-auto">
  <div
    class="canvas-container border shadow-sm relative"
    [style.aspect-ratio]="cropStyles().containerStyle.aspectRatio"
  >
    @if (imageUrl(); as url) { @let wrapperStyle = cropStyles().containerStyle; @let imageStyle =
    cropStyles().imageStyle; @if (wrapperStyle && imageStyle) {
    <div [style]="wrapperStyle">
      <img
        style="display: block"
        [src]="url"
        (load)="onImageLoad($event)"
        (error)="onImageError()"
        [style.filter]="calibration().filterStyle"
        alt="Cropped subject"
        [style]="imageStyle"
      />
    </div>
  </div>
</div>
```

---

### 3. Pass `aspectRatio` to `ImageCropComponent` and update `DownloadEnhancedDirective`

- [x] In `src/app/features/image-analysis/image-crop/image-crop.component.ts` & `.html`: accept `aspectRatio = input.required<string>()` alongside `calibration`, and bind `{{ aspectRatio() }}`.
- [x] In `src/app/features/image-analysis/directives/download-enhanced.directive.ts`: replace `this.calibration().cropImage.crop` with `this.calibration().safeCrop ?? { xMin: 0, yMin: 0, xMax: 1, yMax: 1 }`.

---

### 4. Recalculate `cropStyles` via `naturalAspectRatio` signal (`src/app/features/image-analysis/image-improvement/image-improvement.component.ts` & `.html`)

- [x] Keep `calibration` as `computed(() => this.#imageEffect.calibrate(this.analysis()))`.
- [x] Add `naturalAspectRatio = signal<number | null>(null)` and `cropStyles = computed(() => this.#imageEffect.buildCropStyles(this.calibration().safeCrop, this.naturalAspectRatio()))`.
- [x] Pass `[aspectRatio]="cropStyles().containerStyle.aspectRatio"` to `<app-image-crop>` and `[cropStyles]="cropStyles()"` + `(naturalAspectRatioChange)="naturalAspectRatio.set($event)"` to `<app-enhanced-canvas>`.

```ts
  naturalAspectRatio = signal<number | null>(null);
  readonly calibration = computed(() => this.#imageEffect.calibrate(this.analysis()));
  readonly cropStyles = computed(() =>
    this.#imageEffect.buildCropStyles(this.calibration().safeCrop, this.naturalAspectRatio()),
  );
```

```html
<app-image-crop [calibration]="calibration()" [aspectRatio]="cropStyles().containerStyle.aspectRatio" />

<!-- Enhanced Canvas -->
<app-enhanced-canvas
  [imageUrl]="imageUrl()"
  [calibration]="calibration()"
  [cropStyles]="cropStyles()"
  (naturalAspectRatioChange)="naturalAspectRatio.set($event)"
/>
```

---

### 5. Update mocks and unit tests

- [x] `src/testing/visual-calibration.mock.ts`: update `createMockCalibration` (remove `cropImage` and `aspectRatio`) and add `createMockCropStyles`.
- [x] `src/app/features/image-analysis/services/visual-calibration.service.spec.ts`: test `calibrate(analysis)` independently from `buildCropStyles(crop, options)` (pre-load `'1'`, valid 4-decimal unrounded deltas, invalid `naturalAspectRatio`, and `crop: undefined` with valid `naturalAspectRatio`).
- [x] `src/app/features/image-analysis/enhanced-canvas/enhanced-canvas.component.spec.ts`: pass `cropStyles` input, verify `.canvas-container` `[style.aspect-ratio]` binding, `onImageLoad` output emission, and `onImageError` `null` emission.
- [x] `src/app/features/image-analysis/image-crop/image-crop.component.spec.ts`: pass `aspectRatio` input and verify rendered text.
- [x] `src/app/features/image-analysis/directives/download-enhanced.directive.spec.ts`: verify fallback to `{ xMin: 0, yMin: 0, xMax: 1, yMax: 1 }` when `safeCrop` is `undefined`.
- [x] `src/app/features/image-analysis/image-improvement/image-improvement.component.spec.ts`: verify `calibration()` remains `computed` and `cropStyles()` recalculates on `naturalAspectRatioChange` (numeric ratio and `null`).

---

## Verification

- [x] Run targeted unit tests for each changed spec file:
  - `npm run test:spec -- src/app/features/image-analysis/services/visual-calibration.service.spec.ts`
  - `npm run test:spec -- src/app/features/image-analysis/enhanced-canvas/enhanced-canvas.component.spec.ts`
  - `npm run test:spec -- src/app/features/image-analysis/image-crop/image-crop.component.spec.ts`
  - `npm run test:spec -- src/app/features/image-analysis/directives/download-enhanced.directive.spec.ts`
  - `npm run test:spec -- src/app/features/image-analysis/image-improvement/image-improvement.component.spec.ts`
- [x] Run `npm run lint` and `npm run test:once`.
