import { Component, input, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
