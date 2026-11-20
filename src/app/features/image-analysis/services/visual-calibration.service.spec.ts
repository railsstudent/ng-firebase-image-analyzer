import { TestBed } from '@angular/core/testing';
import { VisualCalibrationService } from './visual-calibration.service';
import type { VisualCalibrationResult } from '@/features/image-analysis/interfaces/visual-calibration.interface';

const DEFAULT_APPLIED_FILTERS: VisualCalibrationResult['appliedFilters'] = [
  { label: 'Brightness', value: 'N/A' },
  { label: 'Saturation', value: 'N/A' },
  { label: 'Contrast', value: 'N/A' },
  { label: 'Warmth', value: 'N/A' },
];

describe('VisualCalibrationService', () => {
  let service: VisualCalibrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisualCalibrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calibrate', () => {
    it('should return safe defaults when analysis is undefined or null', () => {
      const resultNull = service.calibrate(null);
      expect(resultNull.safeCrop).toBeUndefined();
      expect(resultNull.appliedFilters).toEqual(DEFAULT_APPLIED_FILTERS);
      expect(resultNull.cropPosition).toBe('N/A');
      expect(resultNull.filterStyle).toBe('');

      const resultUndefined = service.calibrate(undefined);
      expect(resultUndefined.safeCrop).toBeUndefined();
      expect(resultUndefined.appliedFilters).toEqual(DEFAULT_APPLIED_FILTERS);
      expect(resultUndefined.cropPosition).toBe('N/A');
    });

    it('should calculate complete calibration result when valid analysis is provided', () => {
      const result = service.calibrate({
        crop: { xMin: 0.1, yMin: 0.2, xMax: 0.9, yMax: 0.8 },
        colorAdjustment: { brightness: 1.2, saturation: 1.1, contrast: 0.9, warmth: 0.2 },
      });

      expect(result.safeCrop).toEqual({ xMin: 0.1, yMin: 0.2, xMax: 0.9, yMax: 0.8 });
      expect(result.cropPosition).toBe('X: 0.1–0.9 | Y: 0.2–0.8');
      expect(result.appliedFilters).toEqual([
        { label: 'Brightness', value: 1.2 },
        { label: 'Saturation', value: 1.1 },
        { label: 'Contrast', value: 0.9 },
        { label: 'Warmth', value: 0.2 },
      ]);
      expect(result.filterStyle).toContain('brightness(1.2)');
      expect(result.filterStyle).toContain('saturate(1.1)');
    });

    it('should set safeCrop to undefined when crop delta is invalid (< 0.1)', () => {
      const result = service.calibrate({
        crop: { xMin: 0.1, yMin: 0.2, xMax: 0.15, yMax: 0.8 }, // width delta = 0.05
      });

      expect(result.safeCrop).toBeUndefined();
      expect(result.cropPosition).toBe('N/A');
    });
  });

  describe('buildCropStyles', () => {
    it('should return default static styles and aspectRatio "1" when crop and naturalAspectRatio are missing', () => {
      const styles = service.buildCropStyles(undefined);

      expect(styles.containerStyle).toEqual({
        position: 'static',
        aspectRatio: '1',
        overflow: 'hidden',
        width: '100%',
      });
      expect(styles.imageStyle).toEqual({
        position: 'static',
        width: '100%',
        left: 'auto',
        top: 'auto',
        maxWidth: 'none',
        maxHeight: 'none',
      });
    });

    it('should calculate crop image positioning with pre-load aspectRatio "1" when naturalAspectRatio is missing', () => {
      const styles = service.buildCropStyles({ xMin: 0.1, yMin: 0.2, xMax: 0.9, yMax: 0.8 });

      expect(styles.containerStyle).toEqual({
        position: 'relative',
        aspectRatio: '1',
        overflow: 'hidden',
        width: '100%',
      });
      expect(styles.imageStyle).toEqual({
        position: 'absolute',
        width: '125.00%',
        left: '-12.50%',
        top: '-33.33%',
        maxWidth: 'none',
        maxHeight: 'none',
      });
    });

    it('should calculate 4-decimal cropped aspect ratio using unrounded crop deltas when naturalAspectRatio is valid', () => {
      const styles = service.buildCropStyles({ xMin: 0.125, yMin: 0.25, xMax: 0.5, yMax: 0.75 }, 16 / 9);

      // (0.375 / 0.5) * (16 / 9) = 1.3333...
      expect(styles.containerStyle.aspectRatio).toBe('1.3333');
    });

    it('should fallback to "1" when naturalAspectRatio is invalid', () => {
      const crop = { xMin: 0.1, yMin: 0.2, xMax: 0.9, yMax: 0.8 };

      for (const naturalAspectRatio of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
        const styles = service.buildCropStyles(crop, naturalAspectRatio);
        expect(styles.containerStyle.aspectRatio).toBe('1');
      }
    });

    it('should set containerStyle.aspectRatio to naturalAspectRatio when crop is undefined and naturalAspectRatio is valid', () => {
      const styles = service.buildCropStyles(undefined, 16 / 9);

      expect(styles.containerStyle.position).toBe('static');
      expect(styles.containerStyle.aspectRatio).toBe('1.7778');
    });
  });
});
