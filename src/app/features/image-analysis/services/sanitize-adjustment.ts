import { clamp } from '@/core/utils/clamp.util';
import { ColorAdjustment } from '@/features/image-analysis/types/color-adjustment.type';
import { Crop } from '@/features/image-analysis/types/crop.type';
import { Service } from '@angular/core';

@Service()
export class SanitizeAdjustmentService {
  /**
   * Analyzes an image and returns alternative texts, tags, recommendations, and optional styling recommendations.
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
      brightness: clamp(adjustment.brightness, 0.5, 2.0, 1.0),
      saturation: clamp(adjustment.saturation, 0.0, 2.0, 1.0),
      contrast: clamp(adjustment.contrast, 0.5, 2.0, 1.0),
      warmth: clamp(adjustment.warmth, 0.0, 1.0, 0.5),
    };
  }

  sanitizeCrop(crop?: Crop): Crop | undefined {
    if (!crop) {
      return undefined;
    }

    const clampedxMin = clamp(crop.xMin, 0, 1, 0);
    const clampedyMin = clamp(crop.yMin, 0, 1, 0);
    const clampedxMax = clamp(crop.xMax, 0, 1, 1);
    const clampedyMax = clamp(crop.yMax, 0, 1, 1);

    const xMin = Math.min(clampedxMin, clampedxMax);
    const yMin = Math.min(clampedyMin, clampedyMax);
    const xMax = Math.max(clampedxMin, clampedxMax);
    const yMax = Math.max(clampedyMin, clampedyMax);

    if (xMax - xMin >= 0.1 && yMax - yMin >= 0.1) {
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
