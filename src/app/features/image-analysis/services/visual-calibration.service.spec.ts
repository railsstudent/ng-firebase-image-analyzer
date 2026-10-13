import { ColorAdjustment, Crop } from '@/core/image-analysis';
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

  describe('sanitizeColorAdjustments', () => {
    it('should return undefined when no adjustment is provided', () => {
      expect(service.sanitizeColorAdjustments(undefined)).toBeUndefined();
    });

    // Parameterized test for boundary and clamping metrics
    const adjustmentCases = [
      {
        description: 'valid parameters unchanged',
        input: { brightness: 1.2, saturation: 1.5, contrast: 0.8, warmth: 0.3 },
        expected: { brightness: 1.2, saturation: 1.5, contrast: 0.8, warmth: 0.3 },
      },
      {
        description: 'underflow clamp values',
        input: { brightness: 0.1, saturation: -0.5, contrast: 0.2, warmth: -0.1 },
        expected: { brightness: 0.5, saturation: 0.0, contrast: 0.5, warmth: 0.0 },
      },
      {
        description: 'overflow clamp values',
        input: { brightness: 3.5, saturation: 2.5, contrast: 3.0, warmth: 1.5 },
        expected: { brightness: 2.0, saturation: 2.0, contrast: 2.0, warmth: 1.0 },
      },
    ];

    test.each(adjustmentCases)('should clamp $description', ({ input, expected }) => {
      const sanitized = service.sanitizeColorAdjustments(input as ColorAdjustment);
      expect(sanitized).toEqual(expected);
    });
  });

  describe('sanitizeCrop', () => {
    it('should return undefined when no crop is provided', () => {
      expect(service.sanitizeCrop(undefined)).toBeUndefined();
    });

    const cropCases = [
      {
        description: 'valid crop unchanged',
        input: { xMin: 0.1, yMin: 0.2, xMax: 0.8, yMax: 0.9 },
        expected: { xMin: 0.1, yMin: 0.2, xMax: 0.8, yMax: 0.9 },
      },
      {
        description: 'clamped boundary crop coordinates',
        input: { xMin: -0.5, yMin: -0.2, xMax: 1.5, yMax: 1.3 },
        expected: { xMin: 0.0, yMin: 0.0, xMax: 1.0, yMax: 1.0 },
      },
      {
        description: 'flipped coordinates normalized',
        input: { xMin: 0.8, yMin: 0.9, xMax: 0.2, yMax: 0.3 },
        expected: { xMin: 0.2, yMin: 0.3, xMax: 0.8, yMax: 0.9 },
      },
    ];

    test.each(cropCases)('should normalize and clamp $description', ({ input, expected }) => {
      const sanitized = service.sanitizeCrop(input as Crop);
      expect(sanitized).toEqual(expected);
    });

    it('should return undefined if crop width is less than 0.1', () => {
      const invalidCrop: Crop = { xMin: 0.2, yMin: 0.1, xMax: 0.25, yMax: 0.9 }; // Width is 0.05
      expect(service.sanitizeCrop(invalidCrop)).toBeUndefined();
    });

    it('should return undefined if crop height is less than 0.1', () => {
      const invalidCrop: Crop = { xMin: 0.1, yMin: 0.2, xMax: 0.9, yMax: 0.28 }; // Height is 0.08
      expect(service.sanitizeCrop(invalidCrop)).toBeUndefined();
    });
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
