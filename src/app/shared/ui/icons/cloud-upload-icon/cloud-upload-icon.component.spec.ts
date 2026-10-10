import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CloudUploadIconComponent } from './cloud-upload-icon.component';

describe('CloudUploadIconComponent', () => {
  let component: CloudUploadIconComponent;
  let fixture: ComponentFixture<CloudUploadIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloudUploadIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CloudUploadIconComponent);
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
