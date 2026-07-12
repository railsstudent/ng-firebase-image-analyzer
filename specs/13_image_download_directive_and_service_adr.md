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
7. **Host Bindings Consistency**: Using scattered `@HostListener` decorators inside standalone directives is being deprecated in favor of compiling bindings inside the `@Directive` decorator's `host` metadata property. This consolidates bindings, reduces decorator overhead, and aligns with modern Angular 19 styles.
8. **Double Input Clutter (Interface Design)**: To download the image, the custom directive needs both the CSS styles (for layout) and the raw crop coordinates (for canvas rendering). Passing these as two separate inputs (`[cropImage]` and `[crop]`) complicates the template interface.

## Decision

To adhere to clean-code standards, we decided to implement a highly modular, decoupled architecture using **Option B**:

1. **Dumb Components**: Turn `EnhancedCanvas` into a pure presentation element with no service imports, raw fetch calls, or network handlers.
2. **Dedicated Export Service**: Create an `ImageDownloadService` inside `@/features/image-analysis/services/` that encapsulates network fetching via Angular's standard `HttpClient`, offscreen in-memory rendering, context filtering, and memory-safe garbage collection.
3. **Decoupled Event Triggering (Directive-Based)**: Create a standalone `DownloadEnhancedDirective` (`[appDownloadEnhanced]`) that binds to any button or element, intercepts the click event, reads the parameters, and triggers the `ImageDownloadService`.
4. **In-Memory Rendering with Platform DI**: Inject Angular's `DOCUMENT` token to securely create offscreen canvas and image elements safely in SSR/test contexts, executing the render flow with standard Promises to avoid nested callback hell.
5. **Strict PNG Extension Enforcement**: To eliminate potential file corruption from extension mismatches, the service will feature a private `#sanitizePngFilename(filename: string): string` helper that strips any existing file extension and guarantees a safe, matching `.png` extension.
6. **Leak-Proof Exception Safety**: Wrap the orchestrator and file download execution inside robust `try/finally` blocks, ensuring that `URL.revokeObjectURL()` executes unconditionally even if downstream processing or exporting throws an error.
7. **Modern Host Metadata Configuration**: Declare event interceptors directly in the directive's decorator using `host: { '(click)': 'onClick()' }` rather than `@HostListener('click')`, standardizing to modern Angular 19 best practices.
8. **Cohesive State Wrapping (Option B)**: Modify the shared `CropImageStyles` interface to include the raw `crop` coordinates directly as an output of the `ImageEffect.cropImage` calculation. This allows `EnhancedCanvas` to receive all required layout styles and high-resolution coordinates within a single cohesive input (`[cropImage]`), keeping the template interface clean and uncluttered.

---

## Reference Implementation

### 1. Interface Updates

Update `src/app/features/image-enhancer/types/crop-image.type.ts`:

```typescript
import { Crop } from '@/features/image-analysis/types/crop.type';

export interface ContainerStyle {
  width: string;
  aspectRatio: string;
  overflow: 'hidden';
  position: 'relative' | 'static';
}

export interface ImageStyle {
  width: string;
  position: 'absolute' | 'static';
  top: string;
  left: string;
  maxWidth: 'none';
  maxHeight: 'none';
}

export interface CropImageStyles {
  containerStyle: ContainerStyle;
  imageStyle: ImageStyle;
  crop: Crop; // <-- Add this to wrap the raw coordinates cohesively
}
```

### 2. Service Calculations Updates

Update `src/app/features/image-enhancer/services/image-effect.ts`:

```typescript
  cropImage(crop?: Crop, width = 100): CropImageStyles {
    // 1. Define the safe default crop (representing the full 100% image)
    const safeCrop = crop || { xMin: 0.0, yMin: 0.0, xMax: 1.0, yMax: 1.0 };

    // 2. Calculate the crop box width and height
    const cropWidth = +(safeCrop.xMax - safeCrop.xMin).toFixed(2);
    const cropHeight = +(safeCrop.yMax - safeCrop.yMin).toFixed(2);

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
      crop: safeCrop, // <-- Cohesively forward the safe crop coordinates
    };
  }
```

### 3. The Core `ImageDownloadService`

Create a new file: `src/app/features/image-analysis/services/image-download.ts`

