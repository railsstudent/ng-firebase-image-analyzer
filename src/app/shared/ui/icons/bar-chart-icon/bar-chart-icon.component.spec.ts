import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarChartIconComponent } from './bar-chart-icon.component';

describe('BarChartIconComponent', () => {
  let component: BarChartIconComponent;
  let fixture: ComponentFixture<BarChartIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarChartIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BarChartIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an svg element with aria-hidden="true"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const svg = compiled.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});
