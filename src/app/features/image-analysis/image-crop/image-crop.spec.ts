import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCrop } from './image-crop';

describe('ImageImprovement', () => {
  let component: ImageCrop;
  let fixture: ComponentFixture<ImageCrop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCrop],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCrop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
