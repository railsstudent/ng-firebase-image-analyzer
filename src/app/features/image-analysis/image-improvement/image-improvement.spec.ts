import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageImprovement } from './image-improvement';

describe('ImageImprovement', () => {
  let component: ImageImprovement;
  let fixture: ComponentFixture<ImageImprovement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageImprovement],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageImprovement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
