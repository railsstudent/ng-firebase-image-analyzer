import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import ImageAnalysis from './image-analysis';
import { ImageAnalysisService } from '@/features/image-analysis/services/image-analysis';

describe('ImageAnalysis', () => {
  let component: ImageAnalysis;
  let fixture: ComponentFixture<ImageAnalysis>;

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  let mockImageAnalysisService: any;

  beforeEach(async () => {
    mockImageAnalysisService = {
      warmingMessage: signal(''),
      preWarm: vi.fn().mockResolvedValue(undefined),
      analyzeImage: vi.fn().mockResolvedValue({
        analysis: { tags: [] },
        source: 'cloud',
      }),
    };

    await TestBed.configureTestingModule({
      imports: [ImageAnalysis],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ImageAnalysisService, useValue: mockImageAnalysisService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageAnalysis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
