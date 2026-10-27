import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { DownloadIconComponent } from './download-icon.component';

describe('DownloadIconComponent', () => {
  let component: DownloadIconComponent;
  let fixture: ComponentFixture<DownloadIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadIconComponent);
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
