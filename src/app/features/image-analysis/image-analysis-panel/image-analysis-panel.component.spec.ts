import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ImageImprovementComponent } from '@/features/image-analysis/image-improvement/image-improvement.component';
import { ThoughtSummaryComponent } from '@/shared/ui/components/thought-summary/thought-summary.component';
import { ImageAnalysisPanelComponent } from './image-analysis-panel.component';

describe('ImageAnalysisPanelComponent', () => {
  let component: ImageAnalysisPanelComponent;
  let fixture: ComponentFixture<ImageAnalysisPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageAnalysisPanelComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageAnalysisPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render empty state card when data is null', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyCard = compiled.querySelector('.analysis-section-card .empty-state-text');
    expect(emptyCard?.textContent).toContain(
      "No analysis results available yet. Upload an image and click 'Analyze Image' to inspect AI insights.",
    );
    expect(compiled.querySelector('.analysis-panel-container')).toBeNull();
  });

  it('should render analysis panel container when data is provided', async () => {
    fixture.componentRef.setInput('data', {
      analysis: {
        tags: [{ name: 'Test', sentence: 'Test description' }],
        alternativeTexts: [{ title: 'Alt 1', description: 'Alt description' }],
        recommendations: [{ category: 'Contrast', suggestions: ['Increase brightness'] }],
      },
      thoughtSummary: 'Model reasoning summary',
      tokenSummary: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
      tokenModalityBreakdown: { imageTokens: 80, textTokens: 20 },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.analysis-panel-container')).toBeTruthy();
    expect(compiled.querySelector('.empty-state-text')).toBeNull();
  });

  it('should map source correctly to displaySource', () => {
    expect(component.displaySource()).toBe('Unknown');

    fixture.componentRef.setInput('source', 'on_device');
    expect(component.displaySource()).toBe('Gemini Nano');

    fixture.componentRef.setInput('source', 'in_cloud');
    expect(component.displaySource()).toBe('Cloud AI');
  });

  it('should pass data, imageUrl, and default thoughtSummary fallback to child components', async () => {
    const mockAnalysis = {
      tags: [{ name: 'Test', sentence: 'Test' }],
      alternativeTexts: [{ title: 'Alt 1', description: 'Desc 1' }],
      recommendations: [{ category: 'Quality', suggestions: ['Sharpen'] }],
    };

    fixture.componentRef.setInput('data', {
      analysis: mockAnalysis,
      thoughtSummary: '',
      tokenSummary: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      tokenModalityBreakdown: { imageTokens: 10, textTokens: 0 },
    });
    fixture.componentRef.setInput('imageUrl', 'https://example.com/test.jpg');
    fixture.componentRef.setInput('source', 'on_device');
    fixture.detectChanges();
    await fixture.whenStable();

    const thoughtSummaryDebugEl = fixture.debugElement.query(By.directive(ThoughtSummaryComponent));
    expect(thoughtSummaryDebugEl).toBeTruthy();
    const thoughtSummaryComp = thoughtSummaryDebugEl.componentInstance as ThoughtSummaryComponent;
    expect(thoughtSummaryComp.thoughtSummary()).toBe('No technical logs provided.');
    expect(thoughtSummaryComp.displaySource()).toBe('Gemini Nano');
    expect(thoughtSummaryComp.remarks()).toEqual(mockAnalysis.alternativeTexts);

    const imageImprovementDebugEl = fixture.debugElement.query(By.directive(ImageImprovementComponent));
    expect(imageImprovementDebugEl).toBeTruthy();
    const imageImprovementComp = imageImprovementDebugEl.componentInstance as ImageImprovementComponent;
    expect(imageImprovementComp.analysis()).toEqual(mockAnalysis);
    expect(imageImprovementComp.imageUrl()).toBe('https://example.com/test.jpg');
  });
});
