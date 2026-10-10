import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArrowForwardIconComponent } from './arrow-forward-icon.component';

describe('ArrowForwardIconComponent', () => {
  let component: ArrowForwardIconComponent;
  let fixture: ComponentFixture<ArrowForwardIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrowForwardIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArrowForwardIconComponent);
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
