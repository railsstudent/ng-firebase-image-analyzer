# 06: Trigger On-Device Pre-Warming in afterNextRender with CLS-Safe Status Slot

**What to build:**
Restore immediate background on-device Gemini Nano pre-warming after initial render in `ImageAnalysisComponent` while keeping the photo uploader and "Analyze Image" action 100% enabled at all times. Display an accessible, 0-CLS pre-warming status badge directly below `<app-image-uploader>` driven by a component-local `warmingMessage` signal (`'Pre-warming on-device AI model...'`), simplify `ImageAnalysisService.preWarm()` by removing `#preWarmPromise` and renaming `loadPreWarm()` to `preWarm()`, and synchronize domain documentation (`GLOSSARY.md`, `ADR-0024`, and `DESIGN.md`).

**Blocked by:** None (can start immediately)

**Status:** done

## Acceptance Criteria & Implementation Checklist

### 1. Simplify `preWarm()` in `ImageAnalysisService` (`src/app/core/image-analysis/image-analysis.service.ts`)

- [x] Remove `#preWarmPromise: Promise<void> | null = null;`, the outer `preWarm()` wrapper, and `this.#preWarmPromise = null;` inside `catch`, and rename `private async loadPreWarm(): Promise<void>` to `async preWarm(): Promise<void>`:

  ```ts
  async preWarm(): Promise<void> {
    try {
      await this.#aiService.preWarmModel(
        {
          systemInstruction: SYSTEM_INSTRUCTION,
          schema: ImageAnalysisSchema,
          contents: [],
        },
        {
          runDummyQuery: true,
          dummySize: 512,
        },
      );
      console.log('Image analysis on-device engine and WebGPU shaders warmed successfully!');
    } catch (err) {
      console.warn('Image analysis pre-warm sequence finished with warning/skip:', err);
    }
  }
  ```

- [x] Update `describe('preWarm', ...)` in `src/app/core/image-analysis/image-analysis.service.spec.ts` to remove the `#preWarmPromise` memoization test (`reuses existing preWarm promise on repeated invocations`) and verify direct `preWarm()` execution and warning fallback behavior:

  ```ts
  describe('preWarm', () => {
    it('calls preWarmModel on AiService with configured schema and instructions', async () => {
      const logSpy = vi.spyOn(console, 'log').mockReturnValue(undefined);

      await service.preWarm();

      expect(mockAiService.preWarmModel).toHaveBeenCalledTimes(1);
      expect(mockAiService.preWarmModel).toHaveBeenCalledWith(
        {
          systemInstruction: SYSTEM_INSTRUCTION,
          schema: ImageAnalysisSchema,
          contents: [],
        },
        {
          runDummyQuery: true,
          dummySize: 512,
        },
      );
      expect(logSpy).toHaveBeenCalledWith('Image analysis on-device engine and WebGPU shaders warmed successfully!');
    });

    it('handles preWarm failure gracefully and logs a warning', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockReturnValue(undefined);
      const preWarmError = new Error('WebGPU compilation error');
      mockAiService.preWarmModel.mockRejectedValueOnce(preWarmError);

      await service.preWarm();

      expect(warnSpy).toHaveBeenCalledWith(
        'Image analysis pre-warm sequence finished with warning/skip:',
        preWarmError,
      );
    });
  });
  ```

### 2. Trigger `preWarm()` in `afterNextRender` & Track `warmingMessage` (`src/app/features/image-analysis/image-analysis.component.ts`)

- [x] Add `afterNextRender` to `@angular/core` imports, declare `warmingMessage = signal<string>('')`, invoke `afterNextRender({ write: () => this.preWarm() })` in `constructor()`, update `preWarm()` to set/clear `warmingMessage` around `await this.#asyncImageAnalysisService()` and `await imageAnalysisService.preWarm()`, and remove the `this.preWarm()` call from `onFileSelected()`:

  ```ts
  import { afterNextRender, Component, computed, injectAsync, signal } from '@angular/core';
  ```

  ```ts
  // Local reactive states
  imageUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  analysisData = signal<StreamingAnalysisWithMetadata | null>(null);
  isLoading = signal(false);
  warmingMessage = signal<string>('');
  performance = signal(0);
  errorMessage = signal('');
  seconds = computed(() => formatDurationSeconds(this.performance()));

  constructor() {
    afterNextRender({
      write: async () => {
        await this.preWarm();
      },
    });
  }

  async preWarm(): Promise<void> {
    try {
      const imageAnalysisService = await this.#asyncImageAnalysisService();
      this.warmingMessage.set('Pre-warming on-device AI model...');
      await imageAnalysisService.preWarm();
    } catch (err: unknown) {
      console.warn('Model pre-warming skipped, falling back to cloud dynamically.', err);
    } finally {
      this.warmingMessage.set('');
    }
  }

  onFileSelected(file: File | null): void {
    this.selectedFile.set(file);
    this.analysisData.set(null);
    this.errorMessage.set('');
  }
  ```

