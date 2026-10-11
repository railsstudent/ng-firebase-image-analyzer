import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCropComponent } from './image-crop.component';

describe('ImageCropComponent', () => {
  let component: ImageCropComponent;
  let fixture: ComponentFixture<ImageCropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCropComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCropComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
