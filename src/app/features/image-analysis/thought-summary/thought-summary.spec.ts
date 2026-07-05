import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThoughtSummary } from './thought-summary';

describe('ThoughtSummary', () => {
  let component: ThoughtSummary;
  let fixture: ComponentFixture<ThoughtSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThoughtSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(ThoughtSummary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
