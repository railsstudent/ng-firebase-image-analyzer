import { SkeletonComponent } from '@/shared/ui/components/skeleton/skeleton.component';
import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ImageImprovementSkeletonComponent } from './image-improvement-skeleton.component';

describe('ImageImprovementSkeletonComponent', () => {
  let component: ImageImprovementSkeletonComponent;
  let fixture: ComponentFixture<ImageImprovementSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageImprovementSkeletonComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageImprovementSkeletonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have container with aria-hidden="true" and responsive 2-column grid layout', () => {
    const container = fixture.nativeElement.querySelector('div');
    expect(container?.getAttribute('aria-hidden')).toBe('true');
    expect(container?.className).toContain('grid');
    expect(container?.className).toContain('grid-cols-1');
    expect(container?.className).toContain('md:grid-cols-2');
  });

  it('should render rect skeleton and line skeletons', () => {
    const skeletons = fixture.debugElement.queryAll(By.directive(SkeletonComponent));
    expect(skeletons.length).toBe(4);

    const rectSkeleton = skeletons.find((s) => s.componentInstance.variant() === 'rect');
    expect(rectSkeleton).toBeTruthy();

    const lineSkeletons = skeletons.filter((s) => s.componentInstance.variant() === 'line');
    expect(lineSkeletons.length).toBe(3);
  });
});
