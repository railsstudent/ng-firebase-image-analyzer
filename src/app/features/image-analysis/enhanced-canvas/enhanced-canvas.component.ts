import { DownloadEnhancedDirective } from '@/features/image-analysis/directives/download-enhanced.directive';
import type { VisualCalibrationResult } from '@/features/image-analysis/interfaces/visual-calibration.interface';
import { DownloadIconComponent } from '@/shared/ui/icons/download-icon/download-icon.component';
import { Component, computed, input, signal } from '@angular/core';

const DECIMAL_PLACES = 4;

@Component({
  selector: 'app-enhanced-canvas',
  host: {
    class: 'block md:col-span-2 w-full',
  },
  imports: [DownloadEnhancedDirective, DownloadIconComponent],
  templateUrl: './enhanced-canvas.component.html',
  styleUrl: './enhanced-canvas.component.css',
})
export class EnhancedCanvasComponent {
  imageUrl = input<string | null>(null);
  calibration = input.required<VisualCalibrationResult>();

  imageAspectRatio = signal<number | null>(null);

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && img.naturalWidth && img.naturalHeight) {
      this.imageAspectRatio.set(img.naturalWidth / img.naturalHeight);
    }
  }

  cropImage = computed(() => this.calibration().cropImage);

  containerAspectRatio = computed(() => {
    const { crop } = this.cropImage();
    const aspect = this.imageAspectRatio();

    if (crop && aspect) {
      const cropWidth = crop.xMax - crop.xMin;
      const cropHeight = crop.yMax - crop.yMin;
      return `${((cropWidth / cropHeight) * aspect).toFixed(DECIMAL_PLACES)}`;
    }
    return '1'; // Default to square before image load
  });

  containerCss = computed(() => {
    const { containerStyle: baseStyle, crop } = this.cropImage();
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
}
