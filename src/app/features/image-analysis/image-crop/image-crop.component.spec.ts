import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { VisualCalibrationResult } from '@/features/image-analysis/interfaces/visual-calibration.interface';
import { ImageCropComponent } from './image-crop.component';

describe('ImageCropComponent', () => {
  let component: ImageCropComponent;
  let fixture: ComponentFixture<ImageCropComponent>;

  const createMockCalibration = (
    safeColorAdjustment: VisualCalibrationResult['safeColorAdjustment'] = undefined,
    cropPosition = 'X: 0.1–0.9 | Y: 0.2–0.8',
    aspectRatio = '16 / 9',
  ): VisualCalibrationResult => ({
    safeCrop: { xMin: 0.1, yMin: 0.2, xMax: 0.9, yMax: 0.8 },
    safeColorAdjustment,
    cropImage: {
      containerStyle: { position: 'relative', aspectRatio, overflow: 'hidden', width: '100%' },
      imageStyle: {
        position: 'absolute',
        width: '125%',
        left: '-12.5%',
        top: '-33.33%',
        maxWidth: 'none',
        maxHeight: 'none',
      },
      crop: { xMin: 0.1, yMin: 0.2, xMax: 0.9, yMax: 0.8 },
    },
    aspectRatio,
    cropPosition,
    filterStyle: '',
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCropComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCropComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('calibration', createMockCalibration());
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render crop bounds and aspect ratio in metadata section', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Crop Bounds:');
    expect(text).toContain('X: 0.1–0.9 | Y: 0.2–0.8');
    expect(text).toContain('Aspect Ratio:');
    expect(text).toContain('16 / 9');
  });

  it('should format applied filter labels and values when safeColorAdjustment is present', async () => {
    const populatedCalibration = createMockCalibration({
      brightness: 1.25,
      saturation: 1.5,
      contrast: 0.85,
      warmth: 0.4,
    });

    fixture.componentRef.setInput('calibration', populatedCalibration);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.appliedFilters()).toEqual([
      { label: 'Brightness', value: 1.25 },
      { label: 'Saturation', value: 1.5 },
      { label: 'Contrast', value: 0.85 },
      { label: 'Warmth', value: 0.4 },
    ]);

    const items = fixture.debugElement.queryAll(By.css('.specs-box:nth-child(2) li'));
    expect(items.length).toBe(4);
    expect(items[0].nativeElement.textContent).toContain('Brightness: 1.25');
    expect(items[1].nativeElement.textContent).toContain('Saturation: 1.5');
    expect(items[2].nativeElement.textContent).toContain('Contrast: 0.85');
    expect(items[3].nativeElement.textContent).toContain('Warmth: 0.4');
  });

  it('should display "N/A" fallback for all filters when safeColorAdjustment is undefined', async () => {
    const emptyCalibration = createMockCalibration(undefined);
    fixture.componentRef.setInput('calibration', emptyCalibration);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.appliedFilters()).toEqual([
      { label: 'Brightness', value: 'N/A' },
      { label: 'Saturation', value: 'N/A' },
      { label: 'Contrast', value: 'N/A' },
      { label: 'Warmth', value: 'N/A' },
    ]);

    const items = fixture.debugElement.queryAll(By.css('.specs-box:nth-child(2) li'));
    items.forEach((item) => {
      expect(item.nativeElement.textContent).toContain('N/A');
    });
  });
});
