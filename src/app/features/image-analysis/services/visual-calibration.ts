import { clamp } from '@/core/utils/clamp.util';
import { ColorAdjustment } from '@/features/image-analysis/types/color-adjustment.type';
import { CropImageStyles } from '@/features/image-analysis/types/crop-image.type';
import { Crop } from '@/features/image-analysis/types/crop.type';
import { Service } from '@angular/core';

export const DEFAULT_IMAGE_WIDTH = 100;
export const PERCENT = 100;

@Service()
export class VisualCalibrationService {
  getCssFilter(adjustment?: ColorAdjustment) {
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

  cropImage(crop?: Crop, width = DEFAULT_IMAGE_WIDTH): CropImageStyles {
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
  sanitizeColorAdjustments(adjustment?: ColorAdjustment): ColorAdjustment | undefined {
    if (!adjustment) {
      return undefined;
    }

    return {
      brightness: clamp({ value: adjustment.brightness, min: 0.5, max: 2.0, fallback: 1.0 }),
      saturation: clamp({ value: adjustment.saturation, min: 0.0, max: 2.0, fallback: 1.0 }),
      contrast: clamp({ value: adjustment.contrast, min: 0.5, max: 2.0, fallback: 1.0 }),
      warmth: clamp({ value: adjustment.warmth, min: 0.0, max: 1.0, fallback: 0.5 }),
    };
  }

  sanitizeCrop(crop?: Crop): Crop | undefined {
    if (!crop) {
      return undefined;
    }

    const clampedxMin = clamp({ value: crop.xMin, min: 0, max: 1, fallback: 0 });
    const clampedyMin = clamp({ value: crop.yMin, min: 0, max: 1, fallback: 0 });
    const clampedxMax = clamp({ value: crop.xMax, min: 0, max: 1, fallback: 1 });
    const clampedyMax = clamp({ value: crop.yMax, min: 0, max: 1, fallback: 1 });

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
