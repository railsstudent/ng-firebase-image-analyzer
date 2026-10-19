import type { DisplaySource } from '@/core/firebase';
import { ImageImprovementSkeletonComponent } from '@/features/image-analysis/image-improvement/image-improvement-skeleton.component';
import { ImageImprovementComponent } from '@/features/image-analysis/image-improvement/image-improvement.component';
import { ImageRecommendationComponent } from '@/features/image-analysis/image-recommendation/image-recommendation.component';
import { ListSkeletonComponent } from '@/shared/ui/components/skeleton';
import { ThoughtSummaryComponent } from '@/shared/ui/components/thought-summary/thought-summary.component';
import { TokenAnalyticsComponent } from '@/shared/ui/components/token-analytics/token-analytics.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ImageAnalysisPanelComponent } from './image-analysis-panel.component';

describe('ImageAnalysisPanelComponent', () => {
  let component: ImageAnalysisPanelComponent;
  let fixture: ComponentFixture<ImageAnalysisPanelComponent>;

  const mockAnalysisData = {
    analysis: {
      tags: [{ name: 'Test', sentence: 'Test description' }],
      alternativeTexts: [{ title: 'Alt 1', description: 'Alt description' }],
      recommendations: [{ category: 'Contrast', suggestions: ['Increase brightness'] }],
    },
    thoughtSummary: 'Model reasoning summary',
    tokenSummary: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
    tokenModalityBreakdown: { imageTokens: 80, textTokens: 20 },
    source: 'on_device' as const,
    displaySource: 'Gemini Nano' as DisplaySource,
  };

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
    const emptyCard = compiled.querySelector('.section-card .empty-state-text');
    expect(emptyCard?.textContent).toContain(
      "No analysis results available yet. Upload an image and click 'Analyze Image' to inspect AI insights.",
    );
    expect(compiled.querySelector('.analysis-panel-container')).toBeNull();
  });

  it('should render analysis panel container when data is provided', async () => {
    fixture.componentRef.setInput('data', mockAnalysisData);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.panel-container')).toBeTruthy();
    expect(compiled.querySelector('.empty-state-text')).toBeNull();
  });

  it('should discover all 4 tab headers immediately on initial render', async () => {
    fixture.componentRef.setInput('data', mockAnalysisData);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const tabButtons = compiled.querySelectorAll('.tab-header-btn');
    expect(tabButtons.length).toBe(4);
    expect(tabButtons[0].textContent).toContain('Thought Summary');
    expect(tabButtons[1].textContent).toContain('Recommendations');
    expect(tabButtons[2].textContent).toContain('Token Usage');
    expect(tabButtons[3].textContent).toContain('Image Improvement');
  });

  it('should immediately render default active ThoughtSummaryComponent and skeleton placeholders for secondary tabs', async () => {
    fixture.componentRef.setInput('data', {
      ...mockAnalysisData,
      thoughtSummary: '',
    });
    fixture.componentRef.setInput('imageUrl', 'https://example.com/test.jpg');
    fixture.detectChanges();
    await fixture.whenStable();

    // Default active tab is rendered immediately without deferral
    const thoughtSummaryEl = fixture.debugElement.query(By.directive(ThoughtSummaryComponent));
    expect(thoughtSummaryEl).toBeTruthy();
    const thoughtSummaryComp = thoughtSummaryEl.componentInstance as ThoughtSummaryComponent;
    expect(thoughtSummaryComp.thoughtSummary()).toBe('No technical logs provided.');
    expect(thoughtSummaryComp.displaySource()).toBe('Gemini Nano');
    expect(thoughtSummaryComp.remarks()).toEqual(mockAnalysisData.analysis.alternativeTexts);

    // Inactive tabs render skeleton placeholders initially
    expect(fixture.debugElement.query(By.directive(ListSkeletonComponent))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(ImageImprovementSkeletonComponent))).toBeTruthy();

    // Deferred components are not yet rendered
    expect(fixture.debugElement.query(By.directive(ImageRecommendationComponent))).toBeNull();
    expect(fixture.debugElement.query(By.directive(TokenAnalyticsComponent))).toBeNull();
    expect(fixture.debugElement.query(By.directive(ImageImprovementComponent))).toBeNull();
  });

  it('should pass displaySource from data to ThoughtSummaryComponent', async () => {
    fixture.componentRef.setInput('data', {
      ...mockAnalysisData,
      displaySource: 'Cloud AI' as DisplaySource,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const thoughtSummaryEl = fixture.debugElement.query(By.directive(ThoughtSummaryComponent));
    expect(thoughtSummaryEl).toBeTruthy();
    const thoughtSummaryComp = thoughtSummaryEl.componentInstance as ThoughtSummaryComponent;
    expect(thoughtSummaryComp.displaySource()).toBe('Cloud AI');
  });

  it('should fallback displaySource to Unknown when data.displaySource is undefined', async () => {
    fixture.componentRef.setInput('data', {
      ...mockAnalysisData,
      displaySource: undefined,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const thoughtSummaryEl = fixture.debugElement.query(By.directive(ThoughtSummaryComponent));
    expect(thoughtSummaryEl).toBeTruthy();
    const thoughtSummaryComp = thoughtSummaryEl.componentInstance as ThoughtSummaryComponent;
    expect(thoughtSummaryComp.displaySource()).toBe('Unknown');
  });

  it('should hydrate ImageRecommendationComponent when Recommendations tab is selected', async () => {
    fixture.componentRef.setInput('data', mockAnalysisData);
    fixture.detectChanges();
    await fixture.whenStable();

    const tabButtons = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.tab-header-btn');
    tabButtons[1].click(); // Click "Recommendations" tab
    fixture.detectChanges();
    await fixture.whenStable();

    const recDebugEl = fixture.debugElement.query(By.directive(ImageRecommendationComponent));
    expect(recDebugEl).toBeTruthy();
    const recComp = recDebugEl.componentInstance as ImageRecommendationComponent;
    expect(recComp.recommendations()).toEqual(mockAnalysisData.analysis.recommendations);
  });

  it('should hydrate TokenAnalyticsComponent when Token Usage tab is selected', async () => {
    fixture.componentRef.setInput('data', mockAnalysisData);
    fixture.detectChanges();
    await fixture.whenStable();

    const tabButtons = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.tab-header-btn');
    tabButtons[2].click(); // Click "Token Usage" tab
    fixture.detectChanges();
    await fixture.whenStable();

    const tokenDebugEl = fixture.debugElement.query(By.directive(TokenAnalyticsComponent));
    expect(tokenDebugEl).toBeTruthy();
    const tokenComp = tokenDebugEl.componentInstance as TokenAnalyticsComponent;
    expect(tokenComp.tokenSummary()).toEqual(mockAnalysisData.tokenSummary);
    expect(tokenComp.tokenModalityBreakdown()).toEqual(mockAnalysisData.tokenModalityBreakdown);
  });

  it('should hydrate ImageImprovementComponent when Image Improvement tab is selected', async () => {
    fixture.componentRef.setInput('data', mockAnalysisData);
    fixture.componentRef.setInput('imageUrl', 'https://example.com/test.jpg');
    fixture.detectChanges();
    await fixture.whenStable();

    const tabButtons = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.tab-header-btn');
    tabButtons[3].click(); // Click "Image Improvement" tab
    fixture.detectChanges();
    await fixture.whenStable();

    const improveDebugEl = fixture.debugElement.query(By.directive(ImageImprovementComponent));
    expect(improveDebugEl).toBeTruthy();
    const improveComp = improveDebugEl.componentInstance as ImageImprovementComponent;
    expect(improveComp.analysis()).toEqual(mockAnalysisData.analysis);
    expect(improveComp.imageUrl()).toBe('https://example.com/test.jpg');
  });
});
