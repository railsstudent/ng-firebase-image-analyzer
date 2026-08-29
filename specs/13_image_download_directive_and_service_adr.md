# 13. Decoupled Image Downloading via Custom Directive, Service, and Parameter Options

We decided to refactor the image download functionality to make `EnhancedCanvas` a pure presentation (dumb) component. We will delegate image loading, offscreen canvas filtering/cropping, and downloading to a dedicated `ImageDownloadService` and trigger it on-demand via a reusable `DownloadEnhancedDirective` attached to the download button, using a cohesive Parameter Object pattern (Options Bag) for robust extensibility.

## Context

The current `EnhancedCanvas` component contains a local `downloadEnhancedImage` helper that uses raw `fetch` to retrieve the image and download it. This has several drawbacks:

1. **Coupled Design**: The presentation component is coupled with HTTP network requests, DOM manipulation (anchor tags), and downloading side-effects.
2. **Loss of Enhancements**: Downloading the raw image URL directly fetches the un-cropped and un-filtered original image. To download the actual *enhanced* preview, we must draw the image onto a canvas, apply coordinates, apply CSS filters, and export the resulting Blob.
3. **No DI Container Integration**: Raw `fetch` bypasses Angular's `HttpClient`, making interceptors (like authentication or storage headers) and mocking during unit testing impossible.
4. **Memory Management**: Loading images and creating temporary object URLs requires strict garbage collection to prevent memory leaks in single-page apps.
5. **Extension Mismatches (File Corruption Edge Case)**: If the Canvas is exported as a PNG blob (`image/png`) but the filename contains an incorrect extension like `hello.jpeg`, the binary signature will conflict with the extension, causing OS/viewer warning errors. We need a robust sanitization helper to guarantee a `.png` filename extension.
6. **Dangling Object URLs on Exceptions**: If an exception occurs during the rendering or exporting stage after an Object URL has been created via `URL.createObjectURL()`, the execution halts and the cleanup code is bypassed, leaving raw binary leaks in browser memory. We must use deterministic `try/finally` blocks to guarantee cleanup under all execution paths.
7. **Host Bindings Consistency**: Using scattered `@HostListener` decorators inside standalone directives is being deprecated in favor of compiling bindings inside the `@Directive` decorator's `host` property.
8. **Double Input Clutter**: To download the image, the custom directive needs both the CSS styles and raw coordinates. Passing these as separate inputs complicates the template.
9. **Data Clump Code Smell**: Passing four distinct, closely related parameters (`url`, `crop`, `filter`, `filename`) across the service boundary reduces call-site readability and makes the API fragile to future extensions (e.g., adding export format, quality, or scale adjustments).

---

## Decision

To adhere to clean-code standards, we decided to implement a highly modular, decoupled architecture:

1. **Dumb Components**: Turn `EnhancedCanvas` into a pure presentation element with no service imports, raw fetch calls, or network handlers.
2. **Dedicated Export Service**: Create an `ImageDownloadService` inside `@/features/image-analysis/services/` that encapsulates network fetching via Angular's standard `HttpClient`, offscreen in-memory rendering, context filtering, and memory-safe garbage collection.
3. **Decoupled Event Triggering (Directive-Based)**: Create a standalone `DownloadEnhancedDirective` (`[appDownloadEnhanced]`) that binds to any button or element, intercepts the click event, reads the parameters, and triggers the `ImageDownloadService`.
4. **In-Memory Rendering with Platform DI**: Inject Angular's `DOCUMENT` token to securely create offscreen canvas and image elements safely in SSR/test contexts, executing the render flow with standard Promises to avoid nested callback hell.
5. **Strict PNG Extension Enforcement**: To eliminate potential file corruption from extension mismatches, the service features a private `#sanitizePngFilename(filename: string): string` helper.
6. **Leak-Proof Exception Safety**: Wrap execution inside robust `try/finally` blocks, ensuring that `URL.revokeObjectURL()` executes unconditionally even if rendering, processing, or exporting throws an error.
7. **Modern Host Metadata Configuration**: Declare event interceptors directly in the directive's decorator using `host: { '(click)': 'onClick()' }` rather than `@HostListener('click')`.
8. **Cohesive State Wrapping**: Modify the shared `CropImageStyles` interface to include the raw `crop` coordinates directly as an output of the `ImageEffect.cropImage` calculation. This allows `EnhancedCanvas` to receive all required layout styles and high-resolution coordinates within a single cohesive input (`[cropImage]`).
9. **Introduction of the Parameter Options Object (Options Bag)**: Declare a dedicated `ImageDownloadOptions` interface and update the service's primary method signature to receive this single cohesive parameter object, securing call-site readability and future-proofing the API.

