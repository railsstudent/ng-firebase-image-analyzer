import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SyncIconComponent } from './sync-icon.component';

describe('SyncIconComponent', () => {
  let component: SyncIconComponent;
  let fixture: ComponentFixture<SyncIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyncIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SyncIconComponent);
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
