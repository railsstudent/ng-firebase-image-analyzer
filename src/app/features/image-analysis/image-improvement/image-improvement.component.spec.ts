import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageImprovementComponent } from './image-improvement.component';

describe('ImageImprovementComponent', () => {
  let component: ImageImprovementComponent;
  let fixture: ComponentFixture<ImageImprovementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageImprovementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageImprovementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show skeleton when imageUrl or analysis is missing or incomplete', () => {
    expect(component.showSkeleton()).toBe(true);

    fixture.componentRef.setInput('imageUrl', 'https://example.com/test.jpg');
    expect(component.showSkeleton()).toBe(true);

    fixture.componentRef.setInput('analysis', { crop: { xMin: 0.1, yMin: 0.1, xMax: 0.9, yMax: 0.9 } });
    expect(component.showSkeleton()).toBe(true);
  });

  it('should compute calibration and hide skeleton when valid inputs are provided', async () => {
    fixture.componentRef.setInput('imageUrl', 'https://example.com/test.jpg');
    fixture.componentRef.setInput('analysis', {
      crop: { xMin: 0.1, yMin: 0.1, xMax: 0.9, yMax: 0.9 },
      colorAdjustment: { brightness: 1.2, saturation: 1.1, contrast: 1.0, warmth: 0.2 },
    });
    await fixture.whenStable();

    expect(component.showSkeleton()).toBe(false);
    const cal = component.calibration();
    expect(cal.safeCrop).toEqual({ xMin: 0.1, yMin: 0.1, xMax: 0.9, yMax: 0.9 });
    expect(cal.cropPosition).toBe('X: 0.1–0.9 | Y: 0.1–0.9');
    expect(cal.filterStyle).toContain('brightness(1.2)');
    expect(cal.aspectRatio).toBe('0.8 / 0.8');
  });

  it('should render ImageImprovementSkeletonComponent in DOM when showSkeleton is true and improvement-grid when false', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-image-improvement-skeleton')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.improvement-grid')).toBeNull();

    fixture.componentRef.setInput('imageUrl', 'https://example.com/test.jpg');
    fixture.componentRef.setInput('analysis', {
      crop: { xMin: 0.1, yMin: 0.1, xMax: 0.9, yMax: 0.9 },
      colorAdjustment: { brightness: 1.2, saturation: 1.1, contrast: 1.0, warmth: 0.2 },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-image-improvement-skeleton')).toBeNull();
    expect(fixture.nativeElement.querySelector('.improvement-grid')).toBeTruthy();
  });
});
