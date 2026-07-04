# Specification: Image Analysis State Cleanup & Utility Unification

This plan outlines the architecture and refactoring steps for improving reactive state management within the `ImageAnalysis` component and unifying duplicate `FileReader` logic across the codebase.

## 1. Objectives

* **Declarative Reactivity**: Standardize reactive state management by establishing `analysisData` as the single source of truth in `ImageAnalysis`.
* **Computed Signals**: Convert `tags` and `source` into declarative `computed()` signals that automatically update or reset when `analysisData` changes, removing manual synchronization state leaks.
* **Consolidate FileReader Logic**: Extract redundant `FileReader` data-URL conversion logic present in both `base64.util.ts` and `image-uploader.ts` into a single reusable helper function `readFileAsDataURL` in `src/app/core/utils/base64.util.ts`.
* **Acknowledge `imageUrl` Preservation**: Retain `imageUrl` as a two-way `model()` binding as it is necessary for rendering previews and syncing the parent/child component state.

---

## 2. Architecture & Design

### A. Reactive State Management in `ImageAnalysis`

Currently, `tags` and `source` are independent writable signals. Their values are manually set and cleared across multiple event handlers:

* In `onFileSelected()`: `tags` is manually cleared, but `source` is forgotten.
* In `triggerAnalysis()`: `tags` and `source` are manually mapped and set when the API returns.
* In `onImageRemoved()`: `tags` is manually cleared, but `source` is forgotten.

By shifting to computed signals, we delegate state synchronization to Angular's reactive engine. Both `tags` and `source` automatically derive from `analysisData()`:

```typescript
// Derived state: Tags automatically recalculates or falls back to an empty array
tags = computed<ImageTag[]>(() => {
  const data = this.analysisData();
  if (!data) return [];
  return data.analysis.tags.map((t) => ({
    label: t.name,
    tooltip: t.sentence,
  }));
});

// Derived state: Source automatically syncs with the analysis metadata
source = computed<InferenceSource | undefined>(() => {
  return this.analysisData()?.source;
});
```

### B. Common File Reading Utility

Currently, `base64.util.ts` and `image-uploader.ts` both instantiate `FileReader` to read files as data URLs. We will extract a unified utility function `readFileAsDataURL` into `base64.util.ts`:

```typescript
/**
 * Reads a File or Blob as a Data URL (base64 encoded string with MIME type prefix).
 *
 * @param file The File or Blob to read.
 * @returns A promise that resolves to the Data URL string.
 */
export function readFileAsDataURL(file: File | Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
```

---

## 3. Refactoring Steps

### Step 1: Update base64 Utility (`src/app/core/utils/base64.util.ts`)

Add and export `readFileAsDataURL`, and update `fileToGenerativePart` to use it:

```typescript
import { Part } from 'firebase/ai';

export function readFileAsDataURL(file: File | Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function fileToGenerativePart(file: File | Blob, mimeType?: string): Promise<Part> {
  const resolvedMimeType = mimeType || file.type;
  if (!resolvedMimeType) {
    throw new Error('MIME type must be specified or present on the File/Blob.');
  }

  const dataUrl = await readFileAsDataURL(file);
  const base64Data = dataUrl.split(',')[1];

  return {
    inlineData: {
      data: base64Data,
      mimeType: resolvedMimeType,
    },
  };
}
```

### Step 2: Refactor Image Uploader (`src/app/shared/image-uploader/image-uploader.ts`)

Import and use `readFileAsDataURL` in `handleFile()`:

```typescript
import { readFileAsDataURL } from '@/core/utils/base64.util';

// ...

  async handleFile(file: File) {
    this.errorMessage.set(null);

    if (file.size > this.maxSize()) {
      const sizeInMb = (this.maxSize() / ONE_MB).toFixed(0);
      this.errorMessage.set(`File too large (Max ${sizeInMb}MB)`);
      return;
    }

    this.fileSelected.emit(file);

    // Read file for preview
    try {
      const dataUrl = await readFileAsDataURL(file);
      this.imageUrl.set(dataUrl);
    } catch (error) {
      console.error('Failed to read file as data URL', error);
      this.errorMessage.set('Failed to read image preview.');
    }
  }
```

### Step 3: Refactor Image Analysis Component (`src/app/features/image-analysis/image-analysis.ts`)

Introduce `computed` signal derivations and remove manual setters:

```typescript
import { ImageAnalysisService } from '@/features/image-analysis/services/image-analysis';
import { ImageAnalysisWithMetadata } from '@/features/image-analysis/types/image-analysis-metadata.type';
import { ImageUploader } from '@/shared/image-uploader/image-uploader';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { InferenceSource } from 'firebase/ai';
import { ImageAnalysisPanel } from './image-analysis-panel/image-analysis-panel';
import { ImageTag, TagList } from './tag-list/tag-list';

@Component({
  selector: 'app-image-analysis',
  standalone: true,
  imports: [ImageUploader, TagList, ImageAnalysisPanel],
  templateUrl: './image-analysis.html',
  styleUrl: './image-analysis.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ImageAnalysis {
  imageAnalysisService = inject(ImageAnalysisService);

  // Local reactive states
  imageUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  analysisData = signal<ImageAnalysisWithMetadata | null>(null);
  isLoading = signal<boolean>(false);
  performance = signal(0);

  // Computed derived states
  tags = computed<ImageTag[]>(() => {
    const data = this.analysisData();
    if (!data) return [];
    return data.analysis.tags.map((t) => ({
      label: t.name,
      tooltip: t.sentence,
    }));
  });

  source = computed<InferenceSource | undefined>(() => {
    return this.analysisData()?.source;
  });

  onFileSelected(file: File) {
    this.selectedFile.set(file);
    this.analysisData.set(null);
  }

  async triggerAnalysis() {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    const start = Date.now();
    try {
      this.performance.set(0);
      this.isLoading.set(true);

      const response = await this.imageAnalysisService.analyzeImage(file);
      this.analysisData.set(response);
    } catch (error) {
      console.error('Failed to analyze image with API', error);
    } finally {
      this.isLoading.set(false);
      this.performance.set(Date.now() - start);
    }
  }

  onImageRemoved() {
    this.selectedFile.set(null);
    this.analysisData.set(null);
  }
}
```

---

## 4. Verification & Validation

* Compile the workspace using `npm run build` to ensure all TypeScript and Angular Template bindings compile with zero errors.
* Validate that resetting or selecting a new file automatically cleans up `tags` and `source` dynamically via the computed signals.
