import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutoAwesomeIconComponent } from './auto-awesome-icon.component';

describe('AutoAwesomeIconComponent', () => {
  let component: AutoAwesomeIconComponent;
  let fixture: ComponentFixture<AutoAwesomeIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoAwesomeIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AutoAwesomeIconComponent);
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
