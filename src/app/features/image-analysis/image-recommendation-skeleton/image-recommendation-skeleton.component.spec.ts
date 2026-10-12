import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageRecommendationSkeletonComponent } from './image-recommendation-skeleton.component';

describe('ImageRecommendationSkeletonComponent', () => {
  let component: ImageRecommendationSkeletonComponent;
  let fixture: ComponentFixture<ImageRecommendationSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageRecommendationSkeletonComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageRecommendationSkeletonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render pulse container and rows matching rowWidthStyles', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.animate-pulse')).toBeTruthy();

    const circles = compiled.querySelectorAll('.skeleton-circle');
    expect(circles.length).toBe(component.rowWidthStyles.length);

    const lines = compiled.querySelectorAll('.skeleton-line');
    const totalExpectedLines = component.rowWidthStyles.reduce((acc, row) => acc + row.length, 0);
    expect(lines.length).toBe(totalExpectedLines);
  });
});
