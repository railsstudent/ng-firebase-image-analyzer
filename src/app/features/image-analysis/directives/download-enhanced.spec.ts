import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DownloadEnhancedDirective } from './download-enhanced';
import { ImageDownloadService } from '@/features/image-analysis/services/image-download';

@Component({
  template: ` <button [appDownloadEnhanced]="imageUrl" [crop]="crop" [filter]="filter">Download</button> `,
  imports: [DownloadEnhancedDirective],
})
class TestHostComponent {
  imageUrl = 'test-url';
  crop = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };
  filter = undefined;
}

describe('DownloadEnhanced', () => {
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  let mockImageDownloadService: any;

  beforeEach(() => {
    mockImageDownloadService = {
      downloadFilteredCrop: vi.fn().mockResolvedValue(undefined),
    };

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
});