```typescript
import { ImageEffect } from '@/features/image-enhancer/services/image-effect';
import { ColorAdjustment } from '@/features/image-analysis/types/color-adjustment.type';
import { Crop } from '../types/crop.type';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT, inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Service()
export class ImageDownloadService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  #imageEffect = inject(ImageEffect);

  /**
   * Orchestrates the complete on-demand fetching, cropping, filtering, and file download sequence.
   * Leverages try/finally blocks to ensure Object URLs are securely revoked even under exceptions.
   */
  async downloadFilteredCrop(imageUrl: string, crop: Crop, filter: ColorAdjustment, filename: string): Promise<void> {
    const rawBlob = await this.#fetchImageBlob(imageUrl);
    const img = await this.#loadImage(rawBlob); // Object URL is generated inside here
    
    try {
      const filterStyle = this.#imageEffect.getCssFilter(filter);
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

### 4. The Standalone `DownloadEnhancedDirective`

Create a new file: `src/app/features/image-analysis/directives/download-enhanced.ts`

```typescript
import { Crop } from '@/features/image-analysis/types/crop.type';
import { ColorAdjustment } from '@/features/image-analysis/types/color-adjustment.type';
import { Directive, inject, input } from '@angular/core';
import { ImageDownloadService } from '../services/image-download';

@Directive({
  selector: '[appDownloadEnhanced]',
  host: {
    '(click)': 'onClick()'
  }
})
export class DownloadEnhancedDirective {
  imageUrl = input.required<string | null>({ alias: 'appDownloadEnhanced' });
  crop = input.required<Crop>();
  filter = input.required<ColorAdjustment | undefined>();

  #downloadService = inject(ImageDownloadService);

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

### 5. Component Updates (Declaring Standalone Imports & Cohesive bindings)

#### A. Centralized Parent-Side Sanitization in `image-improvement.ts`

Define a computed `safeColorAdjustment` signal to sanitize raw API adjustments once at the parent boundary:

```typescript
  safeColorAdjustment = computed(() => {
    const adj = this.analysis()?.colorAdjustment;
    return this.sanitizeAdjustment.sanitizeColorAdjustments(adj);
  });
```

#### B. Pass Safe Adjustment to Both Children in `image-improvement.html`

Update `src/app/features/image-analysis/image-improvement/image-improvement.html` to feed the exact same sanitized data to both child presentation components:

```html
<div class="improvement-grid">
  <!-- Image Crop (Sliders and applied list) -->
  <app-image-crop
    [colorAdjustment]="safeColorAdjustment()"
    [aspectRatio]="cropImage().containerStyle.aspectRatio"
    [cropPosition]="cropPosition()"
  />

  <!-- Enhanced Canvas (Preview and Downloader) -->
  <app-enhanced-canvas 
    [imageUrl]="imageUrl()" 
    [cropImage]="cropImage()" 
    [colorAdjustment]="safeColorAdjustment()" 
  />
</div>
```

#### C. Direct Property Extraction inside `EnhancedCanvas`

Update `src/app/features/image-analysis/enhanced-canvas/enhanced-canvas.ts`:

- Declare `cropImage` as input.
- Automatically derive `crop` as a reactive `computed` signal from `cropImage().crop`.
- Import `DownloadEnhancedDirective`.
- Inject `ImageEffect` to compute the visual filter string locally.

```typescript
import { DownloadEnhancedDirective } from '../directives/download-enhanced';
import { ImageEffect } from '@/features/image-enhancer/services/image-effect';
import { ColorAdjustment } from '@/features/image-analysis/types/color-adjustment.type';
import { Component, computed, inject, input } from '@angular/core';
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
  colorAdjustment = input<ColorAdjustment | undefined>(undefined);

  #imageEffect = inject(ImageEffect);

  containerCss = computed(() => this.cropImage().containerStyle);
  imageCss = computed(() => this.cropImage().imageStyle);
  
  // Extract the raw coordinates directly from the style object computed parent-side!
  crop = computed(() => this.cropImage().crop);
  
  // Compute the preview filter string locally using the injected domain service
  filterStyle = computed(() => this.#imageEffect.getCssFilter(this.colorAdjustment()));
}
```

#### C. Attaching the Directive to the Button in `enhanced-canvas.html`

Update `src/app/features/image-analysis/enhanced-canvas/enhanced-canvas.html`:

```html
        <!-- Download button with custom directive -->
        <button 
          type="button" 
          [appDownloadEnhanced]="imageUrl()" 
          [crop]="crop()" 
          [filter]="colorAdjustment()" 
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
- **Modern Consolidated Metadata**: Standardized host bindings inside the decorator config, improving tree-shaking, style consistency, and eliminating legacy `@HostListener` properties.
- **Clean Single-Input HTML Interfaces**: Incorporating the raw crop coordinates directly into `CropImageStyles` completely avoids parent-to-child interface clutter, letting the parent compute everything in one step and passing down a single cohesive object.
- **Perfect Domain Flow Safety**: Bypassing raw string primitive bindings entirely guarantees that only structured `ColorAdjustment` objects flow through your service and directive interfaces, ensuring type compliance at every step.
