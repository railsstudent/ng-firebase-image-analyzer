import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThoughtSummaryComponent } from './thought-summary.component';

describe('ThoughtSummaryComponent', () => {
  let component: ThoughtSummaryComponent;
  let fixture: ComponentFixture<ThoughtSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThoughtSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThoughtSummaryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
