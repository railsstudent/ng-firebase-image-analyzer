import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnhancedCanvasComponent } from './enhanced-canvas.component';

describe('EnhancedCanvasComponent', () => {
  let component: EnhancedCanvasComponent;
  let fixture: ComponentFixture<EnhancedCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnhancedCanvasComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(EnhancedCanvasComponent);
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
