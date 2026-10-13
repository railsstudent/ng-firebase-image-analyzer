import { VisualCalibrationResult } from '@/features/image-analysis/interfaces/visual-calibration.interface';
import { ImageDownloadService } from '@/features/image-analysis/services/image-download.service';
import { Directive, inject, input } from '@angular/core';

@Directive({
  selector: '[appDownloadEnhanced]',
  host: {
    '(click)': 'onClick()',
  },
})
export class DownloadEnhancedDirective {
  imageUrl = input.required<string | null>({ alias: 'appDownloadEnhanced' });
  calibration = input.required<VisualCalibrationResult>();

  #downloadImageService = inject(ImageDownloadService);

  async onClick() {
    const url = this.imageUrl();
    if (url) {
      try {
        await this.#downloadImageService.downloadFilteredCrop({
          url,
          crop: this.calibration().cropImage.crop,
          filterStyle: this.calibration().filterStyle,
          filename: 'enhanced-image.png',
        });
      } catch (err) {
        console.error('Failed to download enhanced image:', err);
      }
    }
  }
}
