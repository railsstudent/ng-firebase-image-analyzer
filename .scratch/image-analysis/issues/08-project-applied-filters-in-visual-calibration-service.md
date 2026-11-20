# 08: Project `appliedFilters` in `VisualCalibrationService` and Decouple `ImageCropComponent`

**What to build:** Move the `{ label, value }` filter-row projection out of `ImageCropComponent` into `VisualCalibrationService.calibrate()` and expose `appliedFilters` on `VisualCalibrationResult` (replacing `safeColorAdjustment`), so `ImageCropComponent` renders the filter list without importing or knowing `ColorAdjustment`'s key list.

**Blocked by:** None (can start immediately)

**Status:** done

---

## Acceptance Criteria & Implementation Checklist

### 1. Replace `safeColorAdjustment` with `appliedFilters` in `VisualCalibrationResult` (`src/app/features/image-analysis/interfaces/visual-calibration.interface.ts`)

- [x] Add `AppliedFilterItem` and replace `safeColorAdjustment` with `appliedFilters` on `VisualCalibrationResult`.

```ts
import type { Crop } from '@/core/image-analysis';

export interface AppliedFilterItem {
  label: string;
  value: number | string;
}

// ... existing ContainerStyle, ImageStyle, CropImageStyles ...

export interface VisualCalibrationResult {
  safeCrop: Crop | undefined;
  appliedFilters: AppliedFilterItem[];
  cropImage: CropImageStyles;
  aspectRatio: string;
  cropPosition: string;
  filterStyle: string;
}
```

### 2. Build `appliedFilters` inside `VisualCalibrationService` (`src/app/features/image-analysis/services/visual-calibration.service.ts`)

- [x] Import `AppliedFilterItem` and add a private `buildAppliedFilters(adjustment?: ColorAdjustment): AppliedFilterItem[]` helper.
- [x] Return `appliedFilters: this.buildAppliedFilters(safeColorAdjustment)` from `calibrate(...)` instead of `safeColorAdjustment`.

```ts
private buildAppliedFilters(adjustment?: ColorAdjustment): AppliedFilterItem[] {
  const keys: (keyof ColorAdjustment)[] = ['brightness', 'saturation', 'contrast', 'warmth'];

  return keys.map((key) => ({
    label: `${key.charAt(0).toUpperCase()}${key.slice(1)}`,
    value: adjustment?.[key] ?? 'N/A',
  }));
}
```

And in `calibrate(...)`:

```ts
return {
  safeCrop,
  appliedFilters: this.buildAppliedFilters(safeColorAdjustment),
  cropImage,
  aspectRatio: cropImage.containerStyle.aspectRatio,
  cropPosition,
  filterStyle,
};
```

### 3. Remove `ColorAdjustment` coupling from `ImageCropComponent` (`src/app/features/image-analysis/image-crop/image-crop.component.ts` & `.html`)

- [x] Remove `ColorAdjustment`, `computed`, and the `appliedFilters` `computed()` signal from `image-crop.component.ts`.

```ts
import type { VisualCalibrationResult } from '@/features/image-analysis/interfaces/visual-calibration.interface';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-image-crop',
  host: {
    class: 'block md:col-span-1',
  },
  templateUrl: './image-crop.component.html',
  styleUrl: './image-crop.component.css',
})
export class ImageCropComponent {
  calibration = input.required<VisualCalibrationResult>();
}
```

- [x] Update `image-crop.component.html` line 20 to iterate over `calibration().appliedFilters`:

```html
@for (item of calibration().appliedFilters; track item.label) {
<li class="flex justify-between">
  <span class="font-semibold text-on-surface">{{ item.label }}:</span>
  {{ item.value }}
</li>
}
```

### 4. Update `VisualCalibrationService` unit tests (`src/app/features/image-analysis/services/visual-calibration.service.spec.ts`)

- [x] Replace `safeColorAdjustment` assertions with `appliedFilters` assertions for both `null`/`undefined` fallback (`'N/A'`) and populated `colorAdjustment`.

```ts
// In 'should return safe defaults when analysis is undefined or null':
expect(resultNull.appliedFilters).toEqual([
  { label: 'Brightness', value: 'N/A' },
  { label: 'Saturation', value: 'N/A' },
  { label: 'Contrast', value: 'N/A' },
  { label: 'Warmth', value: 'N/A' },
]);
// Same for resultUndefined:
expect(resultUndefined.appliedFilters).toEqual([
  { label: 'Brightness', value: 'N/A' },
  { label: 'Saturation', value: 'N/A' },
  { label: 'Contrast', value: 'N/A' },
  { label: 'Warmth', value: 'N/A' },
]);

// In 'should calculate complete calibration result when valid analysis is provided':
expect(result.appliedFilters).toEqual([
  { label: 'Brightness', value: 1.2 },
  { label: 'Saturation', value: 1.1 },
  { label: 'Contrast', value: 0.9 },
  { label: 'Warmth', value: 0.2 },
]);
```

### 5. Update `ImageCropComponent` unit tests (`src/app/features/image-analysis/image-crop/image-crop.component.spec.ts`)

- [x] Update `createMockCalibration` to accept `appliedFilters: VisualCalibrationResult['appliedFilters']` instead of `safeColorAdjustment`.
- [x] Update the two filter tests to assert rendered DOM items (`'.specs-box:nth-child(2) li'`) instead of `component.appliedFilters()` (which moved to `VisualCalibrationService`).

