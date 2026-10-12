import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  it('should render skeleton grid, canvas preview block, sidebar, and line placeholders', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.skeleton-grid')).toBeTruthy();
    expect(compiled.querySelector('.skeleton-block.skeleton-canvas-preview')).toBeTruthy();
    expect(compiled.querySelector('.skeleton-sidebar')).toBeTruthy();
    expect(compiled.querySelector('.skeleton-line.skeleton-header-line')).toBeTruthy();
    expect(compiled.querySelector('.skeleton-line.skeleton-primary-line')).toBeTruthy();
    expect(compiled.querySelector('.skeleton-line.skeleton-secondary-line')).toBeTruthy();
  });
});
