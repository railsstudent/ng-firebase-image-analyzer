import { ImageDownloadService } from '@/features/image-analysis/services/image-download.service';
import { createMockCalibration } from '@/testing/visual-calibration.mock';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DownloadEnhancedDirective } from './download-enhanced.directive';

const mockCalibration = createMockCalibration({
  aspectRatio: '0.6 / 0.6',
  cropPosition: 'X: 0.1–0.7 | Y: 0.2–0.8',
  filterStyle: 'brightness(1.2) saturate(1.1)',
});

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

  it('should trigger downloadFilteredCrop with crop and precomputed filterStyle on button click', () => {
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

  it('should not trigger downloadFilteredCrop when imageUrl is null', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.imageUrl = null;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();

    expect(mockImageDownloadService.downloadFilteredCrop).not.toHaveBeenCalled();
  });
});
