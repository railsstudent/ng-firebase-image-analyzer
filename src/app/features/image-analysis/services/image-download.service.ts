import type { Crop } from '@/core/image-analysis';
import type { ImageDownloadOptions } from '@/features/image-analysis/interfaces/image-download-options.interface';
import { DOCUMENT, inject, Service } from '@angular/core';

@Service()
export class ImageDownloadService {
  readonly #document = inject(DOCUMENT);

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = this.#document.createElement('img');
      img.src = url;

      img.onload = () => resolve(img);
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image element: ' + err));
      };
    });
  }

  private renderCroppedCanvas(img: HTMLImageElement, crop: Crop, filterStyle: string): HTMLCanvasElement {
    const canvas = this.#document.createElement('canvas');
    const cropWidth = Math.round((crop.xMax - crop.xMin) * img.naturalWidth);
    const cropHeight = Math.round((crop.yMax - crop.yMin) * img.naturalHeight);
    const sx = Math.round(crop.xMin * img.naturalWidth);
    const sy = Math.round(crop.yMin * img.naturalHeight);

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context.');
    }

    ctx.filter = filterStyle || 'none';
    ctx.drawImage(img, sx, sy, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    return canvas;
  }

  private exportCanvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas export failed to produce a valid Blob.'));
        }
      }, 'image/png');
    });
  }

  private sanitizePngFilename(rawFilename: string): string {
    const trimmedFilename = rawFilename.trim();
    // Verify if the filename is English (ASCII characters only)
    // eslint-disable-next-line no-control-regex
    const isEnglish = /^[\x00-\x7F]*$/.test(trimmedFilename);
    const filename = !isEnglish ? 'enhanced-image' : trimmedFilename;
    const idx = filename.lastIndexOf('.');
    const basename = idx >= 0 ? filename.substring(0, idx) : filename;

    return `${basename || 'enhanced-image'}.png`;
  }

  private triggerFileDownload(blob: Blob, filename: string): void {
    const downloadUrl = URL.createObjectURL(blob);

    try {
      const a = this.#document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.click();
    } finally {
      // Immediate Garbage Collection of the export Object URL
      URL.revokeObjectURL(downloadUrl);
    }
  }

  async downloadFilteredCrop(options: ImageDownloadOptions): Promise<void> {
    const { url, crop, filterStyle, filename } = options;
    const imageElement = await this.loadImage(url);

    try {
      console.log('[ImageDownloadService] Calculated filterStyle:', filterStyle);
      const canvasElement = this.renderCroppedCanvas(imageElement, crop, filterStyle);
      const exportedBlob = await this.exportCanvasBlob(canvasElement);
      const safeFilename = this.sanitizePngFilename(filename);
      this.triggerFileDownload(exportedBlob, safeFilename);
    } finally {
      // Garbage collection of the loaded image's object URL
      URL.revokeObjectURL(imageElement.src);
    }
  }
}
