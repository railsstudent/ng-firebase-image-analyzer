import type { VisualCalibrationResult } from '@/features/image-analysis/interfaces/visual-calibration.interface';
import { createMockCalibration } from '@/testing/visual-calibration.mock';
import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ImageCropComponent } from './image-crop.component';

const DEFAULT_APPLIED_FILTERS: VisualCalibrationResult['appliedFilters'] = [
  { label: 'Brightness', value: 'N/A' },
  { label: 'Saturation', value: 'N/A' },
  { label: 'Contrast', value: 'N/A' },
  { label: 'Warmth', value: 'N/A' },
];

describe('ImageCropComponent', () => {
  let component: ImageCropComponent;
  let fixture: ComponentFixture<ImageCropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCropComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCropComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'calibration',
      createMockCalibration({
        appliedFilters: DEFAULT_APPLIED_FILTERS,
        cropPosition: 'X: 0.1–0.9 | Y: 0.2–0.8',
      }),
    );
    fixture.componentRef.setInput('aspectRatio', '16 / 9');
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

  it('should render applied filter labels and values from calibration.appliedFilters', async () => {
    const populatedCalibration = createMockCalibration({
      appliedFilters: [
        { label: 'Brightness', value: 1.25 },
        { label: 'Saturation', value: 1.5 },
        { label: 'Contrast', value: 0.85 },
        { label: 'Warmth', value: 0.4 },
      ],
    });

    fixture.componentRef.setInput('calibration', populatedCalibration);
    fixture.detectChanges();
    await fixture.whenStable();

    const items = fixture.debugElement.queryAll(By.css('.specs-box:nth-child(2) li'));
    expect(items.length).toBe(4);
    expect(items[0].nativeElement.textContent).toContain('Brightness: 1.25');
    expect(items[1].nativeElement.textContent).toContain('Saturation: 1.5');
    expect(items[2].nativeElement.textContent).toContain('Contrast: 0.85');
    expect(items[3].nativeElement.textContent).toContain('Warmth: 0.4');
  });

  it('should display "N/A" fallback for all filters when calibration.appliedFilters has N/A values', async () => {
    const emptyCalibration = createMockCalibration({
      appliedFilters: DEFAULT_APPLIED_FILTERS,
      cropPosition: 'X: 0.1–0.9 | Y: 0.2–0.8',
    });
    fixture.componentRef.setInput('calibration', emptyCalibration);
    fixture.detectChanges();
    await fixture.whenStable();

    const items = fixture.debugElement.queryAll(By.css('.specs-box:nth-child(2) li'));
    expect(items.length).toBe(4);
    items.forEach((item) => {
      expect(item.nativeElement.textContent).toContain('N/A');
    });
  });
});