### 3. Add CLS-Safe `.prewarm-status-slot`, Inline Action Flex Container & Remove `(filePickerOpened)` Binding (`src/app/features/image-analysis/image-analysis.component.html`)

- [x] Remove `(filePickerOpened)="preWarm()"` from `<app-image-uploader>`, place `<div class="prewarm-status-slot" role="status" aria-live="polite">` directly below `<app-image-uploader>`, and replace `<div class="action-container">` with `<div class="flex justify-center">` (keeping `<app-image-uploader>` and the "Analyze Image" button 100% enabled at all times, independent of `isLoading()`):

  ```html
  <!-- Upload State Area -->
  <app-image-uploader [(imageUrl)]="imageUrl" (fileSelected)="onFileSelected($event)"></app-image-uploader>

  <div class="prewarm-status-slot" role="status" aria-live="polite">
    @if (warmingMessage(); as message) {
    <div class="prewarm-status-badge">
      <app-sync-icon class="prewarm-status-icon" />
      <span class="prewarm-status-text">{{ message }}</span>
    </div>
    }
  </div>
  ```

  ```html
  <!-- Explicit Analyze Action Button -->
  @if (imageUrl() && !isLoading()) {
  <div class="flex justify-center">
    <button (click)="triggerAnalysis()" class="primary-action-btn">
      <app-psychology-icon />
      <span>Analyze Image ({{ seconds() }}s)</span>
    </button>
  </div>
  }
  ```

### 4. Style `.prewarm-status-slot` & Tighten Workspace Rhythm Using `@theme` Tokens (`src/app/features/image-analysis/image-analysis.component.css`)

- [x] Update `.workspace-container` to `space-y-6`, add `.workspace-container > app-image-uploader { @apply mb-0; }`, remove `.action-container`, and add `.prewarm-status-slot` (`min-h-9 my-0`), `.prewarm-status-badge`, `.prewarm-status-icon`, `.prewarm-status-text`, and dark-mode glass surface overrides to `src/app/features/image-analysis/image-analysis.component.css`:

  ```css
  .workspace-container {
    @apply space-y-6 max-w-(--spacing-container-max) mx-auto px-4 py-8;
  }

  .workspace-container > app-image-uploader {
    @apply mb-0;
  }
  ```

  ```css
  .prewarm-status-slot {
    @apply min-h-9 my-0 flex items-center justify-center;
  }

  .prewarm-status-badge {
    @apply inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border transition-opacity duration-300 ease-out;
    background: var(--color-surface-glass);
    border-color: var(--color-surface-glass-border);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .prewarm-status-icon {
    @apply w-4 h-4 animate-spin motion-reduce:animate-none text-primary shrink-0;
  }

  .prewarm-status-text {
    @apply text-xs font-semibold tracking-wide text-(--color-on-surface-variant) font-mono;
  }

  :host-context(.dark) .prewarm-status-badge {
    background: var(--color-surface-glass-dark);
    border-color: var(--color-surface-glass-border-dark);
  }
  ```

### 5. Update Component Unit Tests (`src/app/features/image-analysis/image-analysis.component.spec.ts`)

