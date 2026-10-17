import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpandMoreIconComponent } from './expand-more-icon.component';

describe('ExpandMoreIconComponent', () => {
  let component: ExpandMoreIconComponent;
  let fixture: ComponentFixture<ExpandMoreIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpandMoreIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpandMoreIconComponent);
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
