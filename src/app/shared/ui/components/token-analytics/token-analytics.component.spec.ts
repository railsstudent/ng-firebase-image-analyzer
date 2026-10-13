import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TokenAnalyticsSkeletonComponent } from '@/shared/ui/components/token-analytics-skeleton/token-analytics-skeleton.component';
import { TokenAnalyticsComponent } from './token-analytics.component';

describe('TokenAnalyticsComponent', () => {
  let component: TokenAnalyticsComponent;
  let fixture: ComponentFixture<TokenAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenAnalyticsComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TokenAnalyticsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render skeleton fallback when tokenSummary is undefined', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const skeletonEl = fixture.debugElement.query(By.directive(TokenAnalyticsSkeletonComponent));
    expect(skeletonEl).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.token-header')).toBeNull();
  });

  it('should render token details when tokenSummary is provided', async () => {
    fixture.componentRef.setInput('tokenSummary', {
      totalTokenCount: 150,
      promptTokenCount: 100,
      outputTokenCount: 50,
      cachedContentTokenCount: 10,
      thoughtsTokenCount: 5,
    });
    fixture.componentRef.setInput('tokenModalityBreakdown', {
      promptTokensDetails: [
        { modality: 'IMAGE', tokenCount: 80 },
        { modality: 'TEXT', tokenCount: 20 },
      ],
      outputTokensDetails: [{ modality: 'TEXT', tokenCount: 50 }],
      cacheTokensDetails: [{ modality: 'TEXT', tokenCount: 10 }],
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const skeletonEl = fixture.debugElement.query(By.directive(TokenAnalyticsSkeletonComponent));
    expect(skeletonEl).toBeNull();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.token-header-total')?.textContent).toContain('150 Tokens');
    expect(compiled.querySelector('.cached-savings-value')?.textContent).toContain('-10 Tokens');
  });
});
