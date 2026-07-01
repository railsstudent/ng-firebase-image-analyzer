import { ColorAdjustment } from '@/features/image-analysis/types/color-adjustment.type';
import { Service } from '@angular/core';

@Service()
export class CssFilter {
  getFunctions(adjustment?: ColorAdjustment) {
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
      // Warmth is not a standard CSS filter, but we can simulate it using a combination of filters.
      // For example, we can use a combination of sepia and hue-rotate to create a warmth effect.
      styles += `sepia(${adjustment.warmth}) hue-rotate(${adjustment.warmth * 30}deg) `;
    }

    return styles;
  }
}
