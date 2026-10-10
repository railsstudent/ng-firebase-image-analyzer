import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SellIconComponent } from './sell-icon.component';

describe('SellIconComponent', () => {
  let component: SellIconComponent;
  let fixture: ComponentFixture<SellIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SellIconComponent);
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
