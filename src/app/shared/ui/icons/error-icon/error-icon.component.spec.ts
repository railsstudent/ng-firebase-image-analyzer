import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { ErrorIconComponent } from './error-icon.component';

describe('ErrorIconComponent', () => {
  let component: ErrorIconComponent;
  let fixture: ComponentFixture<ErrorIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorIconComponent);
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
