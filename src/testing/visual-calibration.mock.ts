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
