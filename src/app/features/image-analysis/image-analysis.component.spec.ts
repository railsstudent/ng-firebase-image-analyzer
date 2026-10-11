import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import ImageAnalysisComponent from './image-analysis.component';
import { ImageAnalysisService } from '@/core/image-analysis';

describe('ImageAnalysisComponent', () => {
  let component: ImageAnalysisComponent;
  let fixture: ComponentFixture<ImageAnalysisComponent>;

  let mockImageAnalysisService: Partial<ImageAnalysisService>;

  beforeEach(async () => {
    mockImageAnalysisService = {
      warmingMessage: signal(''),
      preWarm: vi.fn().mockResolvedValue(undefined),
      analyzeImageStream: vi.fn().mockReturnValue({
        async *[Symbol.asyncIterator]() {
          yield {
            analysis: { tags: [] },
            source: 'cloud',
          };
        },
      }),
    } satisfies Partial<ImageAnalysisService>;

    await TestBed.configureTestingModule({
      imports: [ImageAnalysisComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ImageAnalysisService, useValue: mockImageAnalysisService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageAnalysisComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute seconds formatted to one decimal place', () => {
    component.performance.set(1240);
    expect(component.seconds()).toBe('1.2');

    component.performance.set(0);
    expect(component.seconds()).toBe('0.0');

    component.performance.set(450);
    expect(component.seconds()).toBe('0.5');
  });
});