- [x] Update `src/app/features/image-analysis/image-analysis.component.spec.ts` to verify:
  - `preWarm()` is triggered automatically once after initial render via `afterNextRender`.
  - While `mockImageAnalysisService.preWarm` is pending (using a deferred promise), `component.warmingMessage()` is `'Pre-warming on-device AI model...'` and `.prewarm-status-slot .prewarm-status-text` renders the status text in the DOM while `.prewarm-status-slot` has `role="status"` and `aria-live="polite"`.
  - Once `preWarm()` settles (resolves or rejects), `component.warmingMessage()` resets to `''` and `.prewarm-status-badge` is removed from `.prewarm-status-slot`.
  - `onFileSelected(file)` updates `selectedFile`, resets `analysisData` and `errorMessage`, and does not re-trigger `preWarm()`.

  ```ts
  it('should automatically prewarm model once after initial render via afterNextRender', async () => {
    await vi.waitFor(() => {
      expect(mockImageAnalysisService.preWarm).toHaveBeenCalledTimes(1);
    });
  });

  it('should display warmingMessage in a CLS-safe status slot while preWarm is pending and clear it once settled', async () => {
    let resolvePreWarm: () => void = () => undefined;
    mockImageAnalysisService.preWarm.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolvePreWarm = resolve;
      }),
    );

    const preWarmPromise = component.preWarm();
    await vi.waitFor(() => {
      expect(component.warmingMessage()).toBe('Pre-warming on-device AI model...');
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const statusSlot = compiled.querySelector('.prewarm-status-slot');
    expect(statusSlot).toBeTruthy();
    expect(statusSlot?.getAttribute('role')).toBe('status');
    expect(statusSlot?.getAttribute('aria-live')).toBe('polite');
    expect(statusSlot?.querySelector('.prewarm-status-text')?.textContent?.trim()).toBe(
      'Pre-warming on-device AI model...',
    );

    resolvePreWarm();
    await preWarmPromise;
    fixture.detectChanges();

    expect(component.warmingMessage()).toBe('');
    expect(compiled.querySelector('.prewarm-status-slot')).toBeTruthy();
    expect(compiled.querySelector('.prewarm-status-badge')).toBeNull();
  });

  it('should log a warning and reset warmingMessage to empty string when preWarm rejects', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockReturnValue(undefined);
    const preWarmError = new Error('Pre-warm failed');
    mockImageAnalysisService.preWarm.mockRejectedValueOnce(preWarmError);

    await component.preWarm();
    fixture.detectChanges();

    expect(warnSpy).toHaveBeenCalledWith('Model pre-warming skipped, falling back to cloud dynamically.', preWarmError);
    expect(component.warmingMessage()).toBe('');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.prewarm-status-badge')).toBeNull();
  });

  it('should select file on onFileSelected without re-triggering preWarm', () => {
    mockImageAnalysisService.preWarm.mockClear();
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    component.onFileSelected(file);

    expect(component.selectedFile()).toBe(file);
    expect(component.analysisData()).toBeNull();
    expect(component.errorMessage()).toBe('');
    expect(mockImageAnalysisService.preWarm).not.toHaveBeenCalled();
  });
  ```

### 6. Synchronize Domain & Architecture Documentation

- [x] Update `GLOSSARY.md` (`On-Device Pre-Warming`) to reflect that pre-warming runs automatically once after initial component render (`afterNextRender`) with a non-blocking status indicator (`warmingMessage`) while keeping upload and analysis controls enabled.
- [x] Update `docs/adr/0024-inject-async-and-non-blocking-prewarm.md` to record:
  - Triggering `preWarm()` once inside `constructor()` via `afterNextRender` instead of `(filePickerOpened)` or `onFileSelected()`.
  - Removing `#preWarmPromise` memoization from `ImageAnalysisService` in favor of single-execution `afterNextRender` orchestration.
  - Component-local `warmingMessage = signal<string>('')` inside `ImageAnalysisComponent` (setting `'Pre-warming on-device AI model...'` after `await this.#asyncImageAnalysisService()` and before `await imageAnalysisService.preWarm()`, and clearing it in `finally`).
  - Rendering `.prewarm-status-slot` (`min-h-9 my-0`, `role="status"`, `aria-live="polite"`) below `<app-image-uploader>` (`mb-0`) for 0.000 CLS.
- [x] Update `DESIGN.md` (§5.3) to document the `.prewarm-status-slot` and `.prewarm-status-badge` pattern and its `@theme` tokens (`--color-surface-glass`, `--color-surface-glass-border`, `--color-surface-glass-dark`, `--color-surface-glass-border-dark`, `--color-on-surface-variant`, `--color-primary`).
- [x] Run targeted unit tests for `image-analysis.service.spec.ts` and `image-analysis.component.spec.ts` plus `npm run lint` and verify zero errors.
