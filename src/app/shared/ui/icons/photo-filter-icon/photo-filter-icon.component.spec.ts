import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { PhotoFilterIconComponent } from './photo-filter-icon.component';

describe('PhotoFilterIconComponent', () => {
  let component: PhotoFilterIconComponent;
  let fixture: ComponentFixture<PhotoFilterIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoFilterIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoFilterIconComponent);
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
