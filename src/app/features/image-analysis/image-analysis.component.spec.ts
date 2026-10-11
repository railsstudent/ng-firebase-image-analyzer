import { WINDOW } from '@/core/constants/navigator.const';
import { ImageAnalysisService } from '@/core/image-analysis';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import ImageAnalysisComponent from './image-analysis.component';

describe('ImageAnalysisComponent', () => {
  let component: ImageAnalysisComponent;
  let fixture: ComponentFixture<ImageAnalysisComponent>;

  let mockImageAnalysisService: Partial<ImageAnalysisService>;
  const mockWindow = {
    navigator: {
      gpu: {},
    },
  } as unknown as Window;

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
        { provide: WINDOW, useValue: mockWindow },
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

  it('should prewarm model when file is selected and WebGPU is supported', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    await component.onFileSelected(file);

    expect(component.selectedFile()).toBe(file);
    expect(mockImageAnalysisService.preWarm).toHaveBeenCalled();
  });

  it('should trigger analysis stream and populate analysisData', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    component.selectedFile.set(file);

    await component.triggerAnalysis();

    expect(mockImageAnalysisService.analyzeImageStream).toHaveBeenCalledWith(file);
    expect(component.analysisData()).toEqual({
      analysis: { tags: [] },
      source: 'cloud',
    });
    expect(component.isLoading()).toBe(false);
  });

  it('should reset state on onImageRemoved', () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    component.selectedFile.set(file);
    component.analysisData.set({ analysis: { tags: [] }, source: 'cloud' } as never);

    component.onImageRemoved();

    expect(component.selectedFile()).toBeNull();
    expect(component.analysisData()).toBeNull();
  });
});
