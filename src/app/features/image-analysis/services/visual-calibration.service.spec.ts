import { TestBed } from '@angular/core/testing';
import { VisualCalibrationService } from './visual-calibration.service';

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
      expect(resultNull.safeColorAdjustment).toBeUndefined();
      expect(resultNull.cropPosition).toBe('N/A');
      expect(resultNull.filterStyle).toBe('');
      expect(resultNull.aspectRatio).toBe('auto');

      const resultUndefined = service.calibrate(undefined);
      expect(resultUndefined.safeCrop).toBeUndefined();
      expect(resultUndefined.safeColorAdjustment).toBeUndefined();
      expect(resultUndefined.cropPosition).toBe('N/A');
    });

    it('should calculate complete calibration result when valid analysis is provided', () => {
      const result = service.calibrate({
        crop: { xMin: 0.1, yMin: 0.2, xMax: 0.9, yMax: 0.8 },
        colorAdjustment: { brightness: 1.2, saturation: 1.1, contrast: 0.9, warmth: 0.2 },
      });

      expect(result.safeCrop).toEqual({ xMin: 0.1, yMin: 0.2, xMax: 0.9, yMax: 0.8 });
      expect(result.cropPosition).toBe('X: 0.1–0.9 | Y: 0.2–0.8');
      expect(result.safeColorAdjustment).toEqual({
        brightness: 1.2,
        saturation: 1.1,
        contrast: 0.9,
        warmth: 0.2,
      });
      expect(result.filterStyle).toContain('brightness(1.2)');
      expect(result.filterStyle).toContain('saturate(1.1)');
      expect(result.aspectRatio).toBe('0.8 / 0.6');
      expect(result.cropImage.containerStyle.overflow).toBe('hidden');
    });

    it('should fallback to safe default crop styles when crop delta is invalid (< 0.1)', () => {
      const result = service.calibrate({
        crop: { xMin: 0.1, yMin: 0.2, xMax: 0.15, yMax: 0.8 }, // width delta = 0.05
      });

      expect(result.safeCrop).toBeUndefined();
      expect(result.cropPosition).toBe('N/A');
      expect(result.aspectRatio).toBe('auto');
      expect(result.cropImage.containerStyle.position).toBe('static');
    });
  });
});
