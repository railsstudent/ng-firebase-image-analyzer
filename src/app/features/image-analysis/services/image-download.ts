import { Crop } from '@/features/image-analysis/types/crop.type';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT, inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Service()
export class ImageDownloadService {
  private readonly httpService = inject(HttpClient);
  private readonly document = inject(DOCUMENT);

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

    ctx.filter = filterStyle;
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

  #sanitizeFilename(rawFilename: string): string {
    const trimmedFilename = rawFilename.trim();
    // Verify if the filename is English (ASCII characters only)
    // eslint-disable-next-line no-control-regex
    const isEnglish = /^[\x00-\x7F]*$/.test(trimmedFilename);
    const filename = !isEnglish ? 'enhanced_image' : trimmedFilename;
    const idx = filename.lastIndexOf('.');
    const basename = idx >= 0 ? filename.substring(0, idx) : filename;

    return `${basename}.png`;
  }

  #triggerFileDownload(blob: Blob, rawFilename: string): void {
    const downloadUrl = URL.createObjectURL(blob);

    try {
      const safeFilename = this.#sanitizeFilename(rawFilename);
      const a = this.document.createElement('a');
      a.href = downloadUrl;
      a.download = safeFilename;
      a.click();
    } finally {
      // Immediate Garbage Collection of the export Object URL
      URL.revokeObjectURL(downloadUrl);
    }
  }

  async downloadFilteredCrop(url: string, crop: Crop, filterStyle: string, filename: string) {
    const rawBlob = await this.#fetchImageBlob(url);
    const imageElement = await this.#loadImage(rawBlob);

    try {
      const canvasElement = this.#renderCroppedCanvas(imageElement, crop, filterStyle);
      const exportedBlob = await this.#exportCanvasBlob(canvasElement);
      this.#triggerFileDownload(exportedBlob, filename);
    } finally {
      // Garbage collection of the loaded image's object URL
      URL.revokeObjectURL(imageElement.src);
    }
  }
}
