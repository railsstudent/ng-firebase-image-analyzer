import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ImageDownloadService } from '@/features/image-analysis/services/image-download.service';
import type { VisualCalibrationResult } from '@/features/image-analysis/interfaces/visual-calibration.interface';
import { EnhancedCanvasComponent } from './enhanced-canvas.component';

describe('EnhancedCanvasComponent', () => {
  let component: EnhancedCanvasComponent;
  let fixture: ComponentFixture<EnhancedCanvasComponent>;

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
    filterStyle: 'brightness(1.2) saturate(1.1) contrast(1) sepia(0.5) hue-rotate(15deg) ',
  };

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
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default container aspect ratio to "1" before image is loaded', () => {
    expect(component.containerAspectRatio()).toBe('1');
    expect(component.containerCss()).toEqual(mockCalibration.cropImage.containerStyle);
  });

  it('should dynamically update aspect ratio and containerCss on image load', () => {
    const mockEvent = {
      target: {
        naturalWidth: 800,
        naturalHeight: 400,
      },
    } as unknown as Event;

    component.onImageLoad(mockEvent);

    // Natural aspect ratio: 800 / 400 = 2.0
    // Crop width: 0.7 - 0.1 = 0.6; Crop height: 0.8 - 0.2 = 0.6
    // Corrected aspect: (0.6 / 0.6) * 2.0 = 2.0000
    expect(component.containerAspectRatio()).toBe('2.0000');
    expect(component.containerCss().aspectRatio).toBe('2.0000');
    expect(component.containerCss().overflow).toBe('hidden');
  });

  it('should display placeholder when imageUrl is null', () => {
    fixture.componentRef.setInput('imageUrl', null);
    fixture.detectChanges();

    const placeholder = fixture.debugElement.query(By.css('.no-image-placeholder'));
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
