# 07: Remove Obsolete filePickerOpened Output from ImageUploaderComponent

**What to build:**
Retire the obsolete `filePickerOpened` output from `ImageUploaderComponent` and its unit test suite now that on-device Gemini Nano pre-warming is triggered automatically after initial render rather than on file picker activation.

**Blocked by:** None (can be developed concurrently with 06; merge after 06 removes the `(filePickerOpened)` template binding)

**Status:** ready-for-agent

## Acceptance Criteria & Implementation Checklist

### 1. Remove `filePickerOpened` from `ImageUploaderComponent` (`src/app/shared/ui/image-uploader/image-uploader.component.ts`)

- [ ] Remove `filePickerOpened = output();` and `this.filePickerOpened.emit();` inside `openFilePicker()` (keep `output` in `@angular/core` imports for `fileSelected = output<File | null>()`):

  ```ts
  export class ImageUploaderComponent {
    imageUrl = model<string | null>(null);
    maxSize = input<number>(MAX_FILE_SIZE_MB); // Default 20MB

    fileSelected = output<File | null>();

    isDragging = signal<boolean>(false);
    errorMessage = signal<string | null>(null);
  ```

  ```ts
  openFilePicker(fileInput: HTMLInputElement, event?: Event): void {
    event?.preventDefault();
    fileInput.click();
  }
  ```

### 2. Update `ImageUploaderComponent` Unit Tests (`src/app/shared/ui/image-uploader/image-uploader.component.spec.ts`)

- [ ] Update `describe('Seam 1: File Picker Activation (Click & Keyboard Accessibility)', ...)` to assert `fileInputClickSpy` without `filePickerOpenedSpy`:

  ```ts
  describe('Seam 1: File Picker Activation (Click & Keyboard Accessibility)', () => {
    it('should click native file input on panel click', async () => {
      const panel = fixture.nativeElement.querySelector('.uploader-panel') as HTMLElement;
      const fileInput = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
      const fileInputClickSpy = vi.spyOn(fileInput, 'click');

      panel.click();
      await fixture.whenStable();

      expect(fileInputClickSpy).toHaveBeenCalledTimes(1);
    });

    it('should click input on Enter keydown on panel', async () => {
      const panel = fixture.nativeElement.querySelector('.uploader-panel') as HTMLElement;
      const fileInput = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
      const fileInputClickSpy = vi.spyOn(fileInput, 'click');

      panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await fixture.whenStable();

      expect(fileInputClickSpy).toHaveBeenCalledTimes(1);
    });

    it('should prevent default and click input on Space keydown on panel', async () => {
      const panel = fixture.nativeElement.querySelector('.uploader-panel') as HTMLElement;
      const fileInput = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
      const fileInputClickSpy = vi.spyOn(fileInput, 'click');

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      panel.dispatchEvent(spaceEvent);
      await fixture.whenStable();

      expect(fileInputClickSpy).toHaveBeenCalledTimes(1);
      expect(spaceEvent.defaultPrevented).toBe(true);
    });
  });
  ```

- [ ] Update `describe('Seam 3: Image Removal & Event Isolation', ...)` to assert that clicking or pressing Enter on `.remove-btn` does not click the native `input[type="file"]` element (`expect(fileInputClickSpy).not.toHaveBeenCalled()`):

  ```ts
  describe('Seam 3: Image Removal & Event Isolation', () => {
    it('should remove image, reset input value, emit fileSelected(null), and stop click bubbling', async () => {
      component.imageUrl.set('data:image/png;base64,sample');
      await fixture.whenStable();

      const fileSelectedSpy = vi.fn();
      component.fileSelected.subscribe(fileSelectedSpy);

      const fileInput = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
      const fileInputClickSpy = vi.spyOn(fileInput, 'click');

      const removeBtn = fixture.nativeElement.querySelector('.remove-btn') as HTMLButtonElement;
      expect(removeBtn).toBeTruthy();

      removeBtn.click();
      await fixture.whenStable();

      expect(component.imageUrl()).toBeNull();
      expect(fileSelectedSpy).toHaveBeenCalledWith(null);
      // Event isolation: native file input must NOT be clicked
      expect(fileInputClickSpy).not.toHaveBeenCalled();
    });

    it('should stop keydown propagation on remove button and not open file picker on Enter', async () => {
      component.imageUrl.set('data:image/png;base64,sample');
      await fixture.whenStable();

      const fileInput = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
      const fileInputClickSpy = vi.spyOn(fileInput, 'click');

      const removeBtn = fixture.nativeElement.querySelector('.remove-btn') as HTMLButtonElement;
      expect(removeBtn).toBeTruthy();

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      removeBtn.dispatchEvent(enterEvent);
      await fixture.whenStable();

      // Keyboard event isolation: native file input must NOT be clicked
      expect(fileInputClickSpy).not.toHaveBeenCalled();
    });
  });
  ```

- [ ] Run targeted unit tests for `src/app/shared/ui/image-uploader/image-uploader.component.spec.ts` and `npm run lint` (once Ticket 06 is merged) and verify zero errors.
