import type { StreamingCulinaryDiscoveryWithMetadata } from '@/core/culinary-guide';
import { ListSkeletonComponent } from '@/shared/ui/components/skeleton/list-skeleton.component';
import { ThoughtSummaryComponent } from '@/shared/ui/components/thought-summary/thought-summary.component';
import { TokenAnalyticsComponent } from '@/shared/ui/components/token-analytics/token-analytics.component';
import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CulinaryDiscoveryPanelComponent } from './culinary-discovery-panel.component';

describe('CulinaryDiscoveryPanelComponent', () => {
  let component: CulinaryDiscoveryPanelComponent;
  let fixture: ComponentFixture<CulinaryDiscoveryPanelComponent>;

  const mockDiscoveryData: StreamingCulinaryDiscoveryWithMetadata = {
    foods: [
      { name: 'Pad Thai', description: 'Stir-fried rice noodles' },
      { name: 'Khao Soi', description: 'Coconut curry noodle soup' },
    ],
    honorableMentions: ['Tom Yum Goong', 'Som Tum'],
    thoughtSummary: 'Synthesized regional Thai culinary icons and honorable mentions.',
    tokenSummary: {
      totalTokenCount: 180,
      promptTokenCount: 120,
      thoughtsTokenCount: 0,
      cachedContentTokenCount: 0,
      outputTokenCount: 60,
    },
    tokenModalityBreakdown: {
      promptTokensDetails: [],
      outputTokensDetails: [],
      cacheTokensDetails: [],
    },
    source: 'on_device',
    displaySource: 'Gemini Nano',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CulinaryDiscoveryPanelComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(CulinaryDiscoveryPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render empty state card when discovery input is null', async () => {
    fixture.componentRef.setInput('discovery', null);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyCard = compiled.querySelector('.section-card .empty-state-text');
    expect(emptyCard?.textContent).toContain(
      'No culinary discovery results available yet. Select a destination to explore iconic dishes and AI insights.',
    );
    expect(compiled.querySelector('.panel-container')).toBeNull();
  });

  it('should render panel container when discovery data is provided', async () => {
    fixture.componentRef.setInput('discovery', mockDiscoveryData);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.panel-container')).toBeTruthy();
    expect(compiled.querySelector('.empty-state-text')).toBeNull();
  });

  it('should discover both tab headers on initial render', async () => {
    fixture.componentRef.setInput('discovery', mockDiscoveryData);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const tabButtons = compiled.querySelectorAll('.tab-header-btn');
    expect(tabButtons.length).toBe(2);
    expect(tabButtons[0].textContent).toContain('Thought Summary');
    expect(tabButtons[1].textContent).toContain('Token Usage');
  });

  it('should immediately render default active ThoughtSummaryComponent with honorable mentions and remarksTitle', async () => {
    fixture.componentRef.setInput('discovery', mockDiscoveryData);
    fixture.detectChanges();
    await fixture.whenStable();

    const thoughtSummaryEl = fixture.debugElement.query(By.directive(ThoughtSummaryComponent));
    expect(thoughtSummaryEl).toBeTruthy();
    const thoughtSummaryComp = thoughtSummaryEl.componentInstance as ThoughtSummaryComponent;
    expect(thoughtSummaryComp.thoughtSummary()).toBe(
      'Synthesized regional Thai culinary icons and honorable mentions.',
    );
    expect(thoughtSummaryComp.displaySource()).toBe('Gemini Nano');
    expect(thoughtSummaryComp.remarksTitle()).toBe('Honorable Mention Dishes');
    expect(thoughtSummaryComp.remarks()).toEqual(['Tom Yum Goong', 'Som Tum']);

    // Inactive tab renders skeleton placeholder initially
    expect(fixture.debugElement.query(By.directive(ListSkeletonComponent))).toBeTruthy();

    // Deferred TokenAnalyticsComponent is not yet rendered
    expect(fixture.debugElement.query(By.directive(TokenAnalyticsComponent))).toBeNull();
  });

  it('should pass displaySource from discovery to ThoughtSummaryComponent', async () => {
    fixture.componentRef.setInput('discovery', {
      ...mockDiscoveryData,
      displaySource: 'Cloud AI' as const,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const thoughtSummaryEl = fixture.debugElement.query(By.directive(ThoughtSummaryComponent));
    expect(thoughtSummaryEl).toBeTruthy();
    const thoughtSummaryComp = thoughtSummaryEl.componentInstance as ThoughtSummaryComponent;
    expect(thoughtSummaryComp.displaySource()).toBe('Cloud AI');
  });

  it('should fallback displaySource to Unknown when discovery.displaySource is undefined', async () => {
    fixture.componentRef.setInput('discovery', {
      ...mockDiscoveryData,
      displaySource: undefined,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const thoughtSummaryEl = fixture.debugElement.query(By.directive(ThoughtSummaryComponent));
    expect(thoughtSummaryEl).toBeTruthy();
    const thoughtSummaryComp = thoughtSummaryEl.componentInstance as ThoughtSummaryComponent;
    expect(thoughtSummaryComp.displaySource()).toBe('Unknown');
  });

  it('should fallback thoughtSummary to default copy when discovery.thoughtSummary is empty or undefined', async () => {
    fixture.componentRef.setInput('discovery', {
      ...mockDiscoveryData,
      thoughtSummary: '',
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const thoughtSummaryEl = fixture.debugElement.query(By.directive(ThoughtSummaryComponent));
    expect(thoughtSummaryEl).toBeTruthy();
    const thoughtSummaryComp = thoughtSummaryEl.componentInstance as ThoughtSummaryComponent;
    expect(thoughtSummaryComp.thoughtSummary()).toBe('No technical logs provided.');
  });

  it('should pass undefined remarks to ThoughtSummaryComponent when honorableMentions is empty', async () => {
    fixture.componentRef.setInput('discovery', {
      ...mockDiscoveryData,
      honorableMentions: [],
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const thoughtSummaryEl = fixture.debugElement.query(By.directive(ThoughtSummaryComponent));
    expect(thoughtSummaryEl).toBeTruthy();
    const thoughtSummaryComp = thoughtSummaryEl.componentInstance as ThoughtSummaryComponent;
    expect(thoughtSummaryComp.remarks()).toBeUndefined();
  });

  it('should hydrate TokenAnalyticsComponent when Token Usage tab is selected', async () => {
    fixture.componentRef.setInput('discovery', mockDiscoveryData);
    fixture.detectChanges();
    await fixture.whenStable();

    const tabButtons = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.tab-header-btn');
    tabButtons[1].click(); // Click "Token Usage" tab
    fixture.detectChanges();
    await fixture.whenStable();

    const tokenDebugEl = fixture.debugElement.query(By.directive(TokenAnalyticsComponent));
    expect(tokenDebugEl).toBeTruthy();
    const tokenComp = tokenDebugEl.componentInstance as TokenAnalyticsComponent;
    expect(tokenComp.tokenSummary()).toEqual(mockDiscoveryData.tokenSummary);
    expect(tokenComp.tokenModalityBreakdown()).toEqual(mockDiscoveryData.tokenModalityBreakdown);
  });
});
