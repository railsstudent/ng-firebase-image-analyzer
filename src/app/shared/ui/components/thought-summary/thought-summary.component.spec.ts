import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThoughtSummaryComponent } from './thought-summary.component';

describe('ThoughtSummaryComponent', () => {
  let component: ThoughtSummaryComponent;
  let fixture: ComponentFixture<ThoughtSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThoughtSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThoughtSummaryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render ListSkeletonComponent when remarks is undefined', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-list-skeleton')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-recommendation-list')).toBeNull();
  });

  it('should render recommendation list when remarks are provided', async () => {
    fixture.componentRef.setInput('remarks', ['Good lighting setup', 'High contrast captured nicely']);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-list-skeleton')).toBeNull();
    const listEl = fixture.nativeElement.querySelector('app-recommendation-list');
    expect(listEl).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('1. Good lighting setup');
    expect(fixture.nativeElement.textContent).toContain('2. High contrast captured nicely');
  });
});
