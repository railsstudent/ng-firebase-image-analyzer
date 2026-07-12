# 13. Decoupled Image Downloading via Custom Directive and Service

We decided to refactor the image download functionality to make `EnhancedCanvas` a pure presentation (dumb) component. We will delegate image loading, offscreen canvas filtering/cropping, and downloading to a dedicated `ImageDownloadService` and trigger it on-demand via a reusable `DownloadEnhancedDirective` attached to the download button.

## Context

The current `EnhancedCanvas` component contains a local `downloadEnhancedImage` helper that uses raw `fetch` to retrieve the image and download it. This has several drawbacks:

1. **Coupled Design**: The presentation component is coupled with HTTP network requests, DOM manipulation (anchor tags), and downloading side-effects.
2. **Loss of Enhancements**: Downloading the raw image URL directly fetches the un-cropped and un-filtered original image. To download the actual *enhanced* preview, we must draw the image onto a canvas, apply coordinates, apply CSS filters, and export the resulting Blob.
3. **No DI Container Integration**: Raw `fetch` bypasses Angular's `HttpClient`, making interceptors (like authentication or storage headers) and mocking during unit testing impossible.
4. **Memory Management**: Loading images and creating temporary object URLs requires strict garbage collection to prevent memory leaks in single-page apps.
5. **Extension Mismatches (File Corruption Edge Case)**: If the Canvas is exported as a PNG blob (`image/png`) but the filename contains an incorrect extension like `hello.jpeg`, the binary signature will conflict with the extension, causing OS/viewer warning errors. We need a robust sanitization helper to guarantee a `.png` filename extension.
6. **Dangling Object URLs on Exceptions**: If an exception occurs during the rendering or exporting stage after an Object URL has been created via `URL.createObjectURL()`, the execution halts and the cleanup code is bypassed, leaving raw binary leaks in browser memory. We must use deterministic `try/finally` blocks to guarantee cleanup under all execution paths.

## Decision

To adhere to clean-code standards, we decided to implement a highly modular, decoupled architecture:

1. **Dumb Components**: Turn `EnhancedCanvas` into a pure presentation element with no service imports, raw fetch calls, or network handlers.
2. **Dedicated Export Service**: Create an `ImageDownloadService` inside `@/features/image-analysis/services/` that encapsulates network fetching via Angular's standard `HttpClient`, offscreen in-memory rendering, context filtering, and memory-safe garbage collection.
3. **Decoupled Event Triggering (Directive-Based)**: Create a standalone `DownloadEnhancedDirective` (`[appDownloadEnhanced]`) that binds to any button or element, intercepts the click event, reads the parameters, and triggers the `ImageDownloadService`.
4. **In-Memory Rendering with Platform DI**: Inject Angular's `DOCUMENT` token to securely create offscreen canvas and image elements safely in SSR/test contexts, executing the render flow with standard Promises to avoid nested callback hell.
5. **Strict PNG Extension Enforcement**: To eliminate potential file corruption from extension mismatches, the service will feature a private `#sanitizePngFilename(filename: string): string` helper that strips any existing file extension and guarantees a safe, matching `.png` extension.
6. **Leak-Proof Exception Safety**: Wrap the orchestrator and file download execution inside robust `try/finally` blocks, ensuring that `URL.revokeObjectURL()` executes unconditionally even if downstream processing or exporting throws an error.

---

## Reference Implementation

### 1. The Core `ImageDownloadService`

Create a new file: `src/app/features/image-analysis/services/image-download.service.ts`

```typescript
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Crop } from '../types/crop.type';

@Service()
export class ImageDownloadService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);

  /**
   * Orchestrates the complete on-demand fetching, cropping, filtering, and file download sequence.
   * Leverages try/finally blocks to ensure Object URLs are securely revoked even under exceptions.
   */
  async downloadFilteredCrop(imageUrl: string, crop: Crop, filterStyle: string, filename: string): Promise<void> {
    const rawBlob = await this.#fetchImageBlob(imageUrl);
    const img = await this.#loadImage(rawBlob); // Object URL is generated inside here
    
    try {
      const canvas = this.#renderCroppedCanvas(img, crop, filterStyle);
      const exportBlob = await this.#exportCanvasBlob(canvas);
      
      // Sanitize extension to ensure it is strictly matching .png format
      const safeFilename = this.#sanitizePngFilename(filename);
      this.#triggerFileDownload(exportBlob, safeFilename);
    } finally {
      // Unconditionally runs: revokes the source image Object URL to prevent memory leaks
      URL.revokeObjectURL(img.src);
    }
  }

  // --- Private Helper Methods ---

  #fetchImageBlob(imageUrl: string): Promise<Blob> {
    return firstValueFrom(this.http.get(imageUrl, { responseType: 'blob' }));
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
      cropHeight
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

  #triggerFileDownload(blob: Blob, filename: string): void {
    const downloadUrl = URL.createObjectURL(blob);
    try {
      const a = this.document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.click();
    } finally {
      // Unconditionally runs: immediate garbage collection of the temporary export Object URL
      URL.revokeObjectURL(downloadUrl);
    }
  }

  #sanitizePngFilename(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    const baseName = lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
    return `${baseName || 'enhanced-image'}.png`;
  }
}
```

