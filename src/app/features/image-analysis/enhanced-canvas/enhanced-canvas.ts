import { DownloadEnhancedDirective } from '@/features/image-analysis/directives/download-enhanced';
import { ColorAdjustment } from '@/features/image-analysis/types/color-adjustment.type';
import { ImageEffect } from '@/features/image-enhancer/services/image-effect';
import { CropImageStyles } from '@/features/image-enhancer/types/crop-image.type';
import { Component, computed, inject, input, signal } from '@angular/core';

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

  #imageEffect = inject(ImageEffect);

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
      return `${((cropWidth / cropHeight) * aspect).toFixed(4)}`;
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
        aspectRatio: `${correctedAspect.toFixed(4)}`,
      };
    }
    return baseStyle;
  });

  imageCss = computed(() => this.cropImage().imageStyle);
  crop = computed(() => this.cropImage().crop);
  filterStyle = computed(() => this.#imageEffect.getCssFilter(this.colorAdjustment()));
}
