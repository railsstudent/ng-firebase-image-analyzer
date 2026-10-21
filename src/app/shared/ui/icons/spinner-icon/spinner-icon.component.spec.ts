import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerIconComponent } from './spinner-icon.component';

describe('SpinnerIconComponent', () => {
  let component: SpinnerIconComponent;
  let fixture: ComponentFixture<SpinnerIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerIconComponent);
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
