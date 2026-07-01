import { TestBed } from '@angular/core/testing';
import { ImageEffect } from './image-effect';

describe('CssStyling', () => {
  let service: ImageEffect;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageEffect);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
