import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploaderComponent } from './image-uploader.component';

describe('ImageUploaderComponent', () => {
  let component: ImageUploaderComponent;
  let fixture: ComponentFixture<ImageUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploaderComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Seam 1: File Picker Activation (Click & Keyboard Accessibility)', () => {
    it('should emit filePickerOpened and click native file input on panel click', async () => {
      const filePickerOpenedSpy = vi.fn();
      component.filePickerOpened.subscribe(filePickerOpenedSpy);

      const panel = fixture.nativeElement.querySelector('.uploader-panel') as HTMLElement;
      const fileInput = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
      const fileInputClickSpy = vi.spyOn(fileInput, 'click');

      panel.click();
      await fixture.whenStable();

      expect(filePickerOpenedSpy).toHaveBeenCalledTimes(1);
      expect(fileInputClickSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit filePickerOpened and click input on Enter keydown on panel', async () => {
      const filePickerOpenedSpy = vi.fn();
      component.filePickerOpened.subscribe(filePickerOpenedSpy);

      const panel = fixture.nativeElement.querySelector('.uploader-panel') as HTMLElement;
      const fileInput = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
      const fileInputClickSpy = vi.spyOn(fileInput, 'click');

      panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await fixture.whenStable();

      expect(filePickerOpenedSpy).toHaveBeenCalledTimes(1);
      expect(fileInputClickSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit filePickerOpened, prevent default, and click input on Space keydown on panel', async () => {
      const filePickerOpenedSpy = vi.fn();
      component.filePickerOpened.subscribe(filePickerOpenedSpy);

      const panel = fixture.nativeElement.querySelector('.uploader-panel') as HTMLElement;
      const fileInput = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
      const fileInputClickSpy = vi.spyOn(fileInput, 'click');

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      panel.dispatchEvent(spaceEvent);
      await fixture.whenStable();

      expect(filePickerOpenedSpy).toHaveBeenCalledTimes(1);
      expect(fileInputClickSpy).toHaveBeenCalledTimes(1);
      expect(spaceEvent.defaultPrevented).toBe(true);
    });
  });

  describe('Seam 2: File Ingestion & Size Validation', () => {
    it('should emit fileSelected with File and set preview on valid file selection', async () => {
      const fileSelectedSpy = vi.fn();
      component.fileSelected.subscribe(fileSelectedSpy);

      const file = new File(['image-content'], 'sample.png', { type: 'image/png' });
      await component.handleFile(file);
      await fixture.whenStable();

      expect(fileSelectedSpy).toHaveBeenCalledWith(file);
      expect(component.imageUrl()).toContain('data:image/png;base64,');
      expect(component.errorMessage()).toBeNull();
    });

    it('should set error message and not emit fileSelected if file exceeds maxSize', async () => {
      const fileSelectedSpy = vi.fn();
      component.fileSelected.subscribe(fileSelectedSpy);

      // Create a 25MB file
      const largeFile = new File([new ArrayBuffer(25 * 1024 * 1024)], 'large.png', { type: 'image/png' });
      await component.handleFile(largeFile);
      await fixture.whenStable();

      expect(fileSelectedSpy).not.toHaveBeenCalled();
      expect(component.errorMessage()).toContain('File too large');
    });

    it('should toggle isDragging on dragover and dragleave', () => {
      const panel = fixture.nativeElement.querySelector('.uploader-panel') as HTMLElement;

      panel.dispatchEvent(new Event('dragover', { bubbles: true, cancelable: true }));
      expect(component.isDragging()).toBe(true);

      panel.dispatchEvent(new Event('dragleave', { bubbles: true, cancelable: true }));
      expect(component.isDragging()).toBe(false);
    });
  });

  describe('Seam 3: Image Removal & Event Isolation', () => {
    it('should remove image, reset input value, emit fileSelected(null), and stop click bubbling', async () => {
      component.imageUrl.set('data:image/png;base64,sample');
      await fixture.whenStable();

      const fileSelectedSpy = vi.fn();
      const filePickerOpenedSpy = vi.fn();
      component.fileSelected.subscribe(fileSelectedSpy);
      component.filePickerOpened.subscribe(filePickerOpenedSpy);

      const removeBtn = fixture.nativeElement.querySelector('.remove-btn') as HTMLButtonElement;
      expect(removeBtn).toBeTruthy();

      removeBtn.click();
      await fixture.whenStable();

      expect(component.imageUrl()).toBeNull();
      expect(fileSelectedSpy).toHaveBeenCalledWith(null);
      // Event isolation: filePickerOpened must NOT be triggered
      expect(filePickerOpenedSpy).not.toHaveBeenCalled();
    });

    it('should stop keydown propagation on remove button and not open file picker on Enter', async () => {
      component.imageUrl.set('data:image/png;base64,sample');
      await fixture.whenStable();

      const filePickerOpenedSpy = vi.fn();
      component.filePickerOpened.subscribe(filePickerOpenedSpy);

      const removeBtn = fixture.nativeElement.querySelector('.remove-btn') as HTMLButtonElement;
      expect(removeBtn).toBeTruthy();

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      removeBtn.dispatchEvent(enterEvent);
      await fixture.whenStable();

      // Keyboard event isolation: filePickerOpened must NOT be triggered
      expect(filePickerOpenedSpy).not.toHaveBeenCalled();
    });
  });
});
