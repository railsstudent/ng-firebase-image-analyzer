import { ImageDownloadService } from '@/features/image-analysis/services/image-download.service';
import { createMockCalibration, createMockCropStyles } from '@/testing/visual-calibration.mock';
import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EnhancedCanvasComponent } from './enhanced-canvas.component';

describe('EnhancedCanvasComponent', () => {
  let component: EnhancedCanvasComponent;
  let fixture: ComponentFixture<EnhancedCanvasComponent>;

  const mockCalibration = createMockCalibration({
    cropPosition: 'X: 0.1–0.7 | Y: 0.2–0.8',
    filterStyle: 'brightness(1.2) saturate(1.1) contrast(1) sepia(0.5) hue-rotate(15deg) ',
  });
  const mockCropStyles = createMockCropStyles();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnhancedCanvasComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ImageDownloadService,
          useValue: { downloadFilteredCrop: vi.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EnhancedCanvasComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('calibration', mockCalibration);
    fixture.componentRef.setInput('cropStyles', mockCropStyles);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should bind container aspect ratio from cropStyles.containerStyle', () => {
    const container = fixture.debugElement.query(By.css('.canvas-container'));
    expect(container.nativeElement.style.aspectRatio).toBe(mockCropStyles.containerStyle.aspectRatio);
  });

  it('should emit naturalAspectRatioChange on image load', () => {
    const emitSpy = vi.spyOn(component.naturalAspectRatioChange, 'emit');
    const mockEvent = {
      target: {
        naturalWidth: 800,
        naturalHeight: 400,
      },
    } as unknown as Event;

    component.onImageLoad(mockEvent);

    expect(emitSpy).toHaveBeenCalledWith(2);
  });

  it('should emit null on naturalAspectRatioChange when image fails to load', () => {
    const emitSpy = vi.spyOn(component.naturalAspectRatioChange, 'emit');

    component.onImageError();

    expect(emitSpy).toHaveBeenCalledWith(null);
  });

  it('should display placeholder when imageUrl is null', () => {
    fixture.componentRef.setInput('imageUrl', null);
    fixture.detectChanges();

    const placeholder = fixture.debugElement.query(By.css('div.italic'));
    expect(placeholder).toBeTruthy();
    expect(placeholder.nativeElement.textContent).toContain('No image selected for preview');

    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeNull();
  });

  it('should render enhanced image preview and download button when imageUrl is provided', async () => {
    const testUrl = 'data:image/png;base64,testdata';
    fixture.componentRef.setInput('imageUrl', testUrl);
    fixture.detectChanges();
    await fixture.whenStable();

    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeTruthy();
    expect(img.nativeElement.getAttribute('src')).toBe(testUrl);
    expect(img.nativeElement.style.filter).toContain('brightness(1.2)');

    const downloadBtn = fixture.debugElement.query(By.css('.download-enhanced-btn'));
    expect(downloadBtn).toBeTruthy();
    expect(downloadBtn.nativeElement.textContent).toContain('Download PNG');

    const badge = fixture.debugElement.query(By.css('.canvas-badge'));
    expect(badge).toBeTruthy();
    expect(badge.nativeElement.textContent).toContain('AI ENHANCED');
  });
});
