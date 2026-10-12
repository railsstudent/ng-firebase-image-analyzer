import { ImageAnalysisService } from '@/core/image-analysis';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import ImageAnalysisComponent from './image-analysis.component';

describe('ImageAnalysisComponent', () => {
  let component: ImageAnalysisComponent;
  let fixture: ComponentFixture<ImageAnalysisComponent>;

  let mockImageAnalysisService: Partial<ImageAnalysisService>;

  beforeEach(async () => {
    mockImageAnalysisService = {
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

  it('should prewarm model on preWarm when WebGPU is supported', async () => {
    await component.preWarm();

    expect(mockImageAnalysisService.preWarm).toHaveBeenCalled();
  });

  it('should select file on onFileSelected', () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    component.onFileSelected(file);

    expect(component.selectedFile()).toBe(file);
    expect(component.analysisData()).toBeNull();
    expect(component.errorMessage()).toBe('');
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

  it('should reset state on onFileSelected', () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    component.selectedFile.set(file);
    component.analysisData.set({ analysis: { tags: [] }, source: 'cloud' } as never);

    component.onFileSelected(null);

    expect(component.selectedFile()).toBeNull();
    expect(component.analysisData()).toBeNull();
  });

  it('should render empty tag placeholder initially when no tags exist', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyPlaceholder = compiled.querySelector('.tag-cloud-section .empty-state-text');
    expect(emptyPlaceholder?.textContent).toContain(
      'No tags detected yet. Run image analysis to extract visual labels.',
    );
    expect(compiled.querySelector('app-tag-list')).toBeNull();
  });

  it('should hydrate deferred TagListComponent when tags are populated', async () => {
    component.analysisData.set({
      analysis: {
        tags: [{ name: 'Landscape', sentence: 'Panoramic mountain view' }],
      },
      source: 'cloud',
    } as never);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-tag-list')).toBeTruthy();
  });
});