```ts
const DEFAULT_APPLIED_FILTERS: VisualCalibrationResult['appliedFilters'] = [
  { label: 'Brightness', value: 'N/A' },
  { label: 'Saturation', value: 'N/A' },
  { label: 'Contrast', value: 'N/A' },
  { label: 'Warmth', value: 'N/A' },
];

const createMockCalibration = (
  appliedFilters: VisualCalibrationResult['appliedFilters'] = DEFAULT_APPLIED_FILTERS,
  cropPosition = 'X: 0.1–0.9 | Y: 0.2–0.8',
  aspectRatio = '16 / 9',
): VisualCalibrationResult => ({
  safeCrop: { xMin: 0.1, yMin: 0.2, xMax: 0.9, yMax: 0.8 },
  appliedFilters,
  cropImage: {
    containerStyle: { position: 'relative', aspectRatio, overflow: 'hidden', width: '100%' },
    imageStyle: {
      position: 'absolute',
      width: '125%',
      left: '-12.5%',
      top: '-33.33%',
      maxWidth: 'none',
      maxHeight: 'none',
    },
    crop: { xMin: 0.1, yMin: 0.2, xMax: 0.9, yMax: 0.8 },
  },
  aspectRatio,
  cropPosition,
  filterStyle: '',
});
```

And update the two filter test cases:

```ts
it('should render applied filter labels and values from calibration.appliedFilters', async () => {
  const populatedCalibration = createMockCalibration([
    { label: 'Brightness', value: 1.25 },
    { label: 'Saturation', value: 1.5 },
    { label: 'Contrast', value: 0.85 },
    { label: 'Warmth', value: 0.4 },
  ]);

  fixture.componentRef.setInput('calibration', populatedCalibration);
  fixture.detectChanges();
  await fixture.whenStable();

  const items = fixture.debugElement.queryAll(By.css('.specs-box:nth-child(2) li'));
  expect(items.length).toBe(4);
  expect(items[0].nativeElement.textContent).toContain('Brightness: 1.25');
  expect(items[1].nativeElement.textContent).toContain('Saturation: 1.5');
  expect(items[2].nativeElement.textContent).toContain('Contrast: 0.85');
  expect(items[3].nativeElement.textContent).toContain('Warmth: 0.4');
});

it('should display "N/A" fallback for all filters when calibration.appliedFilters has N/A values', async () => {
  const emptyCalibration = createMockCalibration();
  fixture.componentRef.setInput('calibration', emptyCalibration);
  fixture.detectChanges();
  await fixture.whenStable();

  const items = fixture.debugElement.queryAll(By.css('.specs-box:nth-child(2) li'));
  expect(items.length).toBe(4);
  items.forEach((item) => {
    expect(item.nativeElement.textContent).toContain('N/A');
  });
});
```

### 6. Update `VisualCalibrationResult` mock literals in sibling specs

- [x] Replace `safeColorAdjustment: { ... }` with `appliedFilters: []` in `mockCalibration` inside:
  - `src/app/features/image-analysis/directives/download-enhanced.directive.spec.ts` (line 10)
  - `src/app/features/image-analysis/enhanced-canvas/enhanced-canvas.component.spec.ts` (line 15)

### 7. Extract shared `createMockCalibration` factory (`src/testing/visual-calibration.mock.ts`)

- [x] Create `src/testing/visual-calibration.mock.ts` exporting `createMockCalibration(overrides: Partial<VisualCalibrationResult> = {}): VisualCalibrationResult` so `VisualCalibrationResult` contract changes only touch one mock factory.

```ts
import type { VisualCalibrationResult } from '@/features/image-analysis/interfaces/visual-calibration.interface';

export function createMockCalibration(overrides: Partial<VisualCalibrationResult> = {}): VisualCalibrationResult {
  return {
    safeCrop: { xMin: 0.1, yMin: 0.2, xMax: 0.7, yMax: 0.8 },
    appliedFilters: [],
    cropImage: {
      containerStyle: {
        position: 'relative',
        aspectRatio: '0.6 / 0.6',
        overflow: 'hidden',
        width: '100%',
      },
      imageStyle: {
        position: 'absolute',
        width: '166.67%',
        left: '-16.67%',
        top: '-33.33%',
        maxWidth: 'none',
        maxHeight: 'none',
      },
      crop: { xMin: 0.1, yMin: 0.2, xMax: 0.7, yMax: 0.8 },
    },
    aspectRatio: '0.6 / 0.6',
    cropPosition: 'X: 0.1–0.7 | Y: 0.2–0.8',
    filterStyle: '',
    ...overrides,
  };
}
```

- [x] Replace local `mockCalibration` / `createMockCalibration` literals with `createMockCalibration(...)` in:
  - `src/app/features/image-analysis/image-crop/image-crop.component.spec.ts`
  - `src/app/features/image-analysis/directives/download-enhanced.directive.spec.ts`
  - `src/app/features/image-analysis/enhanced-canvas/enhanced-canvas.component.spec.ts`

### 8. Verification

- [x] Run `npx ng test --include="src/app/features/image-analysis/**/*.spec.ts" --no-watch` (or `angular-cli` `run_target` `test`) and confirm all specs pass.
- [x] Run `npx ng lint` (or `angular-cli` `run_target` `lint`) and confirm zero errors.
