import { DownloadEnhancedDirective } from '@/features/image-analysis/directives/download-enhanced';
import { ColorAdjustment } from '@/features/image-analysis/types/color-adjustment.type';
import { CropImageStyles } from '@/features/image-analysis/types/crop-image.type';
import { Component, computed, input, signal } from '@angular/core';

const DECIMAL_PLACES = 4;

@Component({
  selector: 'app-enhanced-canvas',
  imports: [DownloadEnhancedDirective],
  templateUrl: './enhanced-canvas.html',
  styleUrl: './enhanced-canvas.css',
})
export class EnhancedCanvas {
  imageUrl = input<string | null>(null);
  cropImage = input.required<CropImageStyles>();
  colorAdjustment = input<ColorAdjustment | undefined>(undefined);
  filterStyle = input.required();

  imageAspectRatio = signal<number | null>(null);

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img && img.naturalWidth && img.naturalHeight) {
      this.imageAspectRatio.set(img.naturalWidth / img.naturalHeight);
    }
  }

  containerAspectRatio = computed(() => {
    const crop = this.cropImage().crop;
    const aspect = this.imageAspectRatio();

    if (crop && aspect) {
      const cropWidth = crop.xMax - crop.xMin;
      const cropHeight = crop.yMax - crop.yMin;
      return `${((cropWidth / cropHeight) * aspect).toFixed(DECIMAL_PLACES)}`;
    }
    return '1'; // Default to square before image load
  });

  containerCss = computed(() => {
    const baseStyle = this.cropImage().containerStyle;
    const crop = this.cropImage().crop;
    const aspect = this.imageAspectRatio();

    if (crop && aspect) {
      const cropWidth = crop.xMax - crop.xMin;
      const cropHeight = crop.yMax - crop.yMin;
      const correctedAspect = (cropWidth / cropHeight) * aspect;
      return {
        ...baseStyle,
        aspectRatio: `${correctedAspect.toFixed(DECIMAL_PLACES)}`,
      };
    }
    return baseStyle;
  });

  imageCss = computed(() => this.cropImage().imageStyle);
  crop = computed(() => this.cropImage().crop);
}
