import { ComponentFixture, TestBed } from '@angular/core/testing';

import ImageAnalysis from './image-analysis';

describe('ImageAnalysis', () => {
  let component: ImageAnalysis;
  let fixture: ComponentFixture<ImageAnalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageAnalysis],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageAnalysis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
