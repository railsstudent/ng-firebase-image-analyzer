import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemUpdateAltIconComponent } from './system-update-alt-icon.component';

describe('SystemUpdateAltIconComponent', () => {
  let component: SystemUpdateAltIconComponent;
  let fixture: ComponentFixture<SystemUpdateAltIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemUpdateAltIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemUpdateAltIconComponent);
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
