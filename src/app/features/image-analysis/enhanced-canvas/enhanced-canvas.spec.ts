import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnhancedCanvas } from './enhanced-canvas';

describe('EnhancedCanvas', () => {
  let component: EnhancedCanvas;
  let fixture: ComponentFixture<EnhancedCanvas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnhancedCanvas],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(EnhancedCanvas);
    component = fixture.componentInstance;

    // Set required signal inputs before triggering initial change detection
    fixture.componentRef.setInput('cropImage', {
      crop: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
      containerStyle: {},
      imageStyle: {},
    });

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
