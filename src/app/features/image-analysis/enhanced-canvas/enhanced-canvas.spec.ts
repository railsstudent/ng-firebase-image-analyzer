import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnhancedCanvas } from './enhanced-canvas';

describe('EnhancedCanvas', () => {
  let component: EnhancedCanvas;
  let fixture: ComponentFixture<EnhancedCanvas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnhancedCanvas],
    }).compileComponents();

    fixture = TestBed.createComponent(EnhancedCanvas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
