import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});
