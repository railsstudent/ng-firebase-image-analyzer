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
});
