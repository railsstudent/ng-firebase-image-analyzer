import type {
  CropImageStyles,
  VisualCalibrationResult,
} from '@/features/image-analysis/interfaces/visual-calibration.interface';

export function createMockCalibration(overrides: Partial<VisualCalibrationResult> = {}): VisualCalibrationResult {
  return {
    safeCrop: { xMin: 0.1, yMin: 0.2, xMax: 0.7, yMax: 0.8 },
    appliedFilters: [],
    cropPosition: 'X: 0.1–0.7 | Y: 0.2–0.8',
    filterStyle: '',
    ...overrides,
  };
}

export function createMockCropStyles(overrides: Partial<CropImageStyles> = {}): CropImageStyles {
  return {
    containerStyle: {
      position: 'relative',
      aspectRatio: '1',
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
    ...overrides,
  };
}
