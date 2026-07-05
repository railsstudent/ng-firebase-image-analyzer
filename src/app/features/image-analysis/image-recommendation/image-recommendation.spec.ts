import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageRecommendation } from './image-recommendation';

describe('Recommendation', () => {
  let component: ImageRecommendation;
  let fixture: ComponentFixture<ImageRecommendation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageRecommendation],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageRecommendation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
