import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecommendationItemComponent } from './recommendation-item.component';

@Component({
  imports: [RecommendationItemComponent],
  template: `
    <app-recommendation-item>
      <span indicator class="test-indicator">Bullet</span>
      <span title class="test-title">Focus & Composition</span>
      Apply rule of thirds for better balance.
    </app-recommendation-item>
  `,
})
class TestHostComponent {}

describe('RecommendationItemComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, RecommendationItemComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
  });

  it('should have role="listitem" and class="recommendation-item" on host element', () => {
    const itemEl = fixture.nativeElement.querySelector('app-recommendation-item');
    expect(itemEl).toBeTruthy();
    expect(itemEl.getAttribute('role')).toBe('listitem');
    expect(itemEl.classList.contains('recommendation-item')).toBe(true);
  });

  it('should project indicator and title into .recommendation-item-title paragraph', () => {
    const titleP = fixture.nativeElement.querySelector('.recommendation-item-title');
    expect(titleP).toBeTruthy();

    const indicator = titleP.querySelector('.test-indicator');
    expect(indicator?.textContent).toContain('Bullet');

    const title = titleP.querySelector('.test-title');
    expect(title?.textContent).toContain('Focus & Composition');
  });

  it('should project default content into .recommendation-item-reason paragraph', () => {
    const reasonP = fixture.nativeElement.querySelector('.recommendation-item-reason');
    expect(reasonP).toBeTruthy();
    expect(reasonP.textContent).toContain('Apply rule of thirds for better balance.');
  });
});

@Component({
  imports: [RecommendationItemComponent],
  template: `
    <app-recommendation-item>
      <span title class="test-title-only">1. Alternative Suggestion</span>
      High contrast recommendation without indicator.
    </app-recommendation-item>
  `,
})
class TestHostWithoutIndicatorComponent {}

describe('RecommendationItemComponent without indicator', () => {
  let fixture: ComponentFixture<TestHostWithoutIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostWithoutIndicatorComponent, RecommendationItemComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostWithoutIndicatorComponent);
    await fixture.whenStable();
  });

  it('should render title correctly when indicator is omitted', () => {
    const titleP = fixture.nativeElement.querySelector('.recommendation-item-title');
    expect(titleP).toBeTruthy();

    const indicator = titleP.querySelector('.test-indicator');
    expect(indicator).toBeNull();

    const title = titleP.querySelector('.test-title-only');
    expect(title?.textContent).toContain('1. Alternative Suggestion');
  });

  it('should render reason text correctly when indicator is omitted', () => {
    const reasonP = fixture.nativeElement.querySelector('.recommendation-item-reason');
    expect(reasonP).toBeTruthy();
    expect(reasonP.textContent).toContain('High contrast recommendation without indicator.');
  });
});