---

## Reference Implementation

### 1. Options Interface Types
Created `src/app/features/image-analysis/types/image-download-options.type.ts`:

```typescript
import { Crop } from './crop.type';
import { ColorAdjustment } from './color-adjustment.type';

export interface ImageDownloadOptions {
  url: string;
  crop: Crop;
  filter: ColorAdjustment | undefined;
  filename: string;
}
```

### 2. Interface Updates (State Wrapping)
Update `src/app/features/image-enhancer/types/crop-image.type.ts`:

```typescript
import { Crop } from '@/features/image-analysis/types/crop.type';

export interface CropImageStyles {
  containerStyle: {
    position: 'relative' | 'static';
    aspectRatio: string;
    overflow: 'hidden';
    width: string;
  };
  imageStyle: {
    position: 'absolute' | 'static';
    width: string;
    left: string;
    top: string;
    maxWidth: 'none';
    maxHeight: 'none';
  };
  crop: Crop; // <-- Cohesively forward raw coordinates
}
```

### 3. The Core `ImageDownloadService`
Update `src/app/features/image-analysis/services/image-download.ts`:

```typescript
@Service()
export class ImageDownloadService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  #imageEffect = inject(ImageEffect);

  /**
   * Orchestrates the complete on-demand fetching, cropping, filtering, and file download sequence.
   * Accepts a single cohesive ImageDownloadOptions parameter object.
   */
  async downloadFilteredCrop(options: ImageDownloadOptions): Promise<void> {
    const { url, crop, filter, filename } = options;
    const rawBlob = await this.#fetchImageBlob(url);
    const img = await this.#loadImage(rawBlob);
    
    try {
      const filterStyle = this.#imageEffect.getCssFilter(filter);
      const canvas = this.#renderCroppedCanvas(img, crop, filterStyle);
      const exportBlob = await this.#exportCanvasBlob(canvas);
      
      const safeFilename = this.#sanitizePngFilename(filename);
      this.#triggerFileDownload(exportBlob, safeFilename);
    } finally {
      URL.revokeObjectURL(img.src); // Unconditional garbage collection
    }
  }
}
```

### 4. The Standalone `DownloadEnhancedDirective`
Created `src/app/features/image-analysis/directives/download-enhanced.ts`:

```typescript
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
    if (!url) return;

    try {
      // Maps individual reactive input signals into the single service Options Object
      await this.#downloadService.downloadFilteredCrop({
        url,
        crop: this.crop(),
        filter: this.filter(),
        filename: 'enhanced-image.png'
      });
    } catch (error) {
      console.error('Failed to download enhanced image:', error);
    }
  }
}
```

---

## Consequences & Trade-offs

- **Extremely Maintainable Component Architecture**: `EnhancedCanvas` is now 100% presentation-only, knowing absolutely nothing about network layer mechanics or service dependencies.
- **Strong Extensibility**: Future features (such as quality ratios, custom resolution scales, or alternative file types like JPEG/WebP) can be added as optional fields on `ImageDownloadOptions` without breaking any existing clients or signatures.
- **Cohesive Template Interface**: The template remains simple by binding to individual signals, while the directive cleanly translates them into the service's unified parameter object behind the scenes.
- **Deterministic Leak-Proof Safety**: Standardized `try/finally` blocks protect the browser from binary memory leaks under both normal execution and render-time errors.
