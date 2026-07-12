import { ColorAdjustment } from '@/features/image-analysis/types/color-adjustment.type';
import { Crop } from '@/features/image-analysis/types/crop.type';
import { CropImageStyles } from '@/features/image-enhancer/types/crop-image.type';
import { Service } from '@angular/core';

@Service()
export class ImageEffect {
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
      // Warmth is not a standard CSS filter, but we can simulate it using a combination of filters.
      // For example, we can use a combination of sepia and hue-rotate to create a warmth effect.
      styles += `sepia(${adjustment.warmth}) hue-rotate(${adjustment.warmth * 30}deg) `;
    }

    return styles;
  }

  cropImage(crop?: Crop, width = 100): CropImageStyles {
    // 1. Define the safe default crop (representing the full 100% image)
    const safeCrop = crop || { xMin: 0.0, yMin: 0.0, xMax: 1.0, yMax: 1.0 };

    // 2. Calculate the crop box width and height
    const cropWidth = +(safeCrop.xMax - safeCrop.xMin).toFixed(2); // 1.0 - 0.0 = 1.0
    const cropHeight = +(safeCrop.yMax - safeCrop.yMin).toFixed(2); // 1.0 - 0.0 = 1.0

    // 3. Apply ternary checks for the default "uncropped" state
    const imgWidth = crop ? `${((1 / cropWidth) * 100).toFixed(2)}%` : '100%';
    const imgLeft = crop ? `${(-(safeCrop.xMin / cropWidth) * 100).toFixed(2)}%` : 'auto';
    const imgTop = crop ? `${(-(safeCrop.yMin / cropHeight) * 100).toFixed(2)}%` : 'auto';

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
    };
  }
}
