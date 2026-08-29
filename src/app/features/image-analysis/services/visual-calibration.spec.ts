import { TestBed } from '@angular/core/testing';
import { VisualCalibrationService } from './visual-calibration';
import { Crop } from '@/features/image-analysis/types/crop.type';
import { ColorAdjustment } from '@/features/image-analysis/types/color-adjustment.type';

describe('CssStyling', () => {
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
});
