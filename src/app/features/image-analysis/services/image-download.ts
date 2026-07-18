import { Crop } from '@/features/image-analysis/types/crop.type';
import { ImageDownloadOptions } from '@/features/image-analysis/types/image-download-options.type';
import { ImageEffect } from '@/features/image-enhancer/services/image-effect';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT, inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Service()
export class ImageDownloadService {
  private readonly httpService = inject(HttpClient);
  private readonly document = inject(DOCUMENT);

  #imageEffect = inject(ImageEffect);

  #fetchImageBlob(url: string): Promise<Blob> {
    return firstValueFrom(this.httpService.get(url, { responseType: 'blob' }));
  }

  #loadImage(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = this.document.createElement('img');
      const objectUrl = URL.createObjectURL(blob);
      img.src = objectUrl;

      img.onload = () => resolve(img);
      img.onerror = (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image element: ' + err));
      };
    });
  }

  #renderCroppedCanvas(img: HTMLImageElement, crop: Crop, filterStyle: string): HTMLCanvasElement {
    const canvas = this.document.createElement('canvas');
    const cropWidth = (crop.xMax - crop.xMin) * img.naturalWidth;
    const cropHeight = (crop.yMax - crop.yMin) * img.naturalHeight;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context.');
    }

    ctx.filter = filterStyle || 'none';
    ctx.drawImage(
      img,
      crop.xMin * img.naturalWidth,
      crop.yMin * img.naturalHeight,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );

    return canvas;
  }

  #exportCanvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
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

  #sanitizePngFilename(rawFilename: string): string {
    const trimmedFilename = rawFilename.trim();
    // Verify if the filename is English (ASCII characters only)
    // eslint-disable-next-line no-control-regex
    const isEnglish = /^[\x00-\x7F]*$/.test(trimmedFilename);
    const filename = !isEnglish ? 'enhanced-image' : trimmedFilename;
    const idx = filename.lastIndexOf('.');
    const basename = idx >= 0 ? filename.substring(0, idx) : filename;

    return `${basename || 'enhanced-image'}.png`;
  }

  #triggerFileDownload(blob: Blob, filename: string): void {
    const downloadUrl = URL.createObjectURL(blob);

    try {
      const a = this.document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.click();
    } finally {
      // Immediate Garbage Collection of the export Object URL
      URL.revokeObjectURL(downloadUrl);
    }
  }

  async downloadFilteredCrop(options: ImageDownloadOptions) {
    const { url, crop, filter, filename } = options;
    console.log('[ImageDownloadService] Downloading with options:', { crop, filter, filename });
    const rawBlob = await this.#fetchImageBlob(url);
    const imageElement = await this.#loadImage(rawBlob);

    try {
      const filterStyle = this.#imageEffect.getCssFilter(filter);
      console.log('[ImageDownloadService] Calculated filterStyle:', filterStyle);
      const canvasElement = this.#renderCroppedCanvas(imageElement, crop, filterStyle);
      const exportedBlob = await this.#exportCanvasBlob(canvasElement);
      const safeFilename = this.#sanitizePngFilename(filename);
      this.#triggerFileDownload(exportedBlob, safeFilename);
    } finally {
      // Garbage collection of the loaded image's object URL
      URL.revokeObjectURL(imageElement.src);
    }
  }
}
