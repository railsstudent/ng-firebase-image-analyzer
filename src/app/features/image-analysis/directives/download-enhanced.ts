import { ImageDownloadService } from '@/features/image-analysis/services/image-download';
import { Crop } from '@/features/image-analysis/types/crop.type';
import { Directive, inject, input } from '@angular/core';
import { ColorAdjustment } from '../types/color-adjustment.type';

@Directive({
  selector: '[appDownloadEnhanced]',
  host: {
    '(click)': 'onClick()',
  },
})
export class DownloadEnhancedDirective {
  imageUrl = input.required<string | null>({ alias: 'appDownloadEnhanced' });
  crop = input.required<Crop>();
  filter = input.required<ColorAdjustment | undefined>();

  #downloadImageService = inject(ImageDownloadService);

  async onClick() {
    const url = this.imageUrl();
    if (url) {
      try {
        await this.#downloadImageService.downloadFilteredCrop({
          url,
          crop: this.crop(),
          filter: this.filter(),
          filename: 'enhanced-image.png',
        });
      } catch (err) {
        console.error('Failed to download enhanced image:', err);
      }
    }
  }
}
