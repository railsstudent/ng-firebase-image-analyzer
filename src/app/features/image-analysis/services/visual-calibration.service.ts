import { ColorAdjustment, Crop, ImageAnalysisResponse } from '@/core/image-analysis';
import { ClampOptions } from '@/features/image-analysis/interfaces/clamp-option.interface';
import {
  CropImageStyles,
  VisualCalibrationResult,
} from '@/features/image-analysis/interfaces/visual-calibration.interface';
import { Service } from '@angular/core';

const DEFAULT_IMAGE_WIDTH = 100;
const PERCENT = 100;

@Service()
export class VisualCalibrationService {
  calibrate(analysis?: Partial<ImageAnalysisResponse> | null, width = DEFAULT_IMAGE_WIDTH): VisualCalibrationResult {
    const safeCrop = this.sanitizeCrop(analysis?.crop);
    const safeColorAdjustment = this.sanitizeColorAdjustments(analysis?.colorAdjustment);
    const cropImage = this.cropImage(safeCrop, width);
    const filterStyle = this.getCssFilter(safeColorAdjustment);
    const cropPosition = safeCrop
      ? `X: ${safeCrop.xMin}–${safeCrop.xMax} | Y: ${safeCrop.yMin}–${safeCrop.yMax}`
      : 'N/A';

    return {
      safeCrop,
      safeColorAdjustment,
      cropImage,
      aspectRatio: cropImage.containerStyle.aspectRatio,
      cropPosition,
      filterStyle,
    };
  }

  private clamp({ value, min, max, fallback }: ClampOptions): number {
    if (value === undefined || value === null || isNaN(value)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, value));
  }

  private getCssFilter(adjustment?: ColorAdjustment): string {
    if (!adjustment) {
      return '';
    }

    let styles = '';
    if (adjustment.brightness) {
      styles += `brightness(${adjustment.brightness}) `;
    }

    if (adjustment.saturation) {
      styles += `saturate(${adjustment.saturation}) `;
    }

    if (adjustment.contrast) {
      styles += `contrast(${adjustment.contrast}) `;
    }

    if (adjustment.warmth) {
      const rotation = 30;
      // Warmth is not a standard CSS filter, but we can simulate it using a combination of filters.
      // For example, we can use a combination of sepia and hue-rotate to create a warmth effect.
      styles += `sepia(${adjustment.warmth}) hue-rotate(${adjustment.warmth * rotation}deg) `;
    }

    return styles;
  }

  private cropImage(crop?: Crop, width = DEFAULT_IMAGE_WIDTH): CropImageStyles {
    // 1. Define the safe default crop (representing the full 100% image)
    const safeCrop = crop || { xMin: 0.0, yMin: 0.0, xMax: 1.0, yMax: 1.0 };

    // 2. Calculate the crop box width and height
    const cropWidth = +(safeCrop.xMax - safeCrop.xMin).toFixed(2); // 1.0 - 0.0 = 1.0
    const cropHeight = +(safeCrop.yMax - safeCrop.yMin).toFixed(2); // 1.0 - 0.0 = 1.0

    // 3. Apply ternary checks for the default "uncropped" state
    const imgWidth = crop ? `${((1 / cropWidth) * PERCENT).toFixed(2)}%` : '100%';
    const imgLeft = crop ? `${(-(safeCrop.xMin / cropWidth) * PERCENT).toFixed(2)}%` : 'auto';
    const imgTop = crop ? `${(-(safeCrop.yMin / cropHeight) * PERCENT).toFixed(2)}%` : 'auto';

    return {
      containerStyle: {
        position: crop ? 'relative' : 'static',
        aspectRatio: crop ? `${cropWidth} / ${cropHeight}` : 'auto',
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
      crop: safeCrop,
    };
  }

  /**
   * Analyzes an image and returns altedoirnative texts, tags, recommendations, and optional styling recommendations.
   *
   * @param file The image File or Blob to analyze.
   * @param customPrompt Optional custom prompt to guide the AI model's analysis.
   * @returns A structured ImageAnalysisResponse object.
   */
  private sanitizeColorAdjustments(adjustment?: ColorAdjustment): ColorAdjustment | undefined {
    if (!adjustment) {
      return undefined;
    }

    return {
      brightness: this.clamp({ value: adjustment.brightness, min: 0.5, max: 2.0, fallback: 1.0 }),
      saturation: this.clamp({ value: adjustment.saturation, min: 0.0, max: 2.0, fallback: 1.0 }),
      contrast: this.clamp({ value: adjustment.contrast, min: 0.5, max: 2.0, fallback: 1.0 }),
      warmth: this.clamp({ value: adjustment.warmth, min: 0.0, max: 1.0, fallback: 0.5 }),
    };
  }

  private sanitizeCrop(crop?: Crop): Crop | undefined {
    if (!crop) {
      return undefined;
    }

    const clampedxMin = this.clamp({ value: crop.xMin, min: 0, max: 1, fallback: 0 });
    const clampedyMin = this.clamp({ value: crop.yMin, min: 0, max: 1, fallback: 0 });
    const clampedxMax = this.clamp({ value: crop.xMax, min: 0, max: 1, fallback: 1 });
    const clampedyMax = this.clamp({ value: crop.yMax, min: 0, max: 1, fallback: 1 });

    const xMin = Math.min(clampedxMin, clampedxMax);
    const yMin = Math.min(clampedyMin, clampedyMax);
    const xMax = Math.max(clampedxMin, clampedxMax);
    const yMax = Math.max(clampedyMin, clampedyMax);
    const min_delta = 0.1;

    if (xMax - xMin >= min_delta && yMax - yMin >= min_delta) {
      return {
        xMin: xMin,
        yMin: yMin,
        xMax: xMax,
        yMax: yMax,
      };
    }

    return undefined;
  }
}