### 2. The Standalone `DownloadEnhancedDirective`

Create a new file: `src/app/features/image-analysis/directives/download-enhanced.directive.ts`

```typescript
import { Crop } from '@/features/image-analysis/types/crop.type';
import { Directive, HostListener, inject, input } from '@angular/core';
import { ImageDownloadService } from '../services/image-download.service';

@Directive({
  selector: '[appDownloadEnhanced]',
  standalone: true,
})
export class DownloadEnhancedDirective {
  imageUrl = input.required<string | null>({ alias: 'appDownloadEnhanced' });
  crop = input.required<Crop>();
  filter = input.required<string>();

  #downloadService = inject(ImageDownloadService);

  @HostListener('click')
  async onClick() {
    const url = this.imageUrl();
    if (!url) {
      return;
    }
    try {
      await this.#downloadService.downloadFilteredCrop(
        url,
        this.crop(),
        this.filter(),
        'enhanced-image.png'
      );
    } catch (error) {
      console.error('Failed to download enhanced image:', error);
    }
  }
}
```

### 3. Component Updates (Declaring Inputs and Standalone Imports)

#### A. Passing the Raw Crop Input down to `EnhancedCanvas`

Update `src/app/features/image-analysis/image-improvement/image-improvement.html`:

```html
    <!-- Enhanced Canvas -->
    <app-enhanced-canvas 
      [imageUrl]="imageUrl()" 
      [cropImage]="cropImage()" 
      [filterStyle]="filterStyle()"
      [crop]="safeCrop()" 
    />
```

#### B. Updating `EnhancedCanvas` component ts

Update `src/app/features/image-analysis/enhanced-canvas/enhanced-canvas.ts`:

- Add `crop = input.required<Crop>()` as a new input.
- Import `DownloadEnhancedDirective` and add it to `imports` metadata.
- Delete the local legacy `downloadEnhancedImage` method.

```typescript
import { Crop } from '@/features/image-analysis/types/crop.type';
import { DownloadEnhancedDirective } from '../directives/download-enhanced.directive';
import { Component, computed, input } from '@angular/core';
import { CropImageStyles } from './../../image-enhancer/types/crop-image.type';

@Component({
  selector: 'app-enhanced-canvas',
  templateUrl: './enhanced-canvas.html',
  styleUrl: './enhanced-canvas.css',
  imports: [DownloadEnhancedDirective],
})
export class EnhancedCanvas {
  imageUrl = input<string | null>(null);
  cropImage = input.required<CropImageStyles>();
  filterStyle = input.required<string>();
  crop = input.required<Crop>();

  containerCss = computed(() => this.cropImage().containerStyle);
  imageCss = computed(() => this.cropImage().imageStyle);
}
```

#### C. Attaching the Directive to the Button in `enhanced-canvas.html`

Update `src/app/features/image-analysis/enhanced-canvas/enhanced-canvas.html`:

```html
        <!-- Download button floating hover using modern directive -->
        <button 
          type="button" 
          [appDownloadEnhanced]="imageUrl()" 
          [crop]="crop()" 
          [filter]="filterStyle()" 
          class="download-enhanced-btn"
        >
          <span class="material-symbols-outlined text-lg">download</span>
          Download PNG
        </button>
```

---

## Consequences & Trade-offs

- **Extremely Maintainable Component Architecture**: `EnhancedCanvas` is now 100% presentation-only, knowing absolutely nothing about network layer mechanics or service dependencies.
- **Strict, Native Typing**: Inputs utilize Angular 19's native `input.required<Type>()` ensuring compiler errors catch any binding mismatches.
- **Robust Garbage Collection**: Proactive revoking of blob-ObjectURLs prevents browser-level memory leaks under extensive sessions.
- **Universal Directive Reusability**: Any component can now download a filtered/cropped canvas output just by attaching the `[appDownloadEnhanced]` directive.
- **Guaranteed Extension Matching**: The `#sanitizePngFilename` helper strips any incorrect extension and force-appends `.png`, completely preventing file-corruption warnings.
- **Deterministic Exception Safety**: Utilizing `try/finally` blocks guarantees that Object URLs are unconditionally revoked, keeping the browser's memory pristine even if render-time exceptions occur.
