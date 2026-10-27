import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { PsychologyIconComponent } from './psychology-icon.component';

describe('PsychologyIconComponent', () => {
  let component: PsychologyIconComponent;
  let fixture: ComponentFixture<PsychologyIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PsychologyIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PsychologyIconComponent);
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
