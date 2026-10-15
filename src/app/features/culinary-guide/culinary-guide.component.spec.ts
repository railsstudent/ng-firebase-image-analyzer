import { ComponentFixture, TestBed } from '@angular/core/testing';
import CulinaryGuideComponent from './culinary-guide.component';

describe('CulinaryGuideComponent', () => {
  let component: CulinaryGuideComponent;
  let fixture: ComponentFixture<CulinaryGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CulinaryGuideComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CulinaryGuideComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
