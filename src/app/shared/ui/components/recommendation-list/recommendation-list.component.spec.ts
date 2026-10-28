import { Component, input, provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { RecommendationItemComponent } from './recommendation-item.component';
import { RecommendationListComponent } from './recommendation-list.component';

@Component({
  imports: [RecommendationListComponent],
  template: `
    <app-recommendation-list [listTitle]="title()">
      <div class="test-child">Child Item</div>
    </app-recommendation-list>
  `,
})
class TestHostComponent {
  title = input<string | null>(null);
}

describe('RecommendationListComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, RecommendationListComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
  });

  it('should have role="list" and class="recommendations-list" on host element', () => {
    const listEl = fixture.nativeElement.querySelector('app-recommendation-list');
    expect(listEl).toBeTruthy();
    expect(listEl.getAttribute('role')).toBe('list');
    expect(listEl.classList.contains('recommendations-list')).toBe(true);
  });

  it('should project children into the default slot', () => {
    const childEl = fixture.nativeElement.querySelector('.test-child');
    expect(childEl).toBeTruthy();
    expect(childEl.textContent).toContain('Child Item');
  });

  it('should not render title paragraph when listTitle is null', () => {
    const titleEl = fixture.nativeElement.querySelector('.recommendation-list-title');
    expect(titleEl).toBeNull();
  });

  it('should render title paragraph when listTitle is provided', async () => {
    fixture.componentRef.setInput('title', 'Alternative Suggestions');
    await fixture.whenStable();

    const titleEl = fixture.nativeElement.querySelector('.recommendation-list-title');
    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent).toContain('Alternative Suggestions');
  });
});

@Component({
  imports: [RecommendationListComponent, RecommendationItemComponent],
  template: `
    <app-recommendation-list [listTitle]="title()">
      <app-recommendation-item>
        <span indicator class="bullet-dot">Dot</span>
        <span title class="item-title-1">First Recommendation</span>
        Detailed reason for first item.
      </app-recommendation-item>
      <app-recommendation-item>
        <span title class="item-title-2">Second Recommendation</span>
        Detailed reason for second item without indicator.
      </app-recommendation-item>
    </app-recommendation-list>
  `,
})
class TestCompoundHostComponent {
  title = input<string | null>('Compound Test List');
}

describe('RecommendationListComponent with RecommendationItemComponent compound integration', () => {
  let fixture: ComponentFixture<TestCompoundHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCompoundHostComponent, RecommendationListComponent, RecommendationItemComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestCompoundHostComponent);
    await fixture.whenStable();
  });

  it('should render parent with role="list" containing children with role="listitem"', () => {
    const listEl = fixture.nativeElement.querySelector('app-recommendation-list');
    expect(listEl).toBeTruthy();
    expect(listEl.getAttribute('role')).toBe('list');

    const itemElements = fixture.nativeElement.querySelectorAll('app-recommendation-item');
    expect(itemElements.length).toBe(2);
    for (const item of itemElements) {
      expect(item.getAttribute('role')).toBe('listitem');
    }
  });

  it('should project slotted indicators, titles, and body content into each compound item', () => {
    const firstTitleP = fixture.nativeElement.querySelector('.item-title-1');
    expect(firstTitleP?.textContent).toContain('First Recommendation');

    const indicator = fixture.nativeElement.querySelector('.bullet-dot');
    expect(indicator?.textContent).toContain('Dot');

    const secondTitleP = fixture.nativeElement.querySelector('.item-title-2');
    expect(secondTitleP?.textContent).toContain('Second Recommendation');
  });

  it('should dynamically update or clear list title in compound layout', async () => {
    fixture.componentRef.setInput('title', null);
    await fixture.whenStable();

    const titleEl = fixture.nativeElement.querySelector('.recommendation-list-title');
    expect(titleEl).toBeNull();
  });
});
