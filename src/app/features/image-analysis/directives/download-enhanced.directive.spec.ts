import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { VisualCalibrationResult } from '@/features/image-analysis/interfaces/visual-calibration.interface';
import { ImageDownloadService } from '@/features/image-analysis/services/image-download.service';
import { DownloadEnhancedDirective } from './download-enhanced.directive';

const mockCalibration: VisualCalibrationResult = {
  safeCrop: { xMin: 0.1, yMin: 0.2, xMax: 0.7, yMax: 0.8 },
  safeColorAdjustment: { brightness: 1.2, saturation: 1.1, contrast: 1.0, warmth: 0.5 },
  cropImage: {
    containerStyle: {
      position: 'relative',
      aspectRatio: '0.6 / 0.6',
      overflow: 'hidden',
      width: '100%',
    },
    imageStyle: {
      position: 'absolute',
      width: '166.67%',
      left: '-16.67%',
      top: '-33.33%',
      maxWidth: 'none',
      maxHeight: 'none',
    },
    crop: { xMin: 0.1, yMin: 0.2, xMax: 0.7, yMax: 0.8 },
  },
  aspectRatio: '0.6 / 0.6',
  cropPosition: 'X: 0.1–0.7 | Y: 0.2–0.8',
  filterStyle: 'brightness(1.2) saturate(1.1)',
};

@Component({
  template: ` <button [appDownloadEnhanced]="imageUrl" [calibration]="calibration">Download</button> `,
  imports: [DownloadEnhancedDirective],
})
class TestHostComponent {
  imageUrl: string | null = 'test-url';
  calibration = mockCalibration;
}

describe('DownloadEnhancedDirective', () => {
  let mockImageDownloadService: Partial<ImageDownloadService>;

  beforeEach(() => {
    mockImageDownloadService = {
      downloadFilteredCrop: vi.fn(),
    } satisfies Partial<ImageDownloadService>;

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ImageDownloadService, useValue: mockImageDownloadService },
      ],
    });
  });

  it('should create an instance via host component', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(fixture).toBeTruthy();
  });

  it('should trigger downloadFilteredCrop with crop and precomputed filterStyle on button click', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();

    expect(mockImageDownloadService.downloadFilteredCrop).toHaveBeenCalledWith({
      url: 'test-url',
      crop: mockCalibration.cropImage.crop,
      filterStyle: mockCalibration.filterStyle,
      filename: 'enhanced-image.png',
    });
  });

  it('should not trigger downloadFilteredCrop when imageUrl is null', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.imageUrl = null;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();

    expect(mockImageDownloadService.downloadFilteredCrop).not.toHaveBeenCalled();
  });
});
