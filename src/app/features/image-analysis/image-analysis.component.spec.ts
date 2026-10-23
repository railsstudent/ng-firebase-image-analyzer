import { ImageAnalysisService } from '@/core/image-analysis';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import ImageAnalysisComponent from './image-analysis.component';

describe('ImageAnalysisComponent', () => {
  let component: ImageAnalysisComponent;
  let fixture: ComponentFixture<ImageAnalysisComponent>;

  let mockImageAnalysisService: {
    preWarm: ReturnType<typeof vi.fn>;
    analyzeImageStream: ReturnType<typeof vi.fn>;
  };

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
    await vi.waitFor(() => {
      expect(mockImageAnalysisService.preWarm).toHaveBeenCalledTimes(1);
    });
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

  it('should automatically prewarm model once after initial render via afterNextRender', () => {
    expect(mockImageAnalysisService.preWarm).toHaveBeenCalledTimes(1);
  });

  it('should display warmingMessage in a CLS-safe status slot while preWarm is pending and clear it once settled', async () => {
    let resolvePreWarm: () => void = () => undefined;
    mockImageAnalysisService.preWarm.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolvePreWarm = resolve;
      }),
    );

    const preWarmPromise = component.preWarm();
    await vi.waitFor(() => {
      expect(component.warmingMessage()).toBe('Pre-warming on-device AI model...');
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const statusSlot = compiled.querySelector('.prewarm-status-slot');
    expect(statusSlot).toBeTruthy();
    expect(statusSlot?.getAttribute('role')).toBe('status');
    expect(statusSlot?.getAttribute('aria-live')).toBe('polite');
    expect(statusSlot?.querySelector('.prewarm-status-text')?.textContent?.trim()).toBe(
      'Pre-warming on-device AI model...',
    );

    resolvePreWarm();
    await preWarmPromise;
    fixture.detectChanges();

    expect(component.warmingMessage()).toBe('');
    expect(compiled.querySelector('.prewarm-status-slot')).toBeTruthy();
    expect(compiled.querySelector('.prewarm-status-badge')).toBeNull();
  });

  it('should log a warning and reset warmingMessage to empty string when preWarm rejects', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockReturnValue(undefined);
    const preWarmError = new Error('Pre-warm failed');
    mockImageAnalysisService.preWarm.mockRejectedValueOnce(preWarmError);

    await component.preWarm();
    fixture.detectChanges();

    expect(warnSpy).toHaveBeenCalledWith('Model pre-warming skipped, falling back to cloud dynamically.', preWarmError);
    expect(component.warmingMessage()).toBe('');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.prewarm-status-badge')).toBeNull();
  });

  it('should select file on onFileSelected without re-triggering preWarm', () => {
    mockImageAnalysisService.preWarm.mockClear();
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    component.onFileSelected(file);

    expect(component.selectedFile()).toBe(file);
    expect(component.analysisData()).toBeNull();
    expect(component.errorMessage()).toBe('');
    expect(mockImageAnalysisService.preWarm).not.toHaveBeenCalled();
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
    const emptyPlaceholder = compiled.querySelector('.space-y-3 .empty-state-text');
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

  it('should render empty analysis panel placeholder card initially when analysisData is null', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const analysisPlaceholder = compiled.querySelector('.section-card .empty-state-text');
    expect(analysisPlaceholder?.textContent).toContain(
      "No analysis results available yet. Upload an image and click 'Analyze Image' to inspect AI insights.",
    );
    expect(compiled.querySelector('app-image-analysis-panel')).toBeNull();
  });

  it('should hydrate deferred ImageAnalysisPanelComponent when analysisData is set', async () => {
    component.analysisData.set({
      analysis: {
        tags: [{ name: 'Landscape', sentence: 'Panoramic mountain view' }],
      },
      source: 'cloud',
    } as never);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-image-analysis-panel')).toBeTruthy();
  });
});
