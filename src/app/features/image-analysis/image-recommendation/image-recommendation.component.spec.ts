import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ImageRecommendationComponent } from './image-recommendation.component';

describe('ImageRecommendationComponent', () => {
  let component: ImageRecommendationComponent;
  let fixture: ComponentFixture<ImageRecommendationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageRecommendationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageRecommendationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render skeleton fallback when recommendations is undefined', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const skeletonEl = fixture.nativeElement.querySelector('app-list-skeleton');
    expect(skeletonEl).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-recommendation-list')).toBeNull();
  });

  it('should render recommendation list and items when recommendations are provided', async () => {
    fixture.componentRef.setInput('recommendations', [
      {
        recommendation: 'Improve Framing',
        sentence: 'Shift subject towards lower third for more dynamic appeal.',
      },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-list-skeleton')).toBeNull();
    const listEl = fixture.nativeElement.querySelector('app-recommendation-list');
    expect(listEl).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Improve Framing');
    expect(fixture.nativeElement.textContent).toContain('Shift subject towards lower third');
  });
});
