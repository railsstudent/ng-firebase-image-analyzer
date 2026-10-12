import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TokenAnalyticsSkeletonComponent } from './token-analytics-skeleton.component';

describe('TokenAnalyticsSkeletonComponent', () => {
  let component: TokenAnalyticsSkeletonComponent;
  let fixture: ComponentFixture<TokenAnalyticsSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenAnalyticsSkeletonComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TokenAnalyticsSkeletonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render skeleton shimmer placeholders', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.animate-pulse')).toBeTruthy();
    expect(compiled.querySelectorAll('.skeleton-bar').length).toBeGreaterThanOrEqual(3);
    expect(compiled.querySelector('.skeleton-card')).toBeTruthy();
    expect(compiled.querySelectorAll('.skeleton-legend .skeleton-line').length).toBe(4);
  });
});
